import { AuditAction } from '@al-husseiniya/types';
import { AuditLogModel, AuditLogDocument } from '../models/audit-log.model';
import { env } from '../config/env';

export interface AuditRecordOptions {
  actorId?: string | null;
  action: AuditAction | string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class AuditService {
  async record(opts: AuditRecordOptions): Promise<AuditLogDocument | null> {
    if (!env.ENABLE_AUDIT_LOGGING) return null;

    try {
      // Ensure no sensitive fields leak into audit metadata
      const cleanMetadata = { ...opts.metadata };
      delete cleanMetadata.password;
      delete cleanMetadata.passwordHash;
      delete cleanMetadata.token;
      delete cleanMetadata.refreshToken;

      const log = await AuditLogModel.create({
        actorId: opts.actorId || null,
        action: opts.action,
        targetType: opts.targetType,
        targetId: opts.targetId,
        metadata: cleanMetadata,
        requestId: opts.requestId || null,
        ipAddress: opts.ipAddress || null,
        userAgent: opts.userAgent || null,
        timestamp: new Date(),
      });
      return log;
    } catch (err: any) {
      console.error('[AuditService] Failed to record audit log:', err.message);
      return null;
    }
  }

  async list(page = 1, limit = 50, filters: any = {}): Promise<{ items: any[]; total: number }> {
    const [items, total] = await Promise.all([
      AuditLogModel.find(filters)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ timestamp: -1 })
        .exec(),
      AuditLogModel.countDocuments(filters).exec(),
    ]);

    return {
      items: items.map((i) => i.toJSON()),
      total,
    };
  }
}

export const auditService = new AuditService();
