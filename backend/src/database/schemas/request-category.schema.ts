import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { applyVirtualIdAndCleanJson } from './schema.utils';

export type RequestCategoryDocument = RequestCategory & Document;

@Schema({ timestamps: true, collection: 'request_categories' })
export class RequestCategory {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  get id(): string {
    return this._id;
  }

  @Prop({ required: true, unique: true, index: true, uppercase: true })
  code: string;

  @Prop({ required: true })
  nameEn: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ type: String, default: null })
  descriptionEn?: string | null;

  @Prop({ type: String, default: null })
  descriptionAr?: string | null;

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;
}

export const RequestCategorySchema = SchemaFactory.createForClass(RequestCategory);
applyVirtualIdAndCleanJson(RequestCategorySchema);
