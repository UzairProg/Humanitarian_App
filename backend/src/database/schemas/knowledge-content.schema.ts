import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ContentPublicationStatus, ContributorReviewStatus } from '@al-husseiniya/types';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type KnowledgeContentDocument = KnowledgeContent & Document;

@Schema({ timestamps: true, collection: 'knowledge_content' })
export class KnowledgeContent {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  summary: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: String, default: null })
  mediaUrl?: string | null;

  @Prop({ type: String, required: true, index: true })
  contributorId: string;

  @Prop({ required: true, index: true })
  category: string;

  @Prop({ type: String, default: 'en', index: true })
  language: string;

  @Prop({ type: String, enum: ContributorReviewStatus, default: ContributorReviewStatus.DRAFT, index: true })
  reviewStatus: ContributorReviewStatus;

  @Prop({ type: String, enum: ContentPublicationStatus, default: ContentPublicationStatus.DRAFT, index: true })
  publicationStatus: ContentPublicationStatus;
}

export const KnowledgeContentSchema = SchemaFactory.createForClass(KnowledgeContent);
applyVirtualIdAndCleanJson(KnowledgeContentSchema);
