import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { RoleType, UserStatus } from '@al-husseiniya/types';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: String, select: false, required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ type: String, default: null })
  phone?: string | null;

  @Prop({ type: String, default: 'en' })
  locale: string;

  @Prop({ type: String, default: 'UTC' })
  timezone: string;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE, index: true })
  status: UserStatus;

  @Prop({ type: Boolean, default: false })
  emailVerified: boolean;

  @Prop({ type: Boolean, default: false })
  phoneVerified: boolean;

  @Prop({ type: String, default: null })
  avatarUrl?: string | null;

  @Prop({ type: [String], enum: RoleType, default: [RoleType.INDIVIDUAL] })
  roles: RoleType[];

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.virtual('id').get(function (this: any) {
  return this._id;
});
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});
