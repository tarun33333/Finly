import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['expense', 'income', 'transfer']),
    amount: z.number().positive('Amount must be greater than 0'),
    currency: z.string().default('INR'),
    categoryId: z.string().min(1, 'Category ID is required'),
    description: z.string().optional().default(''),
    merchant: z.string().optional().default(''),
    transactionDate: z.string().or(z.date()),
    transactionTime: z.string().optional(),
    paymentMethod: z
      .enum(['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Other'])
      .default('UPI'),
    paymentStatus: z
      .enum(['success', 'pending', 'failed', 'reversed'])
      .default('success'),
    source: z
      .enum(['manual', 'upi_screenshot', 'receipt', 'quick_text'])
      .default('manual'),
    attachmentUrl: z.string().optional(),
    attachmentPath: z.string().optional(),
    referenceId: z.string().optional(),
    extractionConfidence: z.number().min(0).max(1).optional(),
    userConfirmed: z.boolean().default(true),
    notes: z.string().optional(),
    isRecurring: z.boolean().default(false),
    allowDuplicate: z.boolean().optional(),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    type: z.enum(['expense', 'income', 'transfer']).optional(),
    amount: z.number().positive('Amount must be greater than 0').optional(),
    currency: z.string().optional(),
    categoryId: z.string().optional(),
    description: z.string().optional(),
    merchant: z.string().optional(),
    transactionDate: z.string().or(z.date()).optional(),
    transactionTime: z.string().optional(),
    paymentMethod: z
      .enum(['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Other'])
      .optional(),
    paymentStatus: z
      .enum(['success', 'pending', 'failed', 'reversed'])
      .optional(),
    notes: z.string().optional(),
    isRecurring: z.boolean().optional(),
  }),
});

export const queryTransactionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    type: z.enum(['expense', 'income', 'transfer']).optional(),
    categoryId: z.string().optional(),
    paymentMethod: z.string().optional(),
    paymentStatus: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['transactionDate', 'amount', 'createdAt']).default('transactionDate'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

