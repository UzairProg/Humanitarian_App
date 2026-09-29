import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ReportStatus,
  ReportTargetType,
  JwtPayload,
  AuditAction,
} from '@al-husseiniya/types';
import { Report, ReportDocument } from '../../database/schemas/report.schema';
import { AuditService } from '../../infrastructure/audit/audit.service';

export interface SubmitReportDto {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description: string;
  evidenceUrl?: string;
}

export interface ResolveReportDto {
  status: ReportStatus.RESOLVED | ReportStatus.DISMISSED;
  resolution: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name)
    private reportModel: Model<ReportDocument>,
    private auditService: AuditService,
  ) {}

  async submitReport(
    dto: SubmitReportDto,
    reporter: JwtPayload,
  ): Promise<Report> {
    const report = await this.reportModel.create({
      reporterId: reporter.sub,
      targetType: dto.targetType,
      targetId: dto.targetId,
      reason: dto.reason,
      description: dto.description,
      evidenceUrl: dto.evidenceUrl || null,
      status: ReportStatus.SUBMITTED,
    });

    await this.auditService.record({
      actorId: reporter.sub,
      action: AuditAction.CREATE,
      targetType: 'REPORT',
      targetId: report.id,
      metadata: { targetType: dto.targetType, reason: dto.reason },
    });

    return report.toJSON();
  }

  async list(page = 1, limit = 20): Promise<{ items: Report[]; total: number }> {
    const [items, total] = await Promise.all([
      this.reportModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.reportModel.countDocuments().exec(),
    ]);

    return {
      items: items.map((r) => r.toJSON()),
      total,
    };
  }

  async resolveReport(
    id: string,
    dto: ResolveReportDto,
    moderator: JwtPayload,
  ): Promise<Report> {
    const report = await this.reportModel.findById(id).exec();
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = dto.status;
    report.resolution = dto.resolution;
    report.assignedReviewerId = moderator.sub;

    const saved = await report.save();

    await this.auditService.record({
      actorId: moderator.sub,
      action: AuditAction.STATUS_CHANGE,
      targetType: 'REPORT',
      targetId: report.id,
      metadata: { newStatus: dto.status, resolution: dto.resolution },
    });

    return saved.toJSON();
  }
}
