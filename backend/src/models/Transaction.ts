import mongoose, { Schema, Document } from 'mongoose';

export type TransactionType = 'expense' | 'income' | 'transfer';
export type PaymentMethod = 'UPI' | 'Cash' | 'Debit Card' | 'Credit Card' | 'Bank Transfer' | 'Other';
export type PaymentStatus = 'success' | 'pending' | 'failed' | 'reversed';
export type TransactionSource = 'manual' | 'upi_screenshot' | 'receipt' | 'quick_text';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number; // in Rupees
  amountInPaise: number; // integer minor units
  currency: string;
  categoryId: mongoose.Types.ObjectId;
  description: string;
  merchant: string;
  transactionDate: Date;
  transactionTime?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  source: TransactionSource;
  attachmentUrl?: string;
  attachmentPath?: string;
  referenceId?: string; // UPI Ref / UTR / Txn Id
  extractionConfidence?: number;
  userConfirmed: boolean;
  notes?: string;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['expense', 'income', 'transfer'], required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    amountInPaise: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    description: { type: String, trim: true, default: '' },
    merchant: { type: String, trim: true, default: '' },
    transactionDate: { type: Date, required: true, index: true },
    transactionTime: { type: String, trim: true },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Other'],
      default: 'UPI',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['success', 'pending', 'failed', 'reversed'],
      default: 'success',
      index: true,
    },
    source: {
      type: String,
      enum: ['manual', 'upi_screenshot', 'receipt', 'quick_text'],
      default: 'manual',
    },
    attachmentUrl: { type: String },
    attachmentPath: { type: String },
    referenceId: { type: String, trim: true, index: true },
    extractionConfidence: { type: Number, min: 0, max: 1 },
    userConfirmed: { type: Boolean, default: true },
    notes: { type: String, trim: true },
    isRecurring: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound indexes for optimal queries
TransactionSchema.index({ userId: 1, transactionDate: -1 });
TransactionSchema.index({ userId: 1, type: 1, transactionDate: -1 });
TransactionSchema.index({ userId: 1, categoryId: 1, transactionDate: -1 });
TransactionSchema.index({ userId: 1, referenceId: 1 }, { sparse: true });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);

