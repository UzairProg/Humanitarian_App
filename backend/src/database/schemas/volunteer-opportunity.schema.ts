import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type VolunteerOpportunityDocument = VolunteerOpportunity & Document;

@Schema({ timestamps: true, collection: 'volunteer_opportunities' })
export class VolunteerOpportunity {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ type: String, required: true, index: true })
  organizationId: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location: string;

  @Prop({ type: Date, required: true, index: true })
  startAt: Date;

  @Prop({ type: Date, required: true })
  endAt: Date;

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop({ type: Number, default: 10 })
  capacity: number;

  @Prop({ type: String, default: 'OPEN', index: true })
  status: string;
}

export const VolunteerOpportunitySchema = SchemaFactory.createForClass(VolunteerOpportunity);
applyVirtualIdAndCleanJson(VolunteerOpportunitySchema);
