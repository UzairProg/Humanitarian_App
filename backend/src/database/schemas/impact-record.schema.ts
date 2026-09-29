import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { MetricType } from '@al-husseiniya/types';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type ImpactRecordDocument = ImpactRecord & Document;

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false }, collection: 'impact_records' })
export class ImpactRecord {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ required: true, index: true })
  entityType: string;

  @Prop({ required: true, index: true })
  entityId: string;

  @Prop({ type: String, enum: MetricType, required: true, index: true })
  metricType: MetricType;

  @Prop({ type: Number, required: true })
  value: number;

  @Prop({ required: true })
  source: string;

  timestamp: Date;
}

export const ImpactRecordSchema = SchemaFactory.createForClass(ImpactRecord);
applyVirtualIdAndCleanJson(ImpactRecordSchema);
