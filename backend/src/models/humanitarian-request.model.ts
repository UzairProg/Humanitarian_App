import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { RequestPriority, RequestStatus, IHumanitarianRequest } from '@al-husseiniya/types';

export interface HumanitarianRequestDocument
  extends Omit<IHumanitarianRequest, 'id'>,
    Document<string> {
  _id: string;
  id: string;
  organizationId?: string | null;
  matchedOrganizationId?: string | null;
  shortDescription?: string;
  submittedAt?: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  isDemo?: boolean;
  metadata?: Record<string, any>;
}

export const HumanitarianRequestSchema = new Schema<HumanitarianRequestDocument>(
  {
    _id: { type: String, default: uuidv4 },
    requesterId: { type: String, required: true, index: true },
    organizationId: { type: String, default: null, index: true },
    matchedOrganizationId: { type: String, default: null, index: true },
    categoryId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, default: null },
    description: { type: String, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.SUBMITTED,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(RequestPriority),
      default: RequestPriority.NORMAL,
      index: true,
    },
    isPrivate: { type: Boolean, default: true },
    isDemo: { type: Boolean, default: false, index: true },
    submittedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: 'humanitarian_requests',
  },
);

HumanitarianRequestSchema.index({ requesterId: 1, createdAt: -1 });
HumanitarianRequestSchema.index({ organizationId: 1, status: 1 });
HumanitarianRequestSchema.index({ categoryId: 1, status: 1 });

HumanitarianRequestSchema.virtual('id').get(function (this: any) {
  return this._id;
});

HumanitarianRequestSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

HumanitarianRequestSchema.set('toObject', { virtuals: true });

export const HumanitarianRequestModel =
  mongoose.models.HumanitarianRequest ||
  mongoose.model<HumanitarianRequestDocument>(
    'HumanitarianRequest',
    HumanitarianRequestSchema,
  );
