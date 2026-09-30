import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IEvent, IEventRegistration } from '@al-husseiniya/types';

export interface EventDocument extends Omit<IEvent, 'id'>, Document<string> {
  _id: string;
  id: string;
  isDemo?: boolean;
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
    capacity: { type: Number, default: 50 },
    registrationCount: { type: Number, default: 0 },
    registrationRequired: { type: Boolean, default: true },
    format: {
      type: String,
      enum: ['ON_SITE', 'ONLINE', 'HYBRID'],
      default: 'ON_SITE',
    },
    accessibilityInfo: { type: String, default: null },
    language: { type: String, default: 'en' },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'PUBLISHED',
        'REGISTRATION_OPEN',
        'FULL',
        'CLOSED',
        'CANCELLED',
        'COMPLETED',
        'ARCHIVED',
      ],
      default: 'PUBLISHED',
      index: true,
    },
    mediaUrl: { type: String, default: null },
    isDemo: { type: Boolean, default: false, index: true },
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

// ============================================================================
// Event Registrations
// ============================================================================

export interface EventRegistrationDocument
  extends Omit<IEventRegistration, 'id'>,
    Document<string> {
  _id: string;
  id: string;
  isDemo?: boolean;
}

export const EventRegistrationSchema = new Schema<EventRegistrationDocument>(
  {
    _id: { type: String, default: uuidv4 },
    eventId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED'],
      default: 'CONFIRMED',
      index: true,
    },
    registeredAt: { type: Date, default: Date.now },
    notes: { type: String, default: null },
    isDemo: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    collection: 'event_registrations',
  },
);

// Compound index to ensure uniqueness for confirmed registrations
EventRegistrationSchema.index(
  { eventId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { status: 'CONFIRMED' } },
);

EventRegistrationSchema.virtual('id').get(function (this: any) {
  return this._id;
});

EventRegistrationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

EventRegistrationSchema.set('toObject', { virtuals: true });

export const EventRegistrationModel =
  mongoose.models.EventRegistration ||
  mongoose.model<EventRegistrationDocument>(
    'EventRegistration',
    EventRegistrationSchema,
  );
