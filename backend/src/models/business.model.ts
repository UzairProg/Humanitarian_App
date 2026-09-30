import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  VerificationStatus,
  IBusiness,
  IBusinessVerification,
  IBusinessParticipation,
} from '@al-husseiniya/types';

export interface BusinessDocument extends Omit<IBusiness, 'id'>, Document<string> {
  _id: string;
  id: string;
  isDemo?: boolean;
}

export const BusinessSchema = new Schema<BusinessDocument>(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, default: null },
    participationTypes: [{ type: String }],
    status: { type: String, default: 'ACTIVE' },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.UNVERIFIED,
      index: true,
    },
    ownerId: { type: String, required: true, index: true },
    isDemo: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    collection: 'businesses',
  },
);

BusinessSchema.virtual('id').get(function (this: any) {
  return this._id;
});
BusinessSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
BusinessSchema.set('toObject', { virtuals: true });

export const BusinessModel =
  mongoose.models.Business || mongoose.model<BusinessDocument>('Business', BusinessSchema);

// ============================================================================
// Business Verifications
// ============================================================================

export interface BusinessVerificationDocument
  extends Omit<IBusinessVerification, 'id'>,
    Document<string> {
  _id: string;
  id: string;
}

export const BusinessVerificationSchema = new Schema<BusinessVerificationDocument>(
  {
    _id: { type: String, default: uuidv4 },
    businessId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
      index: true,
    },
    reviewerId: { type: String, default: null },
    decision: { type: String, default: null },
    notes: { type: String, default: null },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'business_verifications',
  },
);

BusinessVerificationSchema.virtual('id').get(function (this: any) {
  return this._id;
});
BusinessVerificationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
BusinessVerificationSchema.set('toObject', { virtuals: true });

export const BusinessVerificationModel =
  mongoose.models.BusinessVerification ||
  mongoose.model<BusinessVerificationDocument>(
    'BusinessVerification',
    BusinessVerificationSchema,
  );

// ============================================================================
// Business Participations
// ============================================================================

export interface BusinessParticipationDocument
  extends Omit<IBusinessParticipation, 'id'>,
    Document<string> {
  _id: string;
  id: string;
}

export const BusinessParticipationSchema =
  new Schema<BusinessParticipationDocument>(
    {
      _id: { type: String, default: uuidv4 },
      businessId: { type: String, required: true, index: true },
      programOrEventId: { type: String, default: null, index: true },
      participationType: {
        type: String,
        enum: [
          'MEAL_SUPPORT',
          'SPONSORSHIP',
          'SURPLUS_FOOD',
          'VOLUNTEER_SUPPORT',
          'IN_KIND',
        ],
        required: true,
      },
      description: { type: String, required: true },
      quantity: { type: Number, default: 0 },
      status: {
        type: String,
        enum: [
          'DRAFT',
          'SUBMITTED',
          'APPROVED',
          'ACTIVE',
          'COMPLETED',
          'CANCELLED',
        ],
        default: 'SUBMITTED',
        index: true,
      },
      submittedById: { type: String, required: true },
      reviewedById: { type: String, default: null },
      notes: { type: String, default: null },
    },
    {
      timestamps: true,
      collection: 'business_participations',
    },
  );

BusinessParticipationSchema.virtual('id').get(function (this: any) {
  return this._id;
});
BusinessParticipationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
BusinessParticipationSchema.set('toObject', { virtuals: true });

export const BusinessParticipationModel =
  mongoose.models.BusinessParticipation ||
  mongoose.model<BusinessParticipationDocument>(
    'BusinessParticipation',
    BusinessParticipationSchema,
  );
