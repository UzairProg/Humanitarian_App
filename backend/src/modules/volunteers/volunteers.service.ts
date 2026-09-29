import { JwtPayload, RoleType, AuditAction, MetricType } from '@al-husseiniya/types';
import {
  VolunteerProfileModel,
  VolunteerProfileDocument,
  VolunteerOpportunityModel,
  VolunteerOpportunityDocument,
  VolunteerApplicationModel,
  VolunteerApplicationDocument,
  UserModel,
  OrganizationMemberModel,
} from '../../models';
import { AppError } from '../../middleware/error.middleware';
import { notificationService } from '../../services/notification.service';
import { auditService } from '../../services/audit.service';
import { impactService } from '../../services/impact.service';

export interface UpsertVolunteerProfileDto {
  skills?: string[];
  interests?: string[];
  availability?: string;
  location?: string;
  languages?: string[];
  preferredCategories?: string[];
  emergencyContact?: string;
}

export interface CreateOpportunityDto {
  organizationId: string;
  title: string;
  description: string;
  location: string;
  category?: string;
  remoteType?: 'ON_SITE' | 'REMOTE' | 'HYBRID';
  startAt: string | Date;
  endAt: string | Date;
  requirements?: string[];
  capacity?: number;
}

export class VolunteersService {
  async upsertProfile(
    userId: string,
    dto: UpsertVolunteerProfileDto,
  ): Promise<VolunteerProfileDocument> {
    let profile = await VolunteerProfileModel.findOne({ userId }).exec();

    if (!profile) {
      profile = await VolunteerProfileModel.create({
        userId,
        skills: dto.skills || [],
        interests: dto.interests || [],
        availability: dto.availability || 'Flexible',
        location: dto.location || 'Local Community',
        languages: dto.languages || ['en'],
        preferredCategories: dto.preferredCategories || [],
        emergencyContact: dto.emergencyContact || null,
        status: 'ACTIVE',
      });
    } else {
      if (dto.skills !== undefined) profile.skills = dto.skills;
      if (dto.interests !== undefined) profile.interests = dto.interests;
      if (dto.availability !== undefined) profile.availability = dto.availability;
      if (dto.location !== undefined) profile.location = dto.location;
      if (dto.languages !== undefined) profile.languages = dto.languages;
      if (dto.preferredCategories !== undefined)
        profile.preferredCategories = dto.preferredCategories;
      if (dto.emergencyContact !== undefined)
        profile.emergencyContact = dto.emergencyContact;
      await profile.save();
    }

    return profile;
  }

  async getMyProfile(userId: string): Promise<VolunteerProfileDocument | null> {
    return VolunteerProfileModel.findOne({ userId }).exec();
  }

  async createOpportunity(
    dto: CreateOpportunityDto,
    user: JwtPayload,
  ): Promise<VolunteerOpportunityDocument> {
    // Assert user belongs to organization or is admin
    const isAdmin =
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN);

    if (!isAdmin) {
      const membership = await OrganizationMemberModel.findOne({
        organizationId: dto.organizationId,
        userId: user.sub,
        status: 'ACTIVE',
      }).exec();

      if (!membership && user.orgId !== dto.organizationId) {
        throw new AppError(
          'Forbidden: You are not authorized to create opportunities for this organization',
          403,
          'FORBIDDEN',
        );
      }
    }

    const opportunity = await VolunteerOpportunityModel.create({
      organizationId: dto.organizationId,
      title: dto.title,
      description: dto.description,
      location: dto.location,
      category: dto.category || 'COMMUNITY_SERVICE',
      remoteType: dto.remoteType || 'ON_SITE',
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      requirements: dto.requirements || [],
      capacity: dto.capacity || 10,
      status: 'OPEN',
    });

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.CREATE,
      targetType: 'VOLUNTEER_OPPORTUNITY',
      targetId: opportunity.id,
      metadata: { title: opportunity.title, organizationId: opportunity.organizationId },
    });

    return opportunity;
  }

  async listOpportunities(params: {
    page?: number;
    limit?: number;
    organizationId?: string;
    category?: string;
    search?: string;
    status?: string;
  }): Promise<{ items: VolunteerOpportunityDocument[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);

    const filter: any = {};
    if (params.status) {
      filter.status = params.status;
    } else {
      filter.status = { $in: ['OPEN', 'FULL'] };
    }

    if (params.organizationId) {
      filter.organizationId = params.organizationId;
    }
    if (params.category) {
      filter.category = params.category;
    }
    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
        { location: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      VolunteerOpportunityModel.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ startAt: 1 })
        .exec(),
      VolunteerOpportunityModel.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }

  async getOpportunityById(id: string): Promise<VolunteerOpportunityDocument> {
    const opportunity = await VolunteerOpportunityModel.findById(id).exec();
    if (!opportunity) {
      throw new AppError('Volunteer opportunity not found', 404, 'NOT_FOUND');
    }
    return opportunity;
  }

  async updateOpportunity(
    id: string,
    dto: Partial<CreateOpportunityDto> & { status?: string },
    user: JwtPayload,
  ): Promise<VolunteerOpportunityDocument> {
    const opp = await this.getOpportunityById(id);

    const isAdmin =
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN);

    if (!isAdmin) {
      const membership = await OrganizationMemberModel.findOne({
        organizationId: opp.organizationId,
        userId: user.sub,
        status: 'ACTIVE',
      }).exec();

      if (!membership && user.orgId !== opp.organizationId) {
        throw new AppError(
          'Forbidden: You are not authorized to update this opportunity',
          403,
          'FORBIDDEN',
        );
      }
    }

    if (dto.title) opp.title = dto.title;
    if (dto.description) opp.description = dto.description;
    if (dto.location) opp.location = dto.location;
    if (dto.category) opp.category = dto.category;
    if (dto.remoteType) opp.remoteType = dto.remoteType;
    if (dto.startAt) opp.startAt = new Date(dto.startAt);
    if (dto.endAt) opp.endAt = new Date(dto.endAt);
    if (dto.requirements) opp.requirements = dto.requirements;
    if (dto.capacity !== undefined) opp.capacity = dto.capacity;
    if (dto.status) opp.status = dto.status;

    await opp.save();

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.UPDATE,
      targetType: 'VOLUNTEER_OPPORTUNITY',
      targetId: opp.id,
      metadata: { status: opp.status },
    });

    return opp;
  }

  async apply(
    opportunityId: string,
    user: JwtPayload,
    message?: string,
  ): Promise<VolunteerApplicationDocument> {
    const opp = await this.getOpportunityById(opportunityId);
    if (opp.status !== 'OPEN') {
      throw new AppError(
        'This opportunity is not currently accepting applications',
        400,
        'OPPORTUNITY_CLOSED',
      );
    }

    // Check existing application
    const existing = await VolunteerApplicationModel.findOne({
      opportunityId,
      userId: user.sub,
    }).exec();

    if (existing) {
      throw new AppError(
        'You have already applied to this opportunity',
        409,
        'DUPLICATE_APPLICATION',
      );
    }

    const application = await VolunteerApplicationModel.create({
      opportunityId,
      userId: user.sub,
      message: message || null,
      status: 'PENDING',
      appliedAt: new Date(),
    });

    // Notify user of submission
    await notificationService.create({
      userId: user.sub,
      type: 'volunteer.application.submitted',
      title: 'Volunteer Application Submitted',
      body: `Your application to serve for "${opp.title}" has been received and is pending organization review.`,
      referenceType: 'VOLUNTEER_OPPORTUNITY',
      referenceId: opp.id,
    });

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.CREATE,
      targetType: 'VOLUNTEER_APPLICATION',
      targetId: application.id,
      metadata: { opportunityId: opp.id },
    });

    return application;
  }

  async listApplicationsForOpportunity(
    opportunityId: string,
    user: JwtPayload,
  ): Promise<any[]> {
    const opp = await this.getOpportunityById(opportunityId);

    const isAdmin =
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN) ||
      user.roles?.includes(RoleType.MODERATOR);

    if (!isAdmin) {
      const membership = await OrganizationMemberModel.findOne({
        organizationId: opp.organizationId,
        userId: user.sub,
        status: 'ACTIVE',
      }).exec();

      if (!membership && user.orgId !== opp.organizationId) {
        throw new AppError(
          'Forbidden: Access denied to applicant details',
          403,
          'FORBIDDEN',
        );
      }
    }

    const applications = await VolunteerApplicationModel.find({ opportunityId })
      .sort({ appliedAt: -1 })
      .exec();

    // Populate user profile info safely
    const userIds = applications.map((a) => a.userId);
    const users = await UserModel.find({ _id: { $in: userIds } })
      .select('firstName lastName email avatarUrl')
      .exec();
    const userMap = new Map(users.map((u) => [u.id, u]));

    return applications.map((app) => {
      const u = userMap.get(app.userId);
      return {
        ...app.toJSON(),
        applicant: u
          ? {
              id: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              email: u.email,
              avatarUrl: u.avatarUrl,
            }
          : null,
      };
    });
  }

  async getMyApplications(userId: string): Promise<any[]> {
    const apps = await VolunteerApplicationModel.find({ userId })
      .sort({ appliedAt: -1 })
      .exec();

    const oppIds = apps.map((a) => a.opportunityId);
    const opps = await VolunteerOpportunityModel.find({ _id: { $in: oppIds } }).exec();
    const oppMap = new Map(opps.map((o) => [o.id, o]));

    return apps.map((app) => ({
      ...app.toJSON(),
      opportunity: oppMap.get(app.opportunityId)?.toJSON() || null,
    }));
  }

  async updateApplicationStatus(
    applicationId: string,
    status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED',
    reviewNotes: string | undefined,
    user: JwtPayload,
  ): Promise<VolunteerApplicationDocument> {
    const application = await VolunteerApplicationModel.findById(applicationId).exec();
    if (!application) {
      throw new AppError('Volunteer application not found', 404, 'NOT_FOUND');
    }

    const opp = await this.getOpportunityById(application.opportunityId);

    const isAdmin =
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN);

    if (!isAdmin) {
      const membership = await OrganizationMemberModel.findOne({
        organizationId: opp.organizationId,
        userId: user.sub,
        status: 'ACTIVE',
      }).exec();

      if (!membership && user.orgId !== opp.organizationId) {
        throw new AppError(
          'Forbidden: You are not authorized to review applications for this organization',
          403,
          'FORBIDDEN',
        );
      }
    }

    application.status = status;
    application.reviewedById = user.sub;
    application.reviewNotes = reviewNotes || null;
    application.reviewedAt = new Date();
    await application.save();

    // Check capacity if accepted
    if (status === 'ACCEPTED') {
      const acceptedCount = await VolunteerApplicationModel.countDocuments({
        opportunityId: opp.id,
        status: 'ACCEPTED',
      }).exec();

      if (acceptedCount >= opp.capacity) {
        opp.status = 'FULL';
        await opp.save();
      }
    }

    // Record impact if completed
    if (status === 'COMPLETED') {
      await impactService.record({
        entityType: 'ORGANIZATION',
        entityId: opp.organizationId,
        metricType: MetricType.VOLUNTEER_HOURS,
        value: 4, // standard community shift
        source: `volunteer_opp:${opp.id}`,
      });
    }

    // Notify applicant
    await notificationService.create({
      userId: application.userId,
      type: 'volunteer.application.updated',
      title: `Volunteer Application ${status}`,
      body:
        status === 'ACCEPTED'
          ? `Your application for "${opp.title}" has been ACCEPTED! The team looks forward to serving together.`
          : `Your application status for "${opp.title}" is now ${status}.`,
      referenceType: 'VOLUNTEER_APPLICATION',
      referenceId: application.id,
      payload: { status, reviewNotes },
    });

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.STATUS_CHANGE,
      targetType: 'VOLUNTEER_APPLICATION',
      targetId: application.id,
      metadata: { status, reviewerId: user.sub },
    });

    return application;
  }
}

export const volunteersService = new VolunteersService();
