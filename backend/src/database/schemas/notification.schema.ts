import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'notifications' })
export class Notification {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: Object, default: null })
  payload?: Record<string, any> | null;

  @Prop({ type: Date, default: null, index: true })
  readAt?: Date | null;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
applyVirtualIdAndCleanJson(NotificationSchema);
