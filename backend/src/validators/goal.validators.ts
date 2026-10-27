import { z } from 'zod';

export const createGoalSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    targetAmount: z.number().positive('Target amount must be greater than 0'),
    currency: z.string().default('INR'),
    targetDate: z.string().or(z.date()).optional(),
  }),
});

export const updateGoalSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(2).optional(),
    targetAmount: z.number().positive().optional(),
    targetDate: z.string().or(z.date()).optional(),
    status: z.enum(['in_progress', 'achieved', 'paused']).optional(),
  }),
});

export const contributeGoalSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    amount: z.number().positive('Contribution amount must be greater than 0'),
    notes: z.string().optional(),
  }),
});

