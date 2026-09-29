import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { RoleType, UserStatus, IUser } from '@al-husseiniya/types';

export interface UserDocument extends Omit<IUser, 'id'>, Document<string> {
  _id: string;
  id: string;
  passwordHash: string;
}

export const UserSchema = new Schema<UserDocument>(
  {
    _id: { type: String, default: uuidv4 },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, select: false, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, default: null },
    locale: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
      index: true,
    },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    avatarUrl: { type: String, default: null },
    roles: {
      type: [String],
      enum: Object.values(RoleType),
      default: [RoleType.INDIVIDUAL],
    },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'users',
  },
);

UserSchema.virtual('id').get(function (this: any) {
  return this._id;
});

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

UserSchema.set('toObject', { virtuals: true });

export const UserModel = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
