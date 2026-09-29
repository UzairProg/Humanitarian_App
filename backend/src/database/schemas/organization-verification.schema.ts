import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { VerificationStatus } from '@al-husseiniya/types';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type OrganizationVerificationDocument = OrganizationVerification & Document;

@Schema({ timestamps: true, collection: 'organization_verifications' })
export class OrganizationVerification {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ type: String, required: true, index: true })
  organizationId: string;

  @Prop({ type: String, enum: VerificationStatus, default: VerificationStatus.PENDING, index: true })
  status: VerificationStatus;

  @Prop({ type: String, default: null })
  reviewerId?: string | null;

  @Prop({ type: String, default: null })
  decision?: string | null;

  @Prop({ type: String, default: null })
  notes?: string | null;

  @Prop({ type: Date, default: null })
  reviewedAt?: Date | null;
}

export const OrganizationVerificationSchema = SchemaFactory.createForClass(OrganizationVerification);
applyVirtualIdAndCleanJson(OrganizationVerificationSchema);
