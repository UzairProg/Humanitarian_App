import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IAuditLog } from '@al-husseiniya/types';

export interface AuditLogDocument extends Omit<IAuditLog, 'id'>, Document<string> {
  _id: string;
  id: string;
  isDemo?: boolean;
}

export const AuditLogSchema = new Schema<AuditLogDocument>(
  {
    _id: { type: String, default: uuidv4 },
    actorId: { type: String, default: null, index: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true, index: true },
    targetId: { type: String, required: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    requestId: { type: String, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    timestamp: { type: Date, default: Date.now, index: true },
    isDemo: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    collection: 'audit_logs',
  },
);

AuditLogSchema.virtual('id').get(function (this: any) {
  return this._id;
});

AuditLogSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

AuditLogSchema.set('toObject', { virtuals: true });

export const AuditLogModel =
  mongoose.models.AuditLog ||
  mongoose.model<AuditLogDocument>('AuditLog', AuditLogSchema);
