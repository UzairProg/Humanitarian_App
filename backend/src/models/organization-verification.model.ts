import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { VerificationStatus, IOrganizationVerification } from '@al-husseiniya/types';

export interface OrganizationVerificationDocument
  extends Omit<IOrganizationVerification, 'id'>,
    Document<string> {
  _id: string;
  id: string;
}

export const OrganizationVerificationSchema = new Schema<OrganizationVerificationDocument>(
  {
    _id: { type: String, default: uuidv4 },
    organizationId: { type: String, required: true, index: true },
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
    collection: 'organization_verifications',
  },
);

OrganizationVerificationSchema.virtual('id').get(function (this: any) {
  return this._id;
});

OrganizationVerificationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

OrganizationVerificationSchema.set('toObject', { virtuals: true });

export const OrganizationVerificationModel =
  mongoose.models.OrganizationVerification ||
  mongoose.model<OrganizationVerificationDocument>(
    'OrganizationVerification',
    OrganizationVerificationSchema,
  );
