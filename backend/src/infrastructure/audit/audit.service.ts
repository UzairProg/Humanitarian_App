import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../database/schemas/audit-log.schema';

export interface CreateAuditLogDto {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any> | null;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private auditModel: Model<AuditLogDocument>,
  ) {}

  async record(dto: CreateAuditLogDto): Promise<void> {
    try {
      await this.auditModel.create({
        actorId: dto.actorId,
        action: dto.action,
        targetType: dto.targetType,
        targetId: dto.targetId,
        metadata: dto.metadata,
        requestId: dto.requestId,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      });
    } catch (err: any) {
      this.logger.error(`Failed to record audit log: ${err.message}`, err.stack);
    }
  }

  async getRecentLogs(limit = 50, offset = 0): Promise<[AuditLog[], number]> {
    const [items, total] = await Promise.all([
      this.auditModel
        .find()
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit)
        .exec(),
      this.auditModel.countDocuments().exec(),
    ]);

    return [items, total];
  }
}
