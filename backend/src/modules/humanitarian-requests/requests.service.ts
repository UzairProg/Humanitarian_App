import {
  RequestStatus,
  RequestPriority,
  RoleType,
  JwtPayload,
  AuditAction,
  MetricType,
} from '@al-husseiniya/types';
import {
  HumanitarianRequestModel,
  HumanitarianRequestDocument,
} from '../../models/humanitarian-request.model';
import { RequestCategoryModel, RequestCategoryDocument } from '../../models/request-category.model';
import { RequestStatusHistoryModel } from '../../models/request-status-history.model';
import { authorizationService } from '../../services/authorization.service';
import { auditService } from '../../services/audit.service';
import { notificationService } from '../../services/notification.service';
import { impactService } from '../../services/impact.service';
import { AppError } from '../../middleware/error.middleware';

export interface CreateRequestInput {
  categoryId: string;
  organizationId?: string | null;
  title: string;
  description: string;
  location: string;
  priority?: RequestPriority;
  isPrivate?: boolean;
}

export interface UpdateRequestStatusInput {
  status: RequestStatus;
  reason?: string;
  matchedOrganizationId?: string;
}

export class RequestsService {
  // Allowed state transitions map
  private readonly validTransitions: Record<RequestStatus, RequestStatus[]> = {
    [RequestStatus.DRAFT]: [RequestStatus.SUBMITTED, RequestStatus.CANCELLED],
    [RequestStatus.SUBMITTED]: [
      RequestStatus.UNDER_REVIEW,
      RequestStatus.IN_REVIEW,
      RequestStatus.MATCHED,
      RequestStatus.CANCELLED,
      RequestStatus.REJECTED,
      RequestStatus.ESCALATED,
    ],
    [RequestStatus.UNDER_REVIEW]: [
      RequestStatus.MATCHED,
      RequestStatus.ACCEPTED,
      RequestStatus.REJECTED,
      RequestStatus.CANCELLED,
      RequestStatus.ESCALATED,
    ],
    [RequestStatus.IN_REVIEW]: [
      RequestStatus.MATCHED,
      RequestStatus.ACCEPTED,
      RequestStatus.REJECTED,
      RequestStatus.CANCELLED,
      RequestStatus.ESCALATED,
    ],
    [RequestStatus.MATCHED]: [
      RequestStatus.ACCEPTED,
      RequestStatus.IN_PROGRESS,
      RequestStatus.REJECTED,
      RequestStatus.CANCELLED,
      RequestStatus.ESCALATED,
    ],
    [RequestStatus.ACCEPTED]: [
      RequestStatus.IN_PROGRESS,
      RequestStatus.CANCELLED,
      RequestStatus.REJECTED,
      RequestStatus.ESCALATED,
    ],
    [RequestStatus.IN_PROGRESS]: [
      RequestStatus.COMPLETED,
      RequestStatus.FULFILLED,
      RequestStatus.ESCALATED,
      RequestStatus.CANCELLED,
    ],
    [RequestStatus.COMPLETED]: [RequestStatus.CLOSED],
    [RequestStatus.FULFILLED]: [RequestStatus.CLOSED],
    [RequestStatus.CANCELLED]: [],
    [RequestStatus.REJECTED]: [],
    [RequestStatus.ESCALATED]: [
      RequestStatus.UNDER_REVIEW,
      RequestStatus.MATCHED,
      RequestStatus.ACCEPTED,
      RequestStatus.CANCELLED,
      RequestStatus.REJECTED,
    ],
    [RequestStatus.CLOSED]: [],
  };

  async listCategories(): Promise<RequestCategoryDocument[]> {
    return RequestCategoryModel.find({ isActive: true }).sort({ nameEn: 1 }).exec();
  }

  async create(
    input: CreateRequestInput,
    currentUser: JwtPayload,
  ): Promise<HumanitarianRequestDocument> {
    const category = await RequestCategoryModel.findById(input.categoryId).exec();
    if (!category || !category.isActive) {
      throw new AppError('Invalid or inactive request category', 400, 'INVALID_CATEGORY');
    }

    if (!input.title || !input.description || !input.location) {
      throw new AppError('Title, description, and location are required', 400);
    }

    const saved = await HumanitarianRequestModel.create({
      requesterId: currentUser.sub,
      organizationId: input.organizationId || null,
      matchedOrganizationId: input.organizationId || null,
      categoryId: input.categoryId,
      title: input.title.trim(),
      description: input.description.trim(),
      location: input.location.trim(),
      priority: input.priority || RequestPriority.NORMAL,
      isPrivate: input.isPrivate ?? true,
      status: RequestStatus.SUBMITTED,
      submittedAt: new Date(),
    });

    await RequestStatusHistoryModel.create({
      requestId: saved.id,
      previousStatus: RequestStatus.DRAFT,
      newStatus: RequestStatus.SUBMITTED,
      changedById: currentUser.sub,
      reason: 'Initial request submission',
      timestamp: new Date(),
    });

    await notificationService.create({
      userId: currentUser.sub,
      type: 'REQUEST_SUBMITTED',
      title: 'Humanitarian Request Submitted',
      body: `Your request "${saved.title}" has been safely received and queued for review.`,
      referenceType: 'HUMANITARIAN_REQUEST',
      referenceId: saved.id,
    });

    await auditService.record({
      actorId: currentUser.sub,
      action: AuditAction.CREATE,
      targetType: 'HUMANITARIAN_REQUEST',
      targetId: saved.id,
      metadata: { title: saved.title, isPrivate: saved.isPrivate },
    });

    return saved;
  }

  async list(
    currentUser: JwtPayload,
    options: {
      page?: number;
      limit?: number;
      status?: RequestStatus;
      categoryId?: string;
      organizationId?: string;
      search?: string;
    } = {},
  ): Promise<{ items: any[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;

    const isStaffOrAdmin =
      currentUser.roles?.includes(RoleType.ADMIN) ||
      currentUser.roles?.includes(RoleType.SUPER_ADMIN) ||
      currentUser.roles?.includes(RoleType.MODERATOR);

    const isOrgStaff =
      currentUser.roles?.includes(RoleType.ORGANIZATION_ADMIN) ||
      currentUser.roles?.includes(RoleType.ORGANIZATION_STAFF);

    const filter: any = {};

    if (!isStaffOrAdmin) {
      if (isOrgStaff && currentUser.orgId) {
        // Org staff can see requests directed to their organization OR created by them
        filter.$or = [
          { requesterId: currentUser.sub },
          { organizationId: currentUser.orgId },
          { matchedOrganizationId: currentUser.orgId },
        ];
      } else {
        // Individual user sees only their own requests
        filter.requesterId = currentUser.sub;
      }
    } else {
      if (options.organizationId) {
        filter.$or = [
          { organizationId: options.organizationId },
          { matchedOrganizationId: options.organizationId },
        ];
      }
    }

    if (options.status) {
      filter.status = options.status;
    }
    if (options.categoryId) {
      filter.categoryId = options.categoryId;
    }
    if (options.search) {
      filter.title = { $regex: options.search, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      HumanitarianRequestModel.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      HumanitarianRequestModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((i) => i.toJSON()),
      total,
    };
  }

  async getById(
    id: string,
    currentUser: JwtPayload,
  ): Promise<{ request: any; history: any[] }> {
    const request = await HumanitarianRequestModel.findById(id).exec();
    if (!request) {
      throw new AppError('Humanitarian request not found', 404, 'REQUEST_NOT_FOUND');
    }

    // Authoritative Object-Level Authorization Check!
    authorizationService.assertCanAccessRequest(currentUser, request);

    const history = await RequestStatusHistoryModel.find({ requestId: id })
      .sort({ timestamp: 1 })
      .exec();

    return {
      request: request.toJSON(),
      history: history.map((h) => h.toJSON()),
    };
  }

  async updateStatus(
    id: string,
    input: UpdateRequestStatusInput,
    currentUser: JwtPayload,
  ): Promise<HumanitarianRequestDocument> {
    const request = await HumanitarianRequestModel.findById(id).exec();
    if (!request) {
      throw new AppError('Humanitarian request not found', 404, 'REQUEST_NOT_FOUND');
    }

    const isAdmin = authorizationService.isSuperAdminOrAdmin(currentUser);
    const isOwner = request.requesterId === currentUser.sub;
    const isOrgStaff =
      currentUser.orgId &&
      (request.organizationId === currentUser.orgId ||
        request.matchedOrganizationId === currentUser.orgId);

    // 1. Enforce State Machine Transitions
    const allowedNext = this.validTransitions[request.status as RequestStatus] || [];
    if (!allowedNext.includes(input.status) && !isAdmin) {
      throw new AppError(
        `Invalid status transition from '${request.status}' to '${input.status}'`,
        400,
        'INVALID_STATUS_TRANSITION',
      );
    }

    // 2. Enforce Role and Ownership Permissions
    if (!isAdmin) {
      if (isOwner) {
        // Individual requesters can ONLY cancel their own requests
        if (input.status !== RequestStatus.CANCELLED) {
          throw new AppError(
            'Requesters can only cancel their own pending requests',
            403,
            'FORBIDDEN',
          );
        }
      } else if (isOrgStaff) {
        // Org staff can accept, start, complete, or reject
        const allowedOrgStatuses: RequestStatus[] = [
          RequestStatus.ACCEPTED,
          RequestStatus.IN_PROGRESS,
          RequestStatus.COMPLETED,
          RequestStatus.FULFILLED,
          RequestStatus.REJECTED,
        ];
        if (!allowedOrgStatuses.includes(input.status)) {
          throw new AppError(
            'Organization staff can only accept, advance, complete, or reject requests',
            403,
            'FORBIDDEN',
          );
        }
      } else {
        throw new AppError(
          'You are not authorized to update this request status',
          403,
          'FORBIDDEN',
        );
      }
    }

    const previousStatus = request.status;
    request.status = input.status;

    if (input.matchedOrganizationId) {
      request.matchedOrganizationId = input.matchedOrganizationId;
      request.organizationId = input.matchedOrganizationId;
    }

    // Set status timestamps
    if (input.status === RequestStatus.ACCEPTED) {
      request.acceptedAt = new Date();
    } else if (
      input.status === RequestStatus.COMPLETED ||
      input.status === RequestStatus.FULFILLED
    ) {
      request.completedAt = new Date();
    } else if (input.status === RequestStatus.CANCELLED) {
      request.cancelledAt = new Date();
    }

    const updated = await request.save();

    // Record History
    await RequestStatusHistoryModel.create({
      requestId: request.id,
      previousStatus,
      newStatus: input.status,
      changedById: currentUser.sub,
      reason: input.reason || null,
      timestamp: new Date(),
    });

    // Notify requester of status change
    await notificationService.create({
      userId: request.requesterId,
      type: 'REQUEST_STATUS_UPDATED',
      title: `Request Status: ${input.status}`,
      body: `Your request "${request.title}" status has changed to ${input.status}.`,
      referenceType: 'HUMANITARIAN_REQUEST',
      referenceId: request.id,
    });

    // If completed: record actual measurable impact!
    if (input.status === RequestStatus.COMPLETED || input.status === RequestStatus.FULFILLED) {
      await impactService.record({
        entityType: request.organizationId ? 'ORGANIZATION' : 'PLATFORM',
        entityId: request.organizationId || 'PLATFORM',
        metricType: MetricType.REQUESTS_FULFILLED,
        value: 1,
        source: 'HUMANITARIAN_REQUEST_COMPLETION',
      });
    }

    // Record Audit
    await auditService.record({
      actorId: currentUser.sub,
      action: AuditAction.STATUS_CHANGE,
      targetType: 'HUMANITARIAN_REQUEST',
      targetId: request.id,
      metadata: { previousStatus, newStatus: input.status, reason: input.reason },
    });

    return updated;
  }
}

export const requestsService = new RequestsService();
