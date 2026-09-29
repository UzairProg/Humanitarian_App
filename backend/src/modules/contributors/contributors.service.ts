import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ContributorType,
  ContributorReviewStatus,
  VerificationStatus,
  PermissionKey,
  JwtPayload,
  RoleType,
} from '@al-husseiniya/types';
import { ContributorProfile, ContributorProfileDocument } from '../../database/schemas/contributor-profile.schema';
import { ContributorReviewHistory, ContributorReviewHistoryDocument } from '../../database/schemas/contributor-review-history.schema';

export interface ApplyContributorDto {
  contributorType: ContributorType;
  biography: string;
  credentialsMetadata?: Record<string, any>;
}

export interface ReviewContributorDto {
  status: ContributorReviewStatus;
  notes?: string;
}

@Injectable()
export class ContributorsService {
  constructor(
    @InjectModel(ContributorProfile.name)
    private profileModel: Model<ContributorProfileDocument>,
    @InjectModel(ContributorReviewHistory.name)
    private historyModel: Model<ContributorReviewHistoryDocument>,
  ) {}

  async apply(
    dto: ApplyContributorDto,
    currentUser: JwtPayload,
  ): Promise<ContributorProfile> {
    const existing = await this.profileModel.findOne({
      userId: currentUser.sub,
    });
    if (existing) {
      throw new ConflictException('Contributor application already exists for this user');
    }

    const saved = await this.profileModel.create({
      userId: currentUser.sub,
      contributorType: dto.contributorType,
      biography: dto.biography,
      credentialsMetadata: dto.credentialsMetadata || null,
      verificationStatus: VerificationStatus.PENDING,
      reviewStatus: ContributorReviewStatus.SUBMITTED,
      visibility: false,
    });

    await this.historyModel.create({
      contributorProfileId: saved.id,
      status: ContributorReviewStatus.SUBMITTED,
      notes: 'Application submitted for administrative verification and specialist review',
    });

    return saved.toJSON();
  }

  async getMyProfile(currentUser: JwtPayload): Promise<ContributorProfile> {
    const profile = await this.profileModel.findOne({
      userId: currentUser.sub,
    }).exec();
    if (!profile) {
      throw new NotFoundException('No contributor profile registered for this account');
    }
    return profile.toJSON();
  }

  async getById(id: string): Promise<ContributorProfile> {
    const profile = await this.profileModel.findById(id).exec();
    if (!profile) {
      throw new NotFoundException('Contributor profile not found');
    }
    return profile.toJSON();
  }

  async review(
    profileId: string,
    dto: ReviewContributorDto,
    reviewer: JwtPayload,
  ): Promise<ContributorProfile> {
    const canReview =
      reviewer.roles.includes(RoleType.ADMIN) ||
      reviewer.roles.includes(RoleType.SUPER_ADMIN) ||
      reviewer.permissions.includes(PermissionKey.CONTRIBUTOR_REVIEW);

    if (!canReview) {
      throw new ForbiddenException('Unauthorized to review contributor profiles');
    }

    const profile = await this.profileModel.findById(profileId).exec();
    if (!profile) {
      throw new NotFoundException('Contributor profile not found');
    }

    profile.reviewStatus = dto.status;
    if (dto.status === ContributorReviewStatus.APPROVED) {
      profile.verificationStatus = VerificationStatus.APPROVED;
      profile.visibility = true;
    } else if (dto.status === ContributorReviewStatus.REJECTED) {
      profile.verificationStatus = VerificationStatus.REJECTED;
      profile.visibility = false;
    }

    const updated = await profile.save();

    await this.historyModel.create({
      contributorProfileId: profile.id,
      reviewerId: reviewer.sub,
      status: dto.status,
      notes: dto.notes || null,
    });

    return updated.toJSON();
  }

  async list(page = 1, limit = 20): Promise<{ items: ContributorProfile[]; total: number }> {
    const filter = { visibility: true };
    const [items, total] = await Promise.all([
      this.profileModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.profileModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((i) => i.toJSON()),
      total,
    };
  }
}
