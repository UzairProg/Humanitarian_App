import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RequestStatus,
  RequestPriority,
  RoleType,
  JwtPayload,
  AuditAction,
} from '@al-husseiniya/types';
import { HumanitarianRequest, HumanitarianRequestDocument } from '../../database/schemas/humanitarian-request.schema';
import { RequestCategory, RequestCategoryDocument } from '../../database/schemas/request-category.schema';
import { RequestStatusHistory, RequestStatusHistoryDocument } from '../../database/schemas/request-status-history.schema';
import { CreateRequestDto, UpdateRequestStatusDto } from './dto/request.dto';
import { AuthorizationService } from '../../common/authorization/authorization.service';
import { AuditService } from '../../infrastructure/audit/audit.service';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(HumanitarianRequest.name)
    private requestModel: Model<HumanitarianRequestDocument>,
    @InjectModel(RequestCategory.name)
    private categoryModel: Model<RequestCategoryDocument>,
    @InjectModel(RequestStatusHistory.name)
    private historyModel: Model<RequestStatusHistoryDocument>,
    private authzService: AuthorizationService,
    private auditService: AuditService,
  ) {}

  async create(
    dto: CreateRequestDto,
    currentUser: JwtPayload,
  ): Promise<HumanitarianRequest> {
    const category = await this.categoryModel.findById(dto.categoryId).exec();
    if (!category || !category.isActive) {
      throw new NotFoundException('Invalid or inactive request category');
    }

    const saved = await this.requestModel.create({
      requesterId: currentUser.sub,
      categoryId: dto.categoryId,
      title: dto.title,
      description: dto.description,
      location: dto.location,
      priority: dto.priority || RequestPriority.NORMAL,
      isPrivate: dto.isPrivate ?? true,
      status: RequestStatus.SUBMITTED,
    });

    await this.historyModel.create({
      requestId: saved.id,
      previousStatus: RequestStatus.DRAFT,
      newStatus: RequestStatus.SUBMITTED,
      changedById: currentUser.sub,
      reason: 'Initial request submission',
    });

    await this.auditService.record({
      actorId: currentUser.sub,
      action: AuditAction.CREATE,
      targetType: 'HUMANITARIAN_REQUEST',
      targetId: saved.id,
      metadata: { title: saved.title, isPrivate: saved.isPrivate },
    });

    return saved.toJSON();
  }

  async list(
    currentUser: JwtPayload,
    page = 1,
    limit = 20,
  ): Promise<{ items: HumanitarianRequest[]; total: number }> {
    const isStaffOrAdmin =
      currentUser.roles?.includes(RoleType.ADMIN) ||
      currentUser.roles?.includes(RoleType.SUPER_ADMIN) ||
      currentUser.roles?.includes(RoleType.MODERATOR);

    const filter: any = {};
    if (!isStaffOrAdmin) {
      filter.requesterId = currentUser.sub;
    }

    const [items, total] = await Promise.all([
      this.requestModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.requestModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((i) => i.toJSON()),
      total,
    };
  }

  async getById(
    id: string,
    currentUser: JwtPayload,
  ): Promise<HumanitarianRequest> {
    const request = await this.requestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException('Humanitarian request not found');
    }

    // Authoritative Object-Level Authorization Check!
    this.authzService.assertCanAccessRequest(currentUser, request);

    return request.toJSON();
  }

  async updateStatus(
    id: string,
    dto: UpdateRequestStatusDto,
    currentUser: JwtPayload,
  ): Promise<HumanitarianRequest> {
    const request = await this.requestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException('Humanitarian request not found');
    }

    const isStaffOrAdmin =
      currentUser.roles?.includes(RoleType.ADMIN) ||
      currentUser.roles?.includes(RoleType.SUPER_ADMIN) ||
      currentUser.roles?.includes(RoleType.MODERATOR);

    const isOwner = request.requesterId === currentUser.sub;

    if (!isStaffOrAdmin) {
      if (!isOwner || dto.status !== RequestStatus.CANCELLED) {
        throw new ForbiddenException(
          'Requesters can only cancel their own pending requests',
        );
      }
    }

    const previousStatus = request.status;
    request.status = dto.status;
    const updated = await request.save();

    await this.historyModel.create({
      requestId: request.id,
      previousStatus,
      newStatus: dto.status,
      changedById: currentUser.sub,
      reason: dto.reason || null,
    });

    await this.auditService.record({
      actorId: currentUser.sub,
      action: AuditAction.STATUS_CHANGE,
      targetType: 'HUMANITARIAN_REQUEST',
      targetId: request.id,
      metadata: { previousStatus, newStatus: dto.status, reason: dto.reason },
    });

    return updated.toJSON();
  }

  async listCategories(): Promise<RequestCategory[]> {
    return this.categoryModel.find({ isActive: true }).sort({ nameEn: 1 }).exec();
  }
}
