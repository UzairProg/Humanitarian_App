import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ProgramStatus } from '@al-husseiniya/types';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type FoodProgramDocument = FoodProgram & Document;

@Schema({ timestamps: true, collection: 'food_programs' })
export class FoodProgram {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ type: String, required: true, index: true })
  organizationId: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true, index: true })
  programDate: string;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ type: Number, default: 100 })
  capacity: number;

  @Prop({ type: Number, default: 100 })
  remainingCapacity: number;

  @Prop({ type: String, enum: ProgramStatus, default: ProgramStatus.ACTIVE, index: true })
  status: ProgramStatus;

  @Prop({ type: String, default: null })
  instructions?: string | null;
}

export const FoodProgramSchema = SchemaFactory.createForClass(FoodProgram);
applyVirtualIdAndCleanJson(FoodProgramSchema);
