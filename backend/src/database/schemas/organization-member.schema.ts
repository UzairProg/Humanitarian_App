import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type OrganizationMemberDocument = OrganizationMember & Document;

@Schema({ timestamps: true, collection: 'organization_members' })
export class OrganizationMember {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ type: String, required: true, index: true })
  organizationId: string;

  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: String, default: 'STAFF' })
  role: string;

  @Prop({ type: String, default: 'ACTIVE' })
  status: string;
}

export const OrganizationMemberSchema = SchemaFactory.createForClass(OrganizationMember);
OrganizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
applyVirtualIdAndCleanJson(OrganizationMemberSchema);
