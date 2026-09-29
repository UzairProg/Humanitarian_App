import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IRequestCategory } from '@al-husseiniya/types';

export interface RequestCategoryDocument extends Omit<IRequestCategory, 'id'>, Document<string> {
  _id: string;
  id: string;
}

export const RequestCategorySchema = new Schema<RequestCategoryDocument>(
  {
    _id: { type: String, default: uuidv4 },
    code: { type: String, required: true, unique: true, index: true },
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    descriptionEn: { type: String, default: null },
    descriptionAr: { type: String, default: null },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    collection: 'request_categories',
  },
);

RequestCategorySchema.virtual('id').get(function (this: any) {
  return this._id;
});

RequestCategorySchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

RequestCategorySchema.set('toObject', { virtuals: true });

export const RequestCategoryModel =
  mongoose.models.RequestCategory ||
  mongoose.model<RequestCategoryDocument>('RequestCategory', RequestCategorySchema);
