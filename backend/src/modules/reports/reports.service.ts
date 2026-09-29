import { ReportStatus, ReportTargetType, AuditAction } from '@al-husseiniya/types';
import { ReportModel, ReportDocument } from '../../models/report.model';
import { auditService } from '../../services/audit.service';
import { notificationService } from '../../services/notification.service';
import { AppError } from '../../middleware/error.middleware';

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description: string;
  evidenceUrl?: string;
}

export interface ResolveReportInput {
  status?: ReportStatus;
  resolution: string;
  internalNotes?: string;
  actionTaken?: string;
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
      action: AuditAction.CREATE,
      targetType: 'REPORT',
      targetId: report.id,
      metadata: { reason: report.reason, targetType: report.targetType },
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

  async getById(id: string): Promise<ReportDocument> {
    const report = await ReportModel.findById(id).exec();
    if (!report) {
      throw new AppError('Report not found', 404, 'NOT_FOUND');
    }
    return report;
  }

  async resolve(
    id: string,
    input: ResolveReportInput,
    reviewerId: string,
  ): Promise<ReportDocument> {
    const report = await ReportModel.findById(id).exec();
    if (!report) {
      throw new AppError('Report not found', 404, 'NOT_FOUND');
    }

    report.status = input.status || ReportStatus.RESOLVED;
    report.resolution = input.resolution;
    if (input.internalNotes) report.internalNotes = input.internalNotes;
    if (input.actionTaken) report.actionTaken = input.actionTaken;
    report.assignedReviewerId = reviewerId;
    const saved = await report.save();

    // Notify the reporter
    await notificationService.create({
      userId: report.reporterId,
      type: 'report.resolved',
      title: 'Report Status Updated',
      body: `Your community report regarding ${report.targetType} has been reviewed and marked as ${report.status}. Thank you for helping keep Al-Husseiniya safe and trustworthy.`,
      referenceType: 'REPORT',
      referenceId: report.id,
      payload: { status: report.status },
    });

    await auditService.record({
      actorId: reviewerId,
      action: AuditAction.STATUS_CHANGE,
      targetType: 'REPORT',
      targetId: report.id,
      metadata: {
        resolution: input.resolution,
        status: report.status,
        actionTaken: input.actionTaken,
      },
    });

    return saved;
  }
}

export const reportsService = new ReportsService();
