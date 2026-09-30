import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ICompanyProduct } from '@al-husseiniya/types';

export interface CompanyProductDocument extends Omit<ICompanyProduct, 'id'>, Document<string> {
  _id: string;
  id: string;
}

export const CompanyProductSchema = new Schema<CompanyProductDocument>(
  {
    _id: { type: String, default: uuidv4 },
    companyId: { type: String, required: true, index: true },
    name: {
      ar: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    description: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    shortDescription: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    logo: { type: String, default: null },
    coverImage: { type: String, default: null },
    website: { type: String, default: null },
    category: {
      type: Schema.Types.Mixed,
      default: { ar: '', en: '' },
    },
    status: { type: String, default: 'ACTIVE', index: true },
    displayOrder: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'company_products',
  },
);

CompanyProductSchema.virtual('id').get(function (this: any) {
  return this._id;
});

CompanyProductSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

CompanyProductSchema.set('toObject', { virtuals: true });

export const CompanyProductModel =
  mongoose.models.CompanyProduct ||
  mongoose.model<CompanyProductDocument>('CompanyProduct', CompanyProductSchema);
