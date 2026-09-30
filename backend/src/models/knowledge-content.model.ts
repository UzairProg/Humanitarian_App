import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  ContributorReviewStatus,
  ContentPublicationStatus,
  ContributorType,
  VerificationStatus,
  IKnowledgeContent,
  IContributorProfile,
} from '@al-husseiniya/types';

export interface KnowledgeContentDocument
  extends Omit<IKnowledgeContent, 'id'>,
    Document<string> {
  _id: string;
  id: string;
  isDemo?: boolean;
}

export const KnowledgeContentSchema = new Schema<KnowledgeContentDocument>(
  {
    _id: { type: String, default: uuidv4 },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true },
    body: { type: String, required: true },
    mediaUrl: { type: String, default: null },
    contributorId: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    language: { type: String, default: 'en', index: true },
    reviewStatus: {
      type: String,
      enum: Object.values(ContributorReviewStatus),
      default: ContributorReviewStatus.DRAFT,
      index: true,
    },
    publicationStatus: {
      type: String,
      enum: Object.values(ContentPublicationStatus),
      default: ContentPublicationStatus.DRAFT,
      index: true,
    },
    reviewerId: { type: String, default: null },
    reviewNotes: { type: String, default: null },
    publishedAt: { type: Date, default: null },
    isDemo: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    collection: 'knowledge_contents',
  },
);

KnowledgeContentSchema.virtual('id').get(function (this: any) {
  return this._id;
});
KnowledgeContentSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
KnowledgeContentSchema.set('toObject', { virtuals: true });

export const KnowledgeContentModel =
  mongoose.models.KnowledgeContent ||
  mongoose.model<KnowledgeContentDocument>(
    'KnowledgeContent',
    KnowledgeContentSchema,
  );

// ============================================================================
// Contributor Profiles
// ============================================================================

export interface ContributorProfileDocument
  extends Omit<IContributorProfile, 'id'>,
    Document<string> {
  _id: string;
  id: string;
  isDemo?: boolean;
}

export const ContributorProfileSchema =
  new Schema<ContributorProfileDocument>(
    {
      _id: { type: String, default: uuidv4 },
      userId: { type: String, required: true, unique: true, index: true },
      contributorType: {
        type: String,
        enum: Object.values(ContributorType),
        required: true,
      },
      biography: { type: String, required: true },
      credentialsMetadata: { type: Schema.Types.Mixed, default: null },
      verificationStatus: {
        type: String,
        enum: Object.values(VerificationStatus),
        default: VerificationStatus.PENDING,
        index: true,
      },
      reviewStatus: {
        type: String,
        enum: Object.values(ContributorReviewStatus),
        default: ContributorReviewStatus.SUBMITTED,
        index: true,
      },
      visibility: { type: Boolean, default: false },
      reviewerId: { type: String, default: null },
      reviewNotes: { type: String, default: null },
      reviewedAt: { type: Date, default: null },
      isDemo: { type: Boolean, default: false, index: true },
    },
    {
      timestamps: true,
      collection: 'contributor_profiles',
    },
  );

ContributorProfileSchema.virtual('id').get(function (this: any) {
  return this._id;
});
ContributorProfileSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
ContributorProfileSchema.set('toObject', { virtuals: true });

export const ContributorProfileModel =
  mongoose.models.ContributorProfile ||
  mongoose.model<ContributorProfileDocument>(
    'ContributorProfile',
    ContributorProfileSchema,
  );
