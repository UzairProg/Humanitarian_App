import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ReportStatus, ReportTargetType } from '@al-husseiniya/types';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true, collection: 'reports' })
export class Report {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ type: String, required: true, index: true })
  reporterId: string;

  @Prop({ type: String, enum: ReportTargetType, required: true, index: true })
  targetType: ReportTargetType;

  @Prop({ type: String, required: true, index: true })
  targetId: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, default: null })
  evidenceUrl?: string | null;

  @Prop({ type: String, enum: ReportStatus, default: ReportStatus.SUBMITTED, index: true })
  status: ReportStatus;

  @Prop({ type: String, default: null, index: true })
  assignedReviewerId?: string | null;

  @Prop({ type: String, default: null })
  resolution?: string | null;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
applyVirtualIdAndCleanJson(ReportSchema);
