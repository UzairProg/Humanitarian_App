import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IOrganizationMember } from '@al-husseiniya/types';

export interface OrganizationMemberDocument extends Omit<IOrganizationMember, 'id'>, Document<string> {
  _id: string;
  id: string;
  isDemo?: boolean;
}

export const OrganizationMemberSchema = new Schema<OrganizationMemberDocument>(
  {
    _id: { type: String, default: uuidv4 },
    organizationId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    role: { type: String, default: 'MEMBER' },
    status: { type: String, default: 'ACTIVE' },
    joinedAt: { type: Date, default: Date.now },
    isDemo: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    collection: 'organization_members',
  },
);

OrganizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

OrganizationMemberSchema.virtual('id').get(function (this: any) {
  return this._id;
});

OrganizationMemberSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

OrganizationMemberSchema.set('toObject', { virtuals: true });

export const OrganizationMemberModel =
  mongoose.models.OrganizationMember ||
  mongoose.model<OrganizationMemberDocument>('OrganizationMember', OrganizationMemberSchema);
