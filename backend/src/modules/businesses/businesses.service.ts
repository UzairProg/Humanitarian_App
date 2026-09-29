import {
  VerificationStatus,
  PermissionKey,
  JwtPayload,
  RoleType,
  AuditAction,
  MetricType,
} from '@al-husseiniya/types';
import {
  BusinessModel,
  BusinessDocument,
  BusinessVerificationModel,
  BusinessVerificationDocument,
  BusinessParticipationModel,
  BusinessParticipationDocument,
} from '../../models';
import { AppError } from '../../middleware/error.middleware';
import { authorizationService } from '../../services/authorization.service';
import { auditService } from '../../services/audit.service';
import { notificationService } from '../../services/notification.service';
import { impactService } from '../../services/impact.service';

export interface CreateBusinessDto {
  name: string;
  category: string;
  description: string;
  location: string;
  contactEmail: string;
  contactPhone?: string;
  participationTypes?: string[];
}

export interface VerifyBusinessDto {
  status: VerificationStatus;
  decision?: string;
  notes?: string;
}

export interface CreateParticipationDto {
  programOrEventId?: string;
  participationType:
    | 'MEAL_SUPPORT'
    | 'SPONSORSHIP'
    | 'SURPLUS_FOOD'
    | 'VOLUNTEER_SUPPORT'
    | 'IN_KIND';
  description: string;
  quantity?: number;
  notes?: string;
}

export class BusinessesService {
  async create(
    dto: CreateBusinessDto,
    currentUser: JwtPayload,
  ): Promise<BusinessDocument> {
    const saved = await BusinessModel.create({
      ...dto,
      participationTypes: dto.participationTypes || ['MEAL_SUPPORT', 'IN_KIND'],
      ownerId: currentUser.sub,
      status: 'ACTIVE',
      verificationStatus: VerificationStatus.PENDING,
    });

    await BusinessVerificationModel.create({
      businessId: saved.id,
      status: VerificationStatus.PENDING,
      notes: 'Initial business registration submitted for community verification',
    });

    await auditService.record({
      actorId: currentUser.sub,
      action: AuditAction.CREATE,
      targetType: 'BUSINESS',
      targetId: saved.id,
      metadata: { name: saved.name },
    });

    return saved;
  }

  async list(params: {
    page?: number;
    limit?: number;
    category?: string;
    verifiedOnly?: boolean;
    search?: string;
  }): Promise<{ items: BusinessDocument[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);

    const filter: any = { status: 'ACTIVE' };
    if (params.verifiedOnly) {
      filter.verificationStatus = VerificationStatus.APPROVED;
    }
    if (params.category) {
      filter.category = params.category;
    }
    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
        { location: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      BusinessModel.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      BusinessModel.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }

  async getById(id: string): Promise<BusinessDocument> {
    const biz = await BusinessModel.findById(id).exec();
    if (!biz) {
      throw new AppError('Business not found', 404, 'NOT_FOUND');
    }
    return biz;
  }

  async update(
    id: string,
    dto: Partial<CreateBusinessDto>,
    user: JwtPayload,
  ): Promise<BusinessDocument> {
    const biz = await this.getById(id);

    const isAdmin =
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN);

    if (!isAdmin && biz.ownerId !== user.sub) {
      throw new AppError(
        'Forbidden: You are not authorized to update this business',
        403,
        'FORBIDDEN',
      );
    }

    if (dto.name) biz.name = dto.name;
    if (dto.category) biz.category = dto.category;
    if (dto.description) biz.description = dto.description;
    if (dto.location) biz.location = dto.location;
    if (dto.contactEmail) biz.contactEmail = dto.contactEmail;
    if (dto.contactPhone !== undefined) biz.contactPhone = dto.contactPhone;
    if (dto.participationTypes) biz.participationTypes = dto.participationTypes;

    await biz.save();

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.UPDATE,
      targetType: 'BUSINESS',
      targetId: biz.id,
      metadata: { name: biz.name },
    });

    return biz;
  }

  async verify(
    businessId: string,
    dto: VerifyBusinessDto,
    reviewer: JwtPayload,
  ): Promise<BusinessDocument> {
    authorizationService.assertCanVerifyEntity(
      reviewer,
      PermissionKey.BUSINESS_VERIFY,
    );

    const business = await this.getById(businessId);

    business.verificationStatus = dto.status;
    const updated = await business.save();

    await BusinessVerificationModel.create({
      businessId: business.id,
      status: dto.status,
      reviewerId: reviewer.sub,
      decision: dto.decision || null,
      notes: dto.notes || null,
      reviewedAt: new Date(),
    });

    await auditService.record({
      actorId: reviewer.sub,
      action: AuditAction.VERIFY,
      targetType: 'BUSINESS',
      targetId: business.id,
      metadata: { newStatus: dto.status, decision: dto.decision },
    });

    // Notify business owner
    await notificationService.create({
      userId: business.ownerId,
      type: 'business.verification.updated',
      title: `Business Verification ${dto.status}`,
      body:
        dto.status === VerificationStatus.APPROVED
          ? `Congratulations! "${business.name}" has been verified as a community partner merchant.`
          : `Verification status for "${business.name}" is now ${dto.status}.`,
      referenceType: 'BUSINESS',
      referenceId: business.id,
      payload: { status: dto.status, decision: dto.decision },
    });

    return updated;
  }

  async createParticipation(
    businessId: string,
    dto: CreateParticipationDto,
    user: JwtPayload,
  ): Promise<BusinessParticipationDocument> {
    const business = await this.getById(businessId);

    const isAdmin =
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN);

    if (!isAdmin && business.ownerId !== user.sub) {
      throw new AppError(
        'Forbidden: You are not authorized to create participation records for this business',
        403,
        'FORBIDDEN',
      );
    }

    const participation = await BusinessParticipationModel.create({
      businessId,
      programOrEventId: dto.programOrEventId || null,
      participationType: dto.participationType,
      description: dto.description,
      quantity: dto.quantity || 0,
      notes: dto.notes || null,
      status: 'SUBMITTED',
      submittedById: user.sub,
    });

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.CREATE,
      targetType: 'BUSINESS_PARTICIPATION',
      targetId: participation.id,
      metadata: { businessId, type: dto.participationType },
    });

    return participation;
  }

  async listParticipations(
    businessId: string,
    user: JwtPayload,
  ): Promise<BusinessParticipationDocument[]> {
    const business = await this.getById(businessId);

    const isPublic = business.verificationStatus === VerificationStatus.APPROVED;
    const isOwnerOrAdmin =
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN) ||
      business.ownerId === user.sub;

    if (!isPublic && !isOwnerOrAdmin) {
      throw new AppError(
        'Forbidden: Access denied to unverified business records',
        403,
        'FORBIDDEN',
      );
    }

    return BusinessParticipationModel.find({ businessId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateParticipationStatus(
    participationId: string,
    status: 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
    notes: string | undefined,
    user: JwtPayload,
  ): Promise<BusinessParticipationDocument> {
    const participation = await BusinessParticipationModel.findById(
      participationId,
    ).exec();
    if (!participation) {
      throw new AppError('Participation record not found', 404, 'NOT_FOUND');
    }

    const isAdmin =
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN) ||
      user.roles?.includes(RoleType.ORGANIZATION_ADMIN);

    if (!isAdmin) {
      throw new AppError(
        'Forbidden: Administrative authorization required to update participation status',
        403,
        'FORBIDDEN',
      );
    }

    participation.status = status;
    participation.reviewedById = user.sub;
    if (notes) participation.notes = notes;
    await participation.save();

    // If completed and meal support, record impact
    if (
      status === 'COMPLETED' &&
      participation.participationType === 'MEAL_SUPPORT' &&
      participation.quantity
    ) {
      await impactService.record({
        entityType: 'BUSINESS',
        entityId: participation.businessId,
        metricType: MetricType.MEALS_DISTRIBUTED,
        value: participation.quantity,
        source: `business_participation:${participation.id}`,
      });
    }

    // Notify submitter
    await notificationService.create({
      userId: participation.submittedById,
      type: 'business.participation.updated',
      title: `Community Support Offer ${status}`,
      body: `Your business contribution offer (${participation.participationType}) is now ${status}.`,
      referenceType: 'BUSINESS_PARTICIPATION',
      referenceId: participation.id,
      payload: { status },
    });

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.STATUS_CHANGE,
      targetType: 'BUSINESS_PARTICIPATION',
      targetId: participation.id,
      metadata: { status, reviewerId: user.sub },
    });

    return participation;
  }
}

export const businessesService = new BusinessesService();
