import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { RequestStatus, IRequestStatusHistory } from '@al-husseiniya/types';

export interface RequestStatusHistoryDocument
  extends Omit<IRequestStatusHistory, 'id'>,
    Document<string> {
  _id: string;
  id: string;
}

export const RequestStatusHistorySchema = new Schema<RequestStatusHistoryDocument>(
  {
    _id: { type: String, default: uuidv4 },
    requestId: { type: String, required: true, index: true },
    previousStatus: {
      type: String,
      enum: Object.values(RequestStatus),
      required: true,
    },
    newStatus: {
      type: String,
      enum: Object.values(RequestStatus),
      required: true,
    },
    changedById: { type: String, required: true },
    reason: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'request_status_histories',
  },
);

RequestStatusHistorySchema.virtual('id').get(function (this: any) {
  return this._id;
});

RequestStatusHistorySchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

RequestStatusHistorySchema.set('toObject', { virtuals: true });

export const RequestStatusHistoryModel =
  mongoose.models.RequestStatusHistory ||
  mongoose.model<RequestStatusHistoryDocument>(
    'RequestStatusHistory',
    RequestStatusHistorySchema,
  );
