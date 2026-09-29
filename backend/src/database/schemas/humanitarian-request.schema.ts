import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { RequestPriority, RequestStatus } from '@al-husseiniya/types';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type HumanitarianRequestDocument = HumanitarianRequest & Document;

@Schema({ timestamps: true, collection: 'humanitarian_requests' })
export class HumanitarianRequest {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ type: String, required: true, index: true })
  requesterId: string;

  @Prop({ type: String, required: true, index: true })
  categoryId: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location: string;

  @Prop({ type: String, enum: RequestStatus, default: RequestStatus.SUBMITTED, index: true })
  status: RequestStatus;

  @Prop({ type: String, enum: RequestPriority, default: RequestPriority.NORMAL, index: true })
  priority: RequestPriority;

  @Prop({ type: Boolean, default: true })
  isPrivate: boolean;
}

export const HumanitarianRequestSchema = SchemaFactory.createForClass(HumanitarianRequest);
applyVirtualIdAndCleanJson(HumanitarianRequestSchema);
