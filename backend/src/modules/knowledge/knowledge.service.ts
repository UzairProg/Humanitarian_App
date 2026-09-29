import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ContentPublicationStatus,
  ContributorReviewStatus,
  JwtPayload,
  RoleType,
} from '@al-husseiniya/types';
import { KnowledgeContent, KnowledgeContentDocument } from '../../database/schemas/knowledge-content.schema';

export interface CreateKnowledgeDto {
  title: string;
  summary: string;
  body: string;
  category: string;
  language?: string;
  mediaUrl?: string;
}

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectModel(KnowledgeContent.name)
    private contentModel: Model<KnowledgeContentDocument>,
  ) {}

  async create(dto: CreateKnowledgeDto, author: JwtPayload): Promise<KnowledgeContent> {
    const item = await this.contentModel.create({
      ...dto,
      contributorId: author.sub,
      language: dto.language || 'en',
      reviewStatus: ContributorReviewStatus.DRAFT,
      publicationStatus: ContentPublicationStatus.DRAFT,
    });
    return item.toJSON();
  }

  async listPublished(
    page = 1,
    limit = 20,
    language = 'en',
  ): Promise<{ items: KnowledgeContent[]; total: number }> {
    const filter = {
      publicationStatus: ContentPublicationStatus.PUBLISHED,
      language,
    };

    const [items, total] = await Promise.all([
      this.contentModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.contentModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((i) => i.toJSON()),
      total,
    };
  }

  async getById(id: string, currentUser?: JwtPayload): Promise<KnowledgeContent> {
    const item = await this.contentModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('Knowledge content not found');
    }

    if (item.publicationStatus !== ContentPublicationStatus.PUBLISHED) {
      if (
        !currentUser ||
        (item.contributorId !== currentUser.sub &&
          !currentUser.roles.includes(RoleType.ADMIN) &&
          !currentUser.roles.includes(RoleType.MODERATOR))
      ) {
        throw new ForbiddenException('This content is pending review and publication');
      }
    }

    return item.toJSON();
  }

  async publish(id: string): Promise<KnowledgeContent> {
    const item = await this.contentModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('Knowledge content not found');
    }
    item.publicationStatus = ContentPublicationStatus.PUBLISHED;
    item.reviewStatus = ContributorReviewStatus.APPROVED;
    const updated = await item.save();
    return updated.toJSON();
  }
}
