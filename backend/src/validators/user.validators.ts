import { z } from 'zod';

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(60).optional(),
    currency: z.string().optional(),
    themePreference: z.enum(['system', 'light', 'dark']).optional(),
    monthlyIncomeTarget: z.number().min(0).optional(),
    monthlySpendingTarget: z.number().min(0).optional(),
    preferences: z
      .object({
        weeklySummary: z.boolean().optional(),
        budgetAlerts: z.boolean().optional(),
        biometricEnabled: z.boolean().optional(),
      })
      .optional(),
    onboardingCompleted: z.boolean().optional(),
  }),
});

