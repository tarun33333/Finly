import { z } from 'zod';

export const createBudgetSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Budget name must be at least 2 characters'),
    categoryId: z.string().nullable().optional(),
    limitAmount: z.number().positive('Limit amount must be greater than 0'),
    currency: z.string().default('INR'),
    period: z.enum(['monthly', 'weekly', 'custom']).default('monthly'),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    alertThresholds: z.array(z.number().min(1).max(100)).default([50, 75, 90, 100]),
  }),
});

export const updateBudgetSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    categoryId: z.string().nullable().optional(),
    limitAmount: z.number().positive().optional(),
    period: z.enum(['monthly', 'weekly', 'custom']).optional(),
    startDate: z.string().or(z.date()).optional(),
    endDate: z.string().or(z.date()).optional(),
    alertThresholds: z.array(z.number().min(1).max(100)).optional(),
  }),
});

