import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { INotification } from '@al-husseiniya/types';

export interface NotificationDocument extends Omit<INotification, 'id'>, Document<string> {
  _id: string;
  id: string;
  referenceType?: string | null;
  referenceId?: string | null;
}

export const NotificationSchema = new Schema<NotificationDocument>(
  {
    _id: { type: String, default: uuidv4 },
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    referenceType: { type: String, default: null },
    referenceId: { type: String, default: null },
    payload: { type: Schema.Types.Mixed, default: {} },
    readAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
    collection: 'notifications',
  },
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

NotificationSchema.virtual('id').get(function (this: any) {
  return this._id;
});

NotificationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

NotificationSchema.set('toObject', { virtuals: true });

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>('Notification', NotificationSchema);
