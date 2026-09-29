import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { PermissionKey, IPermission } from '@al-husseiniya/types';

export interface PermissionDocument extends Omit<IPermission, 'id'>, Document<string> {
  _id: string;
  id: string;
}

export const PermissionSchema = new Schema<PermissionDocument>(
  {
    _id: { type: String, default: uuidv4 },
    key: {
      type: String,
      enum: Object.values(PermissionKey),
      required: true,
      unique: true,
      index: true,
    },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'permissions',
  },
);

PermissionSchema.virtual('id').get(function (this: any) {
  return this._id;
});

PermissionSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

PermissionSchema.set('toObject', { virtuals: true });

export const PermissionModel =
  mongoose.models.Permission ||
  mongoose.model<PermissionDocument>('Permission', PermissionSchema);
