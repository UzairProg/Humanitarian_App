import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type VolunteerProfileDocument = VolunteerProfile & Document;

@Schema({ timestamps: true, collection: 'volunteer_profiles' })
export class VolunteerProfile {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ type: String, required: true, unique: true, index: true })
  userId: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ required: true })
  availability: string;

  @Prop({ required: true })
  location: string;

  @Prop({ type: String, default: 'ACTIVE' })
  status: string;
}

export const VolunteerProfileSchema = SchemaFactory.createForClass(VolunteerProfile);
applyVirtualIdAndCleanJson(VolunteerProfileSchema);
