import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ReportStatus, ReportTargetType, IReport } from '@al-husseiniya/types';

export interface ReportDocument extends Omit<IReport, 'id'>, Document<string> {
  _id: string;
  id: string;
}

export const ReportSchema = new Schema<ReportDocument>(
  {
    _id: { type: String, default: uuidv4 },
    reporterId: { type: String, required: true, index: true },
    targetType: {
      type: String,
      enum: Object.values(ReportTargetType),
      required: true,
      index: true,
    },
    targetId: { type: String, required: true, index: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    evidenceUrl: { type: String, default: null },
    status: {
      type: String,
      enum: Object.values(ReportStatus),
      default: ReportStatus.SUBMITTED,
      index: true,
    },
    assignedReviewerId: { type: String, default: null },
    resolution: { type: String, default: null },
    internalNotes: { type: String, default: null },
    actionTaken: { type: String, default: null },
  },
  {
    timestamps: true,
    collection: 'reports',
  },
);

ReportSchema.virtual('id').get(function (this: any) {
  return this._id;
});
ReportSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
ReportSchema.set('toObject', { virtuals: true });

export const ReportModel =
  mongoose.models.Report || mongoose.model<ReportDocument>('Report', ReportSchema);
