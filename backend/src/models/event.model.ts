import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IEvent } from '@al-husseiniya/types';

export interface EventDocument extends Omit<IEvent, 'id'>, Document<string> {
  _id: string;
  id: string;
}

export const EventSchema = new Schema<EventDocument>(
  {
    _id: { type: String, default: uuidv4 },
    organizerId: { type: String, required: true, index: true },
    organizationId: { type: String, default: null, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    category: { type: String, required: true },
    status: { type: String, default: 'PUBLISHED', index: true },
    mediaUrl: { type: String, default: null },
  },
  {
    timestamps: true,
    collection: 'events',
  },
);

EventSchema.virtual('id').get(function (this: any) {
  return this._id;
});

EventSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

EventSchema.set('toObject', { virtuals: true });

export const EventModel =
  mongoose.models.Event || mongoose.model<EventDocument>('Event', EventSchema);
