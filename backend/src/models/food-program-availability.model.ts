import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface FoodProgramAvailabilityDocument extends Document<string> {
  _id: string;
  id: string;
  programId: string;
  userId?: string | null;
  count: number;
  status: string;
  notes?: string | null;
  timestamp: Date;
  isDemo?: boolean;
}

export const FoodProgramAvailabilitySchema = new Schema<FoodProgramAvailabilityDocument>(
  {
    _id: { type: String, default: uuidv4 },
    programId: { type: String, required: true, index: true },
    userId: { type: String, default: null, index: true },
    count: { type: Number, default: 1, min: 1 },
    status: { type: String, default: 'RESERVED' },
    notes: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
    isDemo: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    collection: 'food_program_availabilities',
  },
);

FoodProgramAvailabilitySchema.virtual('id').get(function (this: any) {
  return this._id;
});

FoodProgramAvailabilitySchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

FoodProgramAvailabilitySchema.set('toObject', { virtuals: true });

export const FoodProgramAvailabilityModel =
  mongoose.models.FoodProgramAvailability ||
  mongoose.model<FoodProgramAvailabilityDocument>(
    'FoodProgramAvailability',
    FoodProgramAvailabilitySchema,
  );
