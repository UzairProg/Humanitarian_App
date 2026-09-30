import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { VerificationStatus, IOrganization } from '@al-husseiniya/types';

export interface OrganizationDocument extends Omit<IOrganization, 'id'>, Document<string> {
  _id: string;
  id: string;
  isDemo?: boolean;
}

export const OrganizationSchema = new Schema<OrganizationDocument>(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, required: true },
    logoUrl: { type: String, default: null },
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
    isDemo: { type: Boolean, default: false, index: true },
    createdById: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
    collection: 'organizations',
  },
);

OrganizationSchema.virtual('id').get(function (this: any) {
  return this._id;
});

OrganizationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

OrganizationSchema.set('toObject', { virtuals: true });

export const OrganizationModel =
  mongoose.models.Organization ||
  mongoose.model<OrganizationDocument>('Organization', OrganizationSchema);
