import {
  ContributorType,
  ContributorReviewStatus,
  VerificationStatus,
  PermissionKey,
  JwtPayload,
  RoleType,
  AuditAction,
} from '@al-husseiniya/types';
import {
  ContributorProfileModel,
  ContributorProfileDocument,
  UserModel,
} from '../../models';
import { AppError } from '../../middleware/error.middleware';
import { auditService } from '../../services/audit.service';
import { notificationService } from '../../services/notification.service';

export interface ApplyContributorDto {
  contributorType: ContributorType;
  biography: string;
  credentialsMetadata?: Record<string, any>;
}

export interface ReviewContributorDto {
  status: ContributorReviewStatus;
  notes?: string;
}

export class ContributorsService {
  async apply(
    dto: ApplyContributorDto,
    currentUser: JwtPayload,
  ): Promise<ContributorProfileDocument> {
    const existing = await ContributorProfileModel.findOne({
      userId: currentUser.sub,
    }).exec();

    if (existing) {
      throw new AppError(
        'Contributor application already exists for this account',
        409,
        'DUPLICATE_APPLICATION',
      );
    }

    const saved = await ContributorProfileModel.create({
      userId: currentUser.sub,
      contributorType: dto.contributorType,
      biography: dto.biography,
      credentialsMetadata: dto.credentialsMetadata || null,
      verificationStatus: VerificationStatus.PENDING,
      reviewStatus: ContributorReviewStatus.SUBMITTED,
      visibility: false,
    });

    await auditService.record({
      actorId: currentUser.sub,
      action: AuditAction.CREATE,
      targetType: 'CONTRIBUTOR_PROFILE',
      targetId: saved.id,
      metadata: { contributorType: dto.contributorType },
    });

    return saved;
  }

  async getMyProfile(
    currentUser: JwtPayload,
  ): Promise<ContributorProfileDocument | null> {
    return ContributorProfileModel.findOne({ userId: currentUser.sub }).exec();
  }

  async getById(
    id: string,
    currentUser?: JwtPayload,
  ): Promise<any> {
    const profile = await ContributorProfileModel.findById(id).exec();
    if (!profile) {
      throw new AppError('Contributor profile not found', 404, 'NOT_FOUND');
    }

    const isOwner = currentUser && profile.userId === currentUser.sub;
    const isReviewer =
      currentUser &&
      (currentUser.roles?.includes(RoleType.SUPER_ADMIN) ||
        currentUser.roles?.includes(RoleType.ADMIN) ||
        currentUser.roles?.includes(RoleType.MODERATOR));

    if (!profile.visibility && !isOwner && !isReviewer) {
      throw new AppError(
        'Forbidden: Contributor profile is not public',
        403,
        'FORBIDDEN',
      );
    }

    const json = profile.toJSON();
    // Protect sensitive credentials metadata from public eyes
    if (!isOwner && !isReviewer) {
      delete json.credentialsMetadata;
      delete json.reviewNotes;
    }

    return json;
  }

  async review(
    profileId: string,
    dto: ReviewContributorDto,
    reviewer: JwtPayload,
  ): Promise<ContributorProfileDocument> {
    const canReview =
      reviewer.roles?.includes(RoleType.ADMIN) ||
      reviewer.roles?.includes(RoleType.SUPER_ADMIN) ||
      reviewer.permissions?.includes(PermissionKey.CONTRIBUTOR_REVIEW);

    if (!canReview) {
      throw new AppError(
        'Forbidden: Unauthorized to review contributor profiles',
        403,
        'FORBIDDEN',
      );
    }

    const profile = await ContributorProfileModel.findById(profileId).exec();
    if (!profile) {
      throw new AppError('Contributor profile not found', 404, 'NOT_FOUND');
    }

    profile.reviewStatus = dto.status;
    profile.reviewerId = reviewer.sub;
    profile.reviewNotes = dto.notes || null;
    profile.reviewedAt = new Date();

    if (dto.status === ContributorReviewStatus.APPROVED) {
      profile.verificationStatus = VerificationStatus.APPROVED;
      profile.visibility = true;

      // Assign CONTRIBUTOR role and permissions to user
      const user = await UserModel.findById(profile.userId).exec();
      if (user) {
        if (!user.roles.includes(RoleType.CONTRIBUTOR)) {
          user.roles.push(RoleType.CONTRIBUTOR);
          await user.save();
        }
      }
    } else if (dto.status === ContributorReviewStatus.REJECTED) {
      profile.verificationStatus = VerificationStatus.REJECTED;
      profile.visibility = false;
    }

    const updated = await profile.save();

    // Notify user of decision
    await notificationService.create({
      userId: profile.userId,
      type: 'contributor.application.updated',
      title: `Contributor Application ${dto.status}`,
      body:
        dto.status === ContributorReviewStatus.APPROVED
          ? 'Your application to author educational content has been approved! You may now submit articles for review.'
          : `Your contributor application status is now ${dto.status}.`,
      referenceType: 'CONTRIBUTOR_PROFILE',
      referenceId: profile.id,
      payload: { status: dto.status, notes: dto.notes },
    });

    await auditService.record({
      actorId: reviewer.sub,
      action: AuditAction.VERIFY,
      targetType: 'CONTRIBUTOR_PROFILE',
      targetId: profile.id,
      metadata: { status: dto.status, notes: dto.notes },
    });

    return updated;
  }

  async list(params: {
    page?: number;
    limit?: number;
    publicOnly?: boolean;
    status?: string;
  }): Promise<{ items: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);

    const filter: any = {};
    if (params.publicOnly) {
      filter.visibility = true;
      filter.verificationStatus = VerificationStatus.APPROVED;
    } else if (params.status) {
      filter.reviewStatus = params.status;
    }

    const [items, total] = await Promise.all([
      ContributorProfileModel.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      ContributorProfileModel.countDocuments(filter).exec(),
    ]);

    // Populate user name and avatar
    const userIds = items.map((i) => i.userId);
    const users = await UserModel.find({ _id: { $in: userIds } })
      .select('firstName lastName avatarUrl')
      .exec();
    const userMap = new Map(users.map((u) => [u.id, u]));

    const shaped = items.map((i) => {
      const u = userMap.get(i.userId);
      const json = i.toJSON();
      if (params.publicOnly) {
        delete json.credentialsMetadata;
        delete json.reviewNotes;
      }
      return {
        ...json,
        author: u
          ? {
              firstName: u.firstName,
              lastName: u.lastName,
              avatarUrl: u.avatarUrl,
            }
          : null,
      };
    });

    return { items: shaped, total };
  }
}

export const contributorsService = new ContributorsService();
