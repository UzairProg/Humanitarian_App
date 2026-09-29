import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { MetricType, IImpactRecord } from '@al-husseiniya/types';

export interface ImpactRecordDocument extends Omit<IImpactRecord, 'id'>, Document<string> {
  _id: string;
  id: string;
}

export const ImpactRecordSchema = new Schema<ImpactRecordDocument>(
  {
    _id: { type: String, default: uuidv4 },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    metricType: {
      type: String,
      enum: Object.values(MetricType),
      required: true,
      index: true,
    },
    value: { type: Number, required: true, min: 0 },
    source: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
    collection: 'impact_records',
  },
);

ImpactRecordSchema.virtual('id').get(function (this: any) {
  return this._id;
});

ImpactRecordSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

ImpactRecordSchema.set('toObject', { virtuals: true });

export const ImpactRecordModel =
  mongoose.models.ImpactRecord ||
  mongoose.model<ImpactRecordDocument>('ImpactRecord', ImpactRecordSchema);
