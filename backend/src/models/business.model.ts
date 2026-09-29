import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { VerificationStatus, IBusiness, IBusinessVerification } from '@al-husseiniya/types';

export interface BusinessDocument extends Omit<IBusiness, 'id'>, Document<string> {
  _id: string;
  id: string;
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
    status: { type: String, default: 'ACTIVE' },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.UNVERIFIED,
      index: true,
    },
    ownerId: { type: String, required: true, index: true },
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
