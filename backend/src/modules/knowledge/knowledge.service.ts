import {
  ContributorReviewStatus,
  ContentPublicationStatus,
  PermissionKey,
  JwtPayload,
  RoleType,
  AuditAction,
} from '@al-husseiniya/types';
import {
  KnowledgeContentModel,
  KnowledgeContentDocument,
  ContributorProfileModel,
} from '../../models';
import { AppError } from '../../middleware/error.middleware';
import { auditService } from '../../services/audit.service';
import { notificationService } from '../../services/notification.service';

export interface CreateKnowledgeDto {
  title: string;
  summary: string;
  body: string;
  category: string;
  language?: string;
  mediaUrl?: string;
}

export interface ReviewKnowledgeDto {
  reviewStatus: ContributorReviewStatus;
  reviewNotes?: string;
}

export class KnowledgeService {
  async create(
    dto: CreateKnowledgeDto,
    currentUser: JwtPayload,
  ): Promise<KnowledgeContentDocument> {
    const article = await KnowledgeContentModel.create({
      ...dto,
      contributorId: currentUser.sub,
      language: dto.language || 'en',
      reviewStatus: ContributorReviewStatus.DRAFT,
      publicationStatus: ContentPublicationStatus.DRAFT,
    });

    await auditService.record({
      actorId: currentUser.sub,
      action: AuditAction.CREATE,
      targetType: 'KNOWLEDGE_CONTENT',
      targetId: article.id,
      metadata: { title: article.title, category: article.category },
    });

    return article;
  }

  async listPublished(params: {
    page?: number;
    limit?: number;
    lang?: string;
    category?: string;
    search?: string;
  }): Promise<{ items: KnowledgeContentDocument[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);

    const filter: any = {
      publicationStatus: ContentPublicationStatus.PUBLISHED,
    };

    if (params.lang) {
      filter.language = params.lang;
    }
    if (params.category) {
      filter.category = params.category;
    }
    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { summary: { $regex: params.search, $options: 'i' } },
        { body: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      KnowledgeContentModel.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ publishedAt: -1, createdAt: -1 })
        .exec(),
      KnowledgeContentModel.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }

  async getById(
    id: string,
    currentUser?: JwtPayload,
  ): Promise<KnowledgeContentDocument> {
    const article = await KnowledgeContentModel.findById(id).exec();
    if (!article) {
      throw new AppError('Knowledge content not found', 404, 'NOT_FOUND');
    }

    if (article.publicationStatus === ContentPublicationStatus.PUBLISHED) {
      return article;
    }

    // If not published, only author or reviewer/admin can view
    const isAuthor = currentUser && article.contributorId === currentUser.sub;
    const isReviewer =
      currentUser &&
      (currentUser.roles?.includes(RoleType.SUPER_ADMIN) ||
        currentUser.roles?.includes(RoleType.ADMIN) ||
        currentUser.roles?.includes(RoleType.MODERATOR));

    if (!isAuthor && !isReviewer) {
      throw new AppError(
        'Forbidden: Content is not yet published',
        403,
        'FORBIDDEN',
      );
    }

    return article;
  }

  async update(
    id: string,
    dto: Partial<CreateKnowledgeDto>,
    user: JwtPayload,
  ): Promise<KnowledgeContentDocument> {
    const article = await KnowledgeContentModel.findById(id).exec();
    if (!article) {
      throw new AppError('Content not found', 404, 'NOT_FOUND');
    }

    const isAuthor = article.contributorId === user.sub;
    const isAdmin =
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN);

    if (!isAuthor && !isAdmin) {
      throw new AppError(
        'Forbidden: You are not authorized to edit this article',
        403,
        'FORBIDDEN',
      );
    }

    if (dto.title) article.title = dto.title;
    if (dto.summary) article.summary = dto.summary;
    if (dto.body) article.body = dto.body;
    if (dto.category) article.category = dto.category;
    if (dto.language) article.language = dto.language;
    if (dto.mediaUrl !== undefined) article.mediaUrl = dto.mediaUrl;

    await article.save();

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.UPDATE,
      targetType: 'KNOWLEDGE_CONTENT',
      targetId: article.id,
      metadata: { title: article.title },
    });

    return article;
  }

  async submitForReview(
    id: string,
    user: JwtPayload,
  ): Promise<KnowledgeContentDocument> {
    const article = await KnowledgeContentModel.findById(id).exec();
    if (!article) {
      throw new AppError('Content not found', 404, 'NOT_FOUND');
    }

    if (article.contributorId !== user.sub) {
      throw new AppError(
        'Forbidden: Only the author can submit this content for review',
        403,
        'FORBIDDEN',
      );
    }

    article.reviewStatus = ContributorReviewStatus.UNDER_ADMIN_REVIEW;
    article.publicationStatus = ContentPublicationStatus.UNDER_REVIEW;
    await article.save();

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.STATUS_CHANGE,
      targetType: 'KNOWLEDGE_CONTENT',
      targetId: article.id,
      metadata: { reviewStatus: article.reviewStatus },
    });

    return article;
  }

  async review(
    id: string,
    dto: ReviewKnowledgeDto,
    user: JwtPayload,
  ): Promise<KnowledgeContentDocument> {
    const isReviewer =
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN) ||
      user.roles?.includes(RoleType.MODERATOR);

    if (!isReviewer) {
      throw new AppError(
        'Forbidden: You do not have editorial review permissions',
        403,
        'FORBIDDEN',
      );
    }

    const article = await KnowledgeContentModel.findById(id).exec();
    if (!article) {
      throw new AppError('Content not found', 404, 'NOT_FOUND');
    }

    article.reviewStatus = dto.reviewStatus;
    article.reviewerId = user.sub;
    if (dto.reviewNotes) article.reviewNotes = dto.reviewNotes;
    await article.save();

    // Notify author of review decision
    await notificationService.create({
      userId: article.contributorId,
      type: 'content.reviewed',
      title: `Article Review: ${dto.reviewStatus}`,
      body: `Your submitted content "${article.title}" has been reviewed. Status: ${dto.reviewStatus}`,
      referenceType: 'KNOWLEDGE_CONTENT',
      referenceId: article.id,
      payload: { reviewStatus: dto.reviewStatus, notes: dto.reviewNotes },
    });

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.VERIFY,
      targetType: 'KNOWLEDGE_CONTENT',
      targetId: article.id,
      metadata: { reviewStatus: dto.reviewStatus, notes: dto.reviewNotes },
    });

    return article;
  }

  async publish(
    id: string,
    user: JwtPayload,
  ): Promise<KnowledgeContentDocument> {
    const canPublish =
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN) ||
      user.permissions?.includes(PermissionKey.CONTENT_PUBLISH);

    if (!canPublish) {
      throw new AppError(
        'Forbidden: You do not have publication permissions (CONTENT_PUBLISH required)',
        403,
        'FORBIDDEN',
      );
    }

    const article = await KnowledgeContentModel.findById(id).exec();
    if (!article) {
      throw new AppError('Content not found', 404, 'NOT_FOUND');
    }

    article.publicationStatus = ContentPublicationStatus.PUBLISHED;
    article.reviewStatus = ContributorReviewStatus.APPROVED;
    article.publishedAt = new Date();
    article.reviewerId = user.sub;
    await article.save();

    // Notify author
    await notificationService.create({
      userId: article.contributorId,
      type: 'content.published',
      title: 'Article Published!',
      body: `Your educational article "${article.title}" is now published and available to the community.`,
      referenceType: 'KNOWLEDGE_CONTENT',
      referenceId: article.id,
    });

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.STATUS_CHANGE,
      targetType: 'KNOWLEDGE_CONTENT',
      targetId: article.id,
      metadata: { publicationStatus: 'PUBLISHED' },
    });

    return article;
  }

  async getMyArticles(userId: string): Promise<KnowledgeContentDocument[]> {
    return KnowledgeContentModel.find({ contributorId: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAdminQueue(params: {
    page?: number;
    limit?: number;
  }): Promise<{ items: KnowledgeContentDocument[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);

    const filter = {
      publicationStatus: {
        $in: [
          ContentPublicationStatus.UNDER_REVIEW,
          ContentPublicationStatus.DRAFT,
        ],
      },
    };

    const [items, total] = await Promise.all([
      KnowledgeContentModel.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ updatedAt: -1 })
        .exec(),
      KnowledgeContentModel.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }
}

export const knowledgeService = new KnowledgeService();
