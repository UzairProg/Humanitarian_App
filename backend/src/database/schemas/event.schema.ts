import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type EventDocument = Event & Document;

@Schema({ timestamps: true, collection: 'events' })
export class Event {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ type: String, required: true, index: true })
  organizerId: string;

  @Prop({ type: String, default: null, index: true })
  organizationId?: string | null;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location: string;

  @Prop({ type: Date, required: true, index: true })
  startAt: Date;

  @Prop({ type: Date, required: true })
  endAt: Date;

  @Prop({ required: true })
  category: string;

  @Prop({ type: String, default: 'PUBLISHED', index: true })
  status: string;

  @Prop({ type: String, default: null })
  mediaUrl?: string | null;
}

export const EventSchema = SchemaFactory.createForClass(Event);
applyVirtualIdAndCleanJson(EventSchema);
