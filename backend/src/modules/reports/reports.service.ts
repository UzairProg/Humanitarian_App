import { ReportStatus, ReportTargetType, JwtPayload } from '@al-husseiniya/types';
import { ReportModel, ReportDocument } from '../../models/report.model';
import { auditService } from '../../services/audit.service';
import { AppError } from '../../middleware/error.middleware';

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description: string;
  evidenceUrl?: string;
}

export class ReportsService {
  async create(input: CreateReportInput, reporterId: string): Promise<ReportDocument> {
    if (!input.targetType || !input.targetId || !input.reason || !input.description) {
      throw new AppError('targetType, targetId, reason, and description are required', 400);
    }

    const report = await ReportModel.create({
      reporterId,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason.trim(),
      description: input.description.trim(),
      evidenceUrl: input.evidenceUrl || null,
      status: ReportStatus.SUBMITTED,
    });

    await auditService.record({
      actorId: reporterId,
      action: 'REPORT_CREATE',
      targetType: 'REPORT',
      targetId: report.id,
      metadata: { reason: report.reason },
    });

    return report;
  }

  async list(page = 1, limit = 20, status?: ReportStatus): Promise<{ items: any[]; total: number }> {
    const filter: any = {};
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      ReportModel.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      ReportModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((r) => r.toJSON()),
      total,
    };
  }

  async resolve(
    id: string,
    resolution: string,
    reviewerId: string,
  ): Promise<ReportDocument> {
    const report = await ReportModel.findById(id).exec();
    if (!report) {
      throw new AppError('Report not found', 404, 'NOT_FOUND');
    }

    report.status = ReportStatus.RESOLVED;
    report.resolution = resolution;
    report.assignedReviewerId = reviewerId;
    const saved = await report.save();

    await auditService.record({
      actorId: reviewerId,
      action: 'REPORT_RESOLVE',
      targetType: 'REPORT',
      targetId: report.id,
      metadata: { resolution },
    });

    return saved;
  }
}

export const reportsService = new ReportsService();
