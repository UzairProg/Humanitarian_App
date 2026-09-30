import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ICompany } from '@al-husseiniya/types';

export interface CompanyDocument extends Omit<ICompany, 'id'>, Document<string> {
  _id: string;
  id: string;
}

export const CompanySchema = new Schema<CompanyDocument>(
  {
    _id: { type: String, default: uuidv4 },
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
    website: { type: String, default: null },
    status: { type: String, default: 'ACTIVE', index: true },
    displayOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'companies',
  },
);

CompanySchema.virtual('id').get(function (this: any) {
  return this._id;
});

CompanySchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

CompanySchema.set('toObject', { virtuals: true });

export const CompanyModel =
  mongoose.models.Company || mongoose.model<CompanyDocument>('Company', CompanySchema);
