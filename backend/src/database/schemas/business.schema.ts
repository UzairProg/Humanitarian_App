import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { VerificationStatus } from '@al-husseiniya/types';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type BusinessDocument = Business & Document;

@Schema({ timestamps: true, collection: 'businesses' })
export class Business {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  contactEmail: string;

  @Prop({ type: String, default: null })
  contactPhone?: string | null;

  @Prop({ type: String, default: 'ACTIVE' })
  status: string;

  @Prop({ type: String, enum: VerificationStatus, default: VerificationStatus.UNVERIFIED, index: true })
  verificationStatus: VerificationStatus;

  @Prop({ type: String, required: true, index: true })
  ownerId: string;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
applyVirtualIdAndCleanJson(BusinessSchema);
