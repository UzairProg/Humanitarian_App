import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { RoleType, PermissionKey } from '@al-husseiniya/types';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true, collection: 'roles' })
export class Role {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ required: true, unique: true, index: true, enum: RoleType })
  name: RoleType;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: Boolean, default: false })
  isSystem: boolean;

  @Prop({ type: [String], enum: PermissionKey, default: [] })
  permissions: PermissionKey[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
applyVirtualIdAndCleanJson(RoleSchema);
