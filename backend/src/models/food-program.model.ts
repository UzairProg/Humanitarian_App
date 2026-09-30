import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ProgramStatus, IFoodProgram } from '@al-husseiniya/types';

export interface FoodProgramDocument extends Omit<IFoodProgram, 'id'>, Document<string> {
  _id: string;
  id: string;
  isDemo?: boolean;
}

export const FoodProgramSchema = new Schema<FoodProgramDocument>(
  {
    _id: { type: String, default: uuidv4 },
    organizationId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    programDate: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    capacity: { type: Number, default: 100, min: 0 },
    remainingCapacity: { type: Number, default: 100, min: 0 },
    status: {
      type: String,
      enum: Object.values(ProgramStatus),
      default: ProgramStatus.ACTIVE,
      index: true,
    },
    instructions: { type: String, default: null },
    isDemo: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    collection: 'food_programs',
  },
);

FoodProgramSchema.index({ organizationId: 1, programDate: 1 });
FoodProgramSchema.index({ status: 1, programDate: 1 });

FoodProgramSchema.virtual('id').get(function (this: any) {
  return this._id;
});

FoodProgramSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

FoodProgramSchema.set('toObject', { virtuals: true });

export const FoodProgramModel =
  mongoose.models.FoodProgram ||
  mongoose.model<FoodProgramDocument>('FoodProgram', FoodProgramSchema);
