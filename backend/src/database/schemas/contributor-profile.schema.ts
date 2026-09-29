import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ContributorReviewStatus, ContributorType, VerificationStatus } from '@al-husseiniya/types';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type ContributorProfileDocument = ContributorProfile & Document;

@Schema({ timestamps: true, collection: 'contributor_profiles' })
export class ContributorProfile {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ type: String, required: true, unique: true, index: true })
  userId: string;

  @Prop({ type: String, enum: ContributorType, default: ContributorType.COMMUNITY_EDUCATOR, index: true })
  contributorType: ContributorType;

  @Prop({ required: true })
  biography: string;

  @Prop({ type: Object, default: null })
  credentialsMetadata?: Record<string, any> | null;

  @Prop({ type: String, enum: VerificationStatus, default: VerificationStatus.PENDING, index: true })
  verificationStatus: VerificationStatus;

  @Prop({ type: String, enum: ContributorReviewStatus, default: ContributorReviewStatus.DRAFT, index: true })
  reviewStatus: ContributorReviewStatus;

  @Prop({ type: Boolean, default: false })
  visibility: boolean;
}

export const ContributorProfileSchema = SchemaFactory.createForClass(ContributorProfile);
applyVirtualIdAndCleanJson(ContributorProfileSchema);
