import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { RoleType, PermissionKey, IRole } from '@al-husseiniya/types';

export interface RoleDocument extends Omit<IRole, 'id'>, Document<string> {
  _id: string;
  id: string;
  permissions: PermissionKey[];
}

export const RoleSchema = new Schema<RoleDocument>(
  {
    _id: { type: String, default: uuidv4 },
    name: {
      type: String,
      enum: Object.values(RoleType),
      required: true,
      unique: true,
      index: true,
    },
    description: { type: String, required: true },
    isSystem: { type: Boolean, default: true },
    permissions: [{ type: String, enum: Object.values(PermissionKey) }],
  },
  {
    timestamps: true,
    collection: 'roles',
  },
);

RoleSchema.virtual('id').get(function (this: any) {
  return this._id;
});

RoleSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

RoleSchema.set('toObject', { virtuals: true });

export const RoleModel = mongoose.models.Role || mongoose.model<RoleDocument>('Role', RoleSchema);
