import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPreferences {
  weeklySummary: boolean;
  budgetAlerts: boolean;
  biometricEnabled: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  googleSubject?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  currency: string;
  themePreference: 'system' | 'light' | 'dark';
  monthlyIncomeTarget?: number;
  monthlySpendingTarget?: number;
  preferences: IUserPreferences;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, select: false },
    googleSubject: { type: String, sparse: true, index: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    currency: { type: String, default: 'INR', uppercase: true },
    themePreference: {
      type: String,
      enum: ['system', 'light', 'dark'],
      default: 'system',
    },
    monthlyIncomeTarget: { type: Number, min: 0 },
    monthlySpendingTarget: { type: Number, min: 0 },
    preferences: {
      weeklySummary: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      biometricEnabled: { type: Boolean, default: false },
    },
    onboardingCompleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret.passwordHash;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
