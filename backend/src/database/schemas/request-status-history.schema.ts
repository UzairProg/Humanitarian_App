import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { RequestStatus } from '@al-husseiniya/types';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type RequestStatusHistoryDocument = RequestStatusHistory & Document;

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false }, collection: 'request_status_history' })
export class RequestStatusHistory {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ type: String, required: true, index: true })
  requestId: string;

  @Prop({ type: String, enum: RequestStatus, required: true })
  previousStatus: RequestStatus;

  @Prop({ type: String, enum: RequestStatus, required: true })
  newStatus: RequestStatus;

  @Prop({ type: String, required: true })
  changedById: string;

  @Prop({ type: String, default: null })
  reason?: string | null;

  timestamp: Date;
}

export const RequestStatusHistorySchema = SchemaFactory.createForClass(RequestStatusHistory);
applyVirtualIdAndCleanJson(RequestStatusHistorySchema);
