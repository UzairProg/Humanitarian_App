import {
  VerificationStatus,
  PermissionKey,
  RoleType,
  JwtPayload,
  AuditAction,
  ProgramStatus,
  RequestStatus,
} from '@al-husseiniya/types';
import { slugify } from '@al-husseiniya/utils';
import { OrganizationModel, OrganizationDocument } from '../../models/organization.model';
import { OrganizationMemberModel } from '../../models/organization-member.model';
import { OrganizationVerificationModel } from '../../models/organization-verification.model';
import { FoodProgramModel } from '../../models/food-program.model';
import { EventModel } from '../../models/event.model';
import { HumanitarianRequestModel } from '../../models/humanitarian-request.model';
import { impactService } from '../../services/impact.service';
import { auditService } from '../../services/audit.service';
import { notificationService } from '../../services/notification.service';
import { authorizationService } from '../../services/authorization.service';
import { AppError } from '../../middleware/error.middleware';

export interface CreateOrganizationInput {
  name: string;
  description: string;
  location: string;
  contactEmail: string;
  contactPhone?: string;
  logoUrl?: string;
}

export interface VerifyOrganizationInput {
  status: VerificationStatus;
  decision?: string;
  notes?: string;
}

export interface AddMemberInput {
  userId: string;
  role: string;
}

export class OrganizationsService {
  async create(
    input: CreateOrganizationInput,
    currentUser: JwtPayload,
  ): Promise<OrganizationDocument> {
    const baseSlug = slugify(input.name);
    let slug = baseSlug;
    let counter = 1;

    while (await OrganizationModel.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const savedOrg = await OrganizationModel.create({
      ...input,
      slug,
      verificationStatus: VerificationStatus.PENDING,
      createdById: currentUser.sub,
    });

    await OrganizationMemberModel.create({
      organizationId: savedOrg.id,
      userId: currentUser.sub,
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    await OrganizationVerificationModel.create({
      organizationId: savedOrg.id,
      status: VerificationStatus.PENDING,
      notes: 'Initial registration verification request',
    });

    await auditService.record({
      actorId: currentUser.sub,
      action: AuditAction.CREATE,
      targetType: 'ORGANIZATION',
      targetId: savedOrg.id,
      metadata: { name: savedOrg.name, slug: savedOrg.slug },
    });

    return savedOrg;
  }

  async list(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      verificationStatus?: VerificationStatus;
      location?: string;
    } = {},
  ): Promise<{ items: any[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;

    const filter: any = {};
    if (options.verificationStatus) {
      filter.verificationStatus = options.verificationStatus;
    }
    if (options.location) {
      filter.location = { $regex: options.location, $options: 'i' };
    }
    if (options.search) {
      filter.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { description: { $regex: options.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      OrganizationModel.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      OrganizationModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((i) => i.toJSON()),
      total,
    };
  }

  async getById(id: string): Promise<any> {
    const org = await OrganizationModel.findById(id).exec();
    if (!org) {
      throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND');
    }

    // Include public active programs, events, and impact
    const [foodPrograms, events, impact] = await Promise.all([
      FoodProgramModel.find({
        organizationId: id,
        status: {
          $in: [
            ProgramStatus.ACTIVE,
            ProgramStatus.OPEN,
            ProgramStatus.PUBLISHED,
            ProgramStatus.LIMITED,
          ],
        },
      })
        .limit(5)
        .sort({ programDate: 1 })
        .exec(),
      EventModel.find({ organizationId: id, status: 'PUBLISHED' })
        .limit(5)
        .sort({ startAt: 1 })
        .exec(),
      impactService.getOrganizationImpact(id),
    ]);

    return {
      ...org.toJSON(),
      activeFoodPrograms: foodPrograms.map((p) => p.toJSON()),
      upcomingEvents: events.map((e) => e.toJSON()),
      impact,
    };
  }

  async getDashboard(orgId: string, currentUser: JwtPayload): Promise<any> {
    const userMemberships = await OrganizationMemberModel.find({
      userId: currentUser.sub,
    }).exec();
    const userOrgIds = userMemberships.map((m) => m.organizationId);

    authorizationService.assertCanAccessOrganization(currentUser, orgId, userOrgIds);

    const [org, requests, foodPrograms, events, members, impact] = await Promise.all([
      OrganizationModel.findById(orgId).exec(),
      HumanitarianRequestModel.find({
        $or: [{ organizationId: orgId }, { matchedOrganizationId: orgId }],
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .exec(),
      FoodProgramModel.find({ organizationId: orgId }).sort({ programDate: 1 }).exec(),
      EventModel.find({ organizationId: orgId }).sort({ startAt: 1 }).exec(),
      OrganizationMemberModel.find({ organizationId: orgId }).exec(),
      impactService.getOrganizationImpact(orgId),
    ]);

    if (!org) {
      throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND');
    }

    const pendingRequestsCount = requests.filter(
      (r) =>
        r.status === RequestStatus.SUBMITTED ||
        r.status === RequestStatus.UNDER_REVIEW ||
        r.status === RequestStatus.MATCHED,
    ).length;

    return {
      organization: org.toJSON(),
      requests: requests.map((r) => r.toJSON()),
      foodPrograms: foodPrograms.map((p) => p.toJSON()),
      events: events.map((e) => e.toJSON()),
      memberCount: members.length,
      pendingRequestsCount,
      impact,
    };
  }

  async verify(
    orgId: string,
    input: VerifyOrganizationInput,
    reviewer: JwtPayload,
  ): Promise<OrganizationDocument> {
    authorizationService.assertCanVerifyEntity(reviewer, PermissionKey.ORGANIZATION_VERIFY);

    const org = await OrganizationModel.findById(orgId).exec();
    if (!org) {
      throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND');
    }

    org.verificationStatus = input.status;
    const updated = await org.save();

    await OrganizationVerificationModel.create({
      organizationId: org.id,
      status: input.status,
      reviewerId: reviewer.sub,
      decision: input.decision || null,
      notes: input.notes || null,
      reviewedAt: new Date(),
    });

    await notificationService.create({
      userId: org.createdById,
      type: 'ORGANIZATION_VERIFICATION',
      title: `Organization Status: ${input.status}`,
      body: `Your organization "${org.name}" verification status has been updated to ${input.status}.`,
      referenceType: 'ORGANIZATION',
      referenceId: org.id,
    });

    await auditService.record({
      actorId: reviewer.sub,
      action: AuditAction.VERIFY,
      targetType: 'ORGANIZATION',
      targetId: org.id,
      metadata: { newStatus: input.status, decision: input.decision },
    });

    return updated;
  }

  async getMembers(orgId: string, currentUser: JwtPayload): Promise<any[]> {
    const userMemberships = await OrganizationMemberModel.find({
      userId: currentUser.sub,
    }).exec();
    const userOrgIds = userMemberships.map((m) => m.organizationId);

    authorizationService.assertCanAccessOrganization(currentUser, orgId, userOrgIds);

    const members = await OrganizationMemberModel.find({ organizationId: orgId }).exec();
    return members.map((m) => m.toJSON());
  }

  async addMember(
    orgId: string,
    input: AddMemberInput,
    currentUser: JwtPayload,
  ): Promise<any> {
    const userMemberships = await OrganizationMemberModel.find({
      userId: currentUser.sub,
    }).exec();
    const isAdmin =
      currentUser.roles.includes(RoleType.SUPER_ADMIN) ||
      userMemberships.some((m) => m.organizationId === orgId && m.role === 'ADMIN');

    if (!isAdmin) {
      throw new AppError('Only organization administrators can add members', 403, 'FORBIDDEN');
    }

    const existing = await OrganizationMemberModel.findOne({
      organizationId: orgId,
      userId: input.userId,
    });
    if (existing) {
      throw new AppError('User is already a member of this organization', 409, 'CONFLICT');
    }

    const member = await OrganizationMemberModel.create({
      organizationId: orgId,
      userId: input.userId,
      role: input.role || 'MEMBER',
      status: 'ACTIVE',
    });

    return member.toJSON();
  }
}

export const organizationsService = new OrganizationsService();
