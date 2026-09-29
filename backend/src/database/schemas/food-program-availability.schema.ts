import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type FoodProgramAvailabilityDocument = FoodProgramAvailability & Document;

@Schema({ timestamps: true, collection: 'food_program_availabilities' })
export class FoodProgramAvailability {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ type: String, required: true, index: true })
  programId: string;

  @Prop({ type: Number, required: true })
  remainingCapacity: number;

  @Prop({ type: String, default: 'AVAILABLE' })
  status: string;
}

export const FoodProgramAvailabilitySchema = SchemaFactory.createForClass(FoodProgramAvailability);
applyVirtualIdAndCleanJson(FoodProgramAvailabilitySchema);
