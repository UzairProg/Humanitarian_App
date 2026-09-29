import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false }, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ type: String, default: null, index: true })
  actorId?: string | null;

  @Prop({ required: true, index: true })
  action: string;

  @Prop({ required: true, index: true })
  targetType: string;

  @Prop({ required: true, index: true })
  targetId: string;

  @Prop({ type: Object, default: null })
  metadata?: Record<string, any> | null;

  @Prop({ type: String, default: null, index: true })
  requestId?: string | null;

  @Prop({ type: String, default: null })
  ipAddress?: string | null;

  @Prop({ type: String, default: null })
  userAgent?: string | null;

  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
applyVirtualIdAndCleanJson(AuditLogSchema);
