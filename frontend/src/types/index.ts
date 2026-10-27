export type TransactionType = 'expense' | 'income' | 'transfer';
export type PaymentMethod = 'UPI' | 'Cash' | 'Debit Card' | 'Credit Card' | 'Bank Transfer' | 'Other';
export type PaymentStatus = 'success' | 'pending' | 'failed' | 'reversed';
export type TransactionSource = 'manual' | 'upi_screenshot' | 'receipt' | 'quick_text';

export interface User {
  _id: string;
  name: string;
  email: string;
  currency: string;
  themePreference: 'system' | 'light' | 'dark';
  monthlyIncomeTarget?: number;
  monthlySpendingTarget?: number;
  preferences: {
    weeklySummary: boolean;
    budgetAlerts: boolean;
    biometricEnabled: boolean;
  };
  onboardingCompleted: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  userId?: string | null;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  amountInPaise: number;
  currency: string;
  categoryId: Category | string;
  description: string;
  merchant: string;
  transactionDate: string;
  transactionTime?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  source: TransactionSource;
  attachmentUrl?: string;
  attachmentPath?: string;
  referenceId?: string;
  extractionConfidence?: number;
  userConfirmed: boolean;
  notes?: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  _id: string;
  userId: string;
  name: string;
  categoryId?: Category | string | null;
  limitAmount: number;
  currency: string;
  period: 'monthly' | 'weekly' | 'custom';
  startDate: string;
  endDate: string;
  alertThresholds: number[];
  progress?: {
    spent: number;
    remaining: number;
    percentage: number;
    isOverBudget: boolean;
    overAmount: number;
    dailyAverage: number;
    projectedSpend: number;
  };
}

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  currency: string;
  status: 'in_progress' | 'achieved' | 'paused';
  remainingAmount?: number;
  percentage?: number;
  suggestedMonthly?: number;
  contributions: Array<{
    amount: number;
    date: string;
    notes?: string;
  }>;
}

export interface Insight {
  _id: string;
  userId: string;
  type: 'spending_increase' | 'budget_warning' | 'subscription_review' | 'saving_opportunity' | 'positive_habit' | 'unusual_expense';
  title: string;
  explanation: string;
  metrics: Record<string, any>;
  estimatedSaving?: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  dismissedAt?: string | null;
  feedback?: 'helpful' | 'not_helpful' | null;
}

export interface FinancialSummary {
  periodIncome: number;
  periodExpense: number;
  netFlow: number;
  estimatedBalance: number;
  currency: string;
  incomeCount: number;
  expenseCount: number;
  isEstimatedBalance: boolean;
}

export interface ExtractedUpiResult {
  extracted: {
    amount: number;
    currency: string;
    transactionType: TransactionType;
    category: string;
    categoryId?: string;
    categoryName?: string;
    merchant: string;
    description: string;
    transactionDate: string;
    transactionTime?: string | null;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    referenceId?: string | null;
    confidence: number;
    needsReview: boolean;
    warnings: string[];
  };
  duplicateCheck?: {
    isDuplicate: boolean;
    duplicateReason?: string;
    existingTxnId?: string;
  };
  attachmentPath: string;
}

