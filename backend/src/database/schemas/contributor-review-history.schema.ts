import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ContributorReviewStatus } from '@al-husseiniya/types';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type ContributorReviewHistoryDocument = ContributorReviewHistory & Document;

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false }, collection: 'contributor_review_history' })
export class ContributorReviewHistory {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ type: String, required: true, index: true })
  contributorProfileId: string;

  @Prop({ type: String, default: null })
  reviewerId?: string | null;

  @Prop({ type: String, enum: ContributorReviewStatus, required: true })
  status: ContributorReviewStatus;

  @Prop({ type: String, default: null })
  notes?: string | null;

  timestamp: Date;
}

export const ContributorReviewHistorySchema = SchemaFactory.createForClass(ContributorReviewHistory);
applyVirtualIdAndCleanJson(ContributorReviewHistorySchema);
