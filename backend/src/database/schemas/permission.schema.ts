import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { PermissionKey } from '@al-husseiniya/types';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type PermissionDocument = Permission & Document;

@Schema({ timestamps: true, collection: 'permissions' })
export class Permission {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ required: true, unique: true, index: true, enum: PermissionKey })
  key: PermissionKey;

  @Prop({ type: String, default: '' })
  description: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
applyVirtualIdAndCleanJson(PermissionSchema);
