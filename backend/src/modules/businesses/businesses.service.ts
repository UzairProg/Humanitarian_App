import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  VerificationStatus,
  PermissionKey,
  JwtPayload,
  AuditAction,
} from '@al-husseiniya/types';
import { Business, BusinessDocument } from '../../database/schemas/business.schema';
import { BusinessVerification, BusinessVerificationDocument } from '../../database/schemas/business-verification.schema';
import { AuthorizationService } from '../../common/authorization/authorization.service';
import { AuditService } from '../../infrastructure/audit/audit.service';

export interface CreateBusinessDto {
  name: string;
  category: string;
  description: string;
  location: string;
  contactEmail: string;
  contactPhone?: string;
}

export interface VerifyBusinessDto {
  status: VerificationStatus;
  decision?: string;
  notes?: string;
}

@Injectable()
export class BusinessesService {
  constructor(
    @InjectModel(Business.name)
    private businessModel: Model<BusinessDocument>,
    @InjectModel(BusinessVerification.name)
    private verifModel: Model<BusinessVerificationDocument>,
    private authzService: AuthorizationService,
    private auditService: AuditService,
  ) {}

  async create(
    dto: CreateBusinessDto,
    currentUser: JwtPayload,
  ): Promise<Business> {
    const saved = await this.businessModel.create({
      ...dto,
      ownerId: currentUser.sub,
      verificationStatus: VerificationStatus.PENDING,
    });

    await this.verifModel.create({
      businessId: saved.id,
      status: VerificationStatus.PENDING,
      notes: 'Initial business registration submitted',
    });

    await this.auditService.record({
      actorId: currentUser.sub,
      action: AuditAction.CREATE,
      targetType: 'BUSINESS',
      targetId: saved.id,
      metadata: { name: saved.name },
    });

    return saved.toJSON();
  }

  async list(page = 1, limit = 20): Promise<{ items: Business[]; total: number }> {
    const [items, total] = await Promise.all([
      this.businessModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.businessModel.countDocuments().exec(),
    ]);

    return {
      items: items.map((b) => b.toJSON()),
      total,
    };
  }

  async getById(id: string): Promise<Business> {
    const biz = await this.businessModel.findById(id).exec();
    if (!biz) {
      throw new NotFoundException('Business not found');
    }
    return biz.toJSON();
  }

  async verify(
    businessId: string,
    dto: VerifyBusinessDto,
    reviewer: JwtPayload,
  ): Promise<Business> {
    this.authzService.assertCanVerifyEntity(reviewer, PermissionKey.BUSINESS_VERIFY);

    const business = await this.businessModel.findById(businessId).exec();
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    business.verificationStatus = dto.status;
    const updated = await business.save();

    await this.verifModel.create({
      businessId: business.id,
      status: dto.status,
      reviewerId: reviewer.sub,
      decision: dto.decision || null,
      notes: dto.notes || null,
      reviewedAt: new Date(),
    });

    await this.auditService.record({
      actorId: reviewer.sub,
      action: AuditAction.VERIFY,
      targetType: 'BUSINESS',
      targetId: business.id,
      metadata: { newStatus: dto.status, decision: dto.decision },
    });

    return updated.toJSON();
  }
}
