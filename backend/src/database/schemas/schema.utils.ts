import { Schema } from 'mongoose';

export function applyVirtualIdAndCleanJson(schema: Schema): void {
  schema.virtual('id').get(function (this: any) {
    return this._id;
  });

  schema.set('toJSON', {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      delete ret.__v;
      return ret;
    },
  });
}
