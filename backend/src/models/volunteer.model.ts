import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  IVolunteerProfile,
  IVolunteerOpportunity,
  IVolunteerApplication,
} from '@al-husseiniya/types';

export interface VolunteerProfileDocument
  extends Omit<IVolunteerProfile, 'id'>,
    Document<string> {
  _id: string;
  id: string;
  isDemo?: boolean;
}

export const VolunteerProfileSchema = new Schema<VolunteerProfileDocument>(
  {
    _id: { type: String, default: uuidv4 },
    userId: { type: String, required: true, unique: true, index: true },
    skills: [{ type: String }],
    interests: [{ type: String }],
    availability: { type: String, required: true },
    location: { type: String, required: true },
    languages: [{ type: String }],
    preferredCategories: [{ type: String }],
    emergencyContact: { type: String, default: null },
    status: { type: String, default: 'ACTIVE' },
    isDemo: { type: Boolean, default: false, index: true },
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
  mongoose.model<VolunteerProfileDocument>(
    'VolunteerProfile',
    VolunteerProfileSchema,
  );

// ============================================================================
// Volunteer Opportunities
// ============================================================================

export interface VolunteerOpportunityDocument
  extends Omit<IVolunteerOpportunity, 'id'>,
    Document<string> {
  _id: string;
  id: string;
  isDemo?: boolean;
}

export const VolunteerOpportunitySchema =
  new Schema<VolunteerOpportunityDocument>(
    {
      _id: { type: String, default: uuidv4 },
      organizationId: { type: String, required: true, index: true },
      title: { type: String, required: true, trim: true },
      description: { type: String, required: true },
      location: { type: String, required: true },
      category: { type: String, default: 'COMMUNITY_SERVICE' },
      remoteType: {
        type: String,
        enum: ['ON_SITE', 'REMOTE', 'HYBRID'],
        default: 'ON_SITE',
      },
      startAt: { type: Date, required: true },
      endAt: { type: Date, required: true },
      requirements: [{ type: String }],
      capacity: { type: Number, default: 10 },
      status: {
        type: String,
        enum: ['DRAFT', 'OPEN', 'FULL', 'CLOSED', 'CANCELLED', 'COMPLETED'],
        default: 'OPEN',
        index: true,
      },
      isDemo: { type: Boolean, default: false, index: true },
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

// ============================================================================
// Volunteer Applications
// ============================================================================

export interface VolunteerApplicationDocument
  extends Omit<IVolunteerApplication, 'id'>,
    Document<string> {
  _id: string;
  id: string;
  isDemo?: boolean;
}

export const VolunteerApplicationSchema =
  new Schema<VolunteerApplicationDocument>(
    {
      _id: { type: String, default: uuidv4 },
      opportunityId: { type: String, required: true, index: true },
      userId: { type: String, required: true, index: true },
      status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING',
        index: true,
      },
      message: { type: String, default: null },
      reviewedById: { type: String, default: null },
      reviewNotes: { type: String, default: null },
      appliedAt: { type: Date, default: Date.now },
      reviewedAt: { type: Date, default: null },
      isDemo: { type: Boolean, default: false, index: true },
    },
    {
      timestamps: true,
      collection: 'volunteer_applications',
    },
  );

// Prevent duplicate pending or active applications for the same opportunity
VolunteerApplicationSchema.index(
  { opportunityId: 1, userId: 1 },
  { unique: true },
);

VolunteerApplicationSchema.virtual('id').get(function (this: any) {
  return this._id;
});
VolunteerApplicationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
VolunteerApplicationSchema.set('toObject', { virtuals: true });

export const VolunteerApplicationModel =
  mongoose.models.VolunteerApplication ||
  mongoose.model<VolunteerApplicationDocument>(
    'VolunteerApplication',
    VolunteerApplicationSchema,
  );
