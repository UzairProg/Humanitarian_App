import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IVolunteerProfile, IVolunteerOpportunity } from '@al-husseiniya/types';

export interface VolunteerProfileDocument extends Omit<IVolunteerProfile, 'id'>, Document<string> {
  _id: string;
  id: string;
}

export const VolunteerProfileSchema = new Schema<VolunteerProfileDocument>(
  {
    _id: { type: String, default: uuidv4 },
    userId: { type: String, required: true, unique: true, index: true },
    skills: [{ type: String }],
    interests: [{ type: String }],
    availability: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, default: 'ACTIVE' },
  },
  {
    timestamps: true,
    collection: 'volunteer_profiles',
  },
);

VolunteerProfileSchema.virtual('id').get(function (this: any) {
  return this._id;
});
VolunteerProfileSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
VolunteerProfileSchema.set('toObject', { virtuals: true });

export const VolunteerProfileModel =
  mongoose.models.VolunteerProfile ||
  mongoose.model<VolunteerProfileDocument>('VolunteerProfile', VolunteerProfileSchema);

export interface VolunteerOpportunityDocument
  extends Omit<IVolunteerOpportunity, 'id'>,
    Document<string> {
  _id: string;
  id: string;
}

export const VolunteerOpportunitySchema = new Schema<VolunteerOpportunityDocument>(
  {
    _id: { type: String, default: uuidv4 },
    organizationId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    requirements: [{ type: String }],
    capacity: { type: Number, default: 10 },
    status: { type: String, default: 'OPEN' },
  },
  {
    timestamps: true,
    collection: 'volunteer_opportunities',
  },
);

VolunteerOpportunitySchema.virtual('id').get(function (this: any) {
  return this._id;
});
VolunteerOpportunitySchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
VolunteerOpportunitySchema.set('toObject', { virtuals: true });

export const VolunteerOpportunityModel =
  mongoose.models.VolunteerOpportunity ||
  mongoose.model<VolunteerOpportunityDocument>(
    'VolunteerOpportunity',
    VolunteerOpportunitySchema,
  );
