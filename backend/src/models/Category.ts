import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  userId?: mongoose.Types.ObjectId; // null for system default
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['expense', 'income'], required: true },
    icon: { type: String, required: true, default: 'Tag' },
    color: { type: String, required: true, default: '#635BFF' },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);

