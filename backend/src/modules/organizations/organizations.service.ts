import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  VerificationStatus,
  PermissionKey,
  RoleType,
  JwtPayload,
  AuditAction,
} from '@al-husseiniya/types';
import { slugify } from '@al-husseiniya/utils';
import { Organization, OrganizationDocument } from '../../database/schemas/organization.schema';
import { OrganizationMember, OrganizationMemberDocument } from '../../database/schemas/organization-member.schema';
import { OrganizationVerification, OrganizationVerificationDocument } from '../../database/schemas/organization-verification.schema';
import {
  CreateOrganizationDto,
  VerifyOrganizationDto,
  AddMemberDto,
} from './dto/organization.dto';
import { AuthorizationService } from '../../common/authorization/authorization.service';
import { AuditService } from '../../infrastructure/audit/audit.service';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name)
    private orgModel: Model<OrganizationDocument>,
    @InjectModel(OrganizationMember.name)
    private memberModel: Model<OrganizationMemberDocument>,
    @InjectModel(OrganizationVerification.name)
    private verifModel: Model<OrganizationVerificationDocument>,
    private authzService: AuthorizationService,
    private auditService: AuditService,
  ) {}

  async create(
    dto: CreateOrganizationDto,
    currentUser: JwtPayload,
  ): Promise<Organization> {
    const baseSlug = slugify(dto.name);
    let slug = baseSlug;
    let counter = 1;

    while (await this.orgModel.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const savedOrg = await this.orgModel.create({
      ...dto,
      slug,
      verificationStatus: VerificationStatus.PENDING,
      createdById: currentUser.sub,
    });

    await this.memberModel.create({
      organizationId: savedOrg.id,
      userId: currentUser.sub,
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    await this.verifModel.create({
      organizationId: savedOrg.id,
      status: VerificationStatus.PENDING,
      notes: 'Initial registration verification request',
    });

    await this.auditService.record({
      actorId: currentUser.sub,
      action: AuditAction.CREATE,
      targetType: 'ORGANIZATION',
      targetId: savedOrg.id,
      metadata: { name: savedOrg.name, slug: savedOrg.slug },
    });

    return savedOrg.toJSON();
  }

  async list(page = 1, limit = 20): Promise<{ items: Organization[]; total: number }> {
    const [items, total] = await Promise.all([
      this.orgModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.orgModel.countDocuments().exec(),
    ]);

    return {
      items: items.map((i) => i.toJSON()),
      total,
    };
  }

  async getById(id: string): Promise<Organization> {
    const org = await this.orgModel.findById(id).exec();
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org.toJSON();
  }

  async verify(
    orgId: string,
    dto: VerifyOrganizationDto,
    reviewer: JwtPayload,
  ): Promise<Organization> {
    this.authzService.assertCanVerifyEntity(reviewer, PermissionKey.ORGANIZATION_VERIFY);

    const org = await this.orgModel.findById(orgId).exec();
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    org.verificationStatus = dto.status;
    const updated = await org.save();

    await this.verifModel.create({
      organizationId: org.id,
      status: dto.status,
      reviewerId: reviewer.sub,
      decision: dto.decision || null,
      notes: dto.notes || null,
      reviewedAt: new Date(),
    });

    await this.auditService.record({
      actorId: reviewer.sub,
      action: AuditAction.VERIFY,
      targetType: 'ORGANIZATION',
      targetId: org.id,
      metadata: { newStatus: dto.status, decision: dto.decision },
    });

    return updated.toJSON();
  }

  async getMembers(orgId: string, currentUser: JwtPayload): Promise<OrganizationMember[]> {
    const userMemberships = await this.memberModel.find({ userId: currentUser.sub }).exec();
    const userOrgIds = userMemberships.map((m) => m.organizationId);

    this.authzService.assertCanAccessOrganization(
      currentUser,
      orgId,
      userOrgIds,
    );

    return this.memberModel.find({ organizationId: orgId }).exec();
  }

  async addMember(
    orgId: string,
    dto: AddMemberDto,
    currentUser: JwtPayload,
  ): Promise<OrganizationMember> {
    const userMemberships = await this.memberModel.find({ userId: currentUser.sub }).exec();
    const isAdmin =
      currentUser.roles.includes(RoleType.SUPER_ADMIN) ||
      userMemberships.some((m) => m.organizationId === orgId && m.role === 'ADMIN');

    if (!isAdmin) {
      throw new ForbiddenException('Only organization administrators can add members');
    }

    const existing = await this.memberModel.findOne({
      organizationId: orgId,
      userId: dto.userId,
    });
    if (existing) {
      throw new ConflictException('User is already a member of this organization');
    }

    const member = await this.memberModel.create({
      organizationId: orgId,
      userId: dto.userId,
      role: dto.role,
      status: 'ACTIVE',
    });

    return member.toJSON();
  }
}
