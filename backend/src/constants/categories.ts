export interface DefaultCategoryDef {
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
}

export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategoryDef[] = [
  { name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#F97373' },
  { name: 'Groceries', type: 'expense', icon: 'ShoppingBag', color: '#10B981' },
  { name: 'Transportation', type: 'expense', icon: 'Car', color: '#3B82F6' },
  { name: 'Fuel', type: 'expense', icon: 'Fuel', color: '#F59E0B' },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingCart', color: '#EC4899' },
  { name: 'Bills & Utilities', type: 'expense', icon: 'Zap', color: '#8B5CF6' },
  { name: 'Rent & Housing', type: 'expense', icon: 'Home', color: '#6366F1' },
  { name: 'Healthcare', type: 'expense', icon: 'HeartPulse', color: '#EF4444' },
  { name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#06B6D4' },
  { name: 'Entertainment', type: 'expense', icon: 'Film', color: '#84CC16' },
  { name: 'Travel', type: 'expense', icon: 'Plane', color: '#14B8A6' },
  { name: 'Subscriptions', type: 'expense', icon: 'Tv', color: '#A855F7' },
  { name: 'Personal Care', type: 'expense', icon: 'Sparkles', color: '#F43F5E' },
  { name: 'Family', type: 'expense', icon: 'Users', color: '#FB923C' },
  { name: 'Gifts & Donations', type: 'expense', icon: 'Gift', color: '#D946EF' },
  { name: 'EMI & Loan Payments', type: 'expense', icon: 'CreditCard', color: '#64748B' },
  { name: 'Investments', type: 'expense', icon: 'TrendingUp', color: '#22C55E' },
  { name: 'Other', type: 'expense', icon: 'MoreHorizontal', color: '#94A3B8' },
];

export const DEFAULT_INCOME_CATEGORIES: DefaultCategoryDef[] = [
  { name: 'Salary', type: 'income', icon: 'Briefcase', color: '#16A34A' },
  { name: 'Freelancing', type: 'income', icon: 'Laptop', color: '#20C997' },
  { name: 'Business Income', type: 'income', icon: 'Building2', color: '#0D9488' },
  { name: 'Interest', type: 'income', icon: 'Percent', color: '#0284C7' },
  { name: 'Refunds', type: 'income', icon: 'RotateCcw', color: '#635BFF' },
  { name: 'Gifts Received', type: 'income', icon: 'Gift', color: '#E11D48' },
  { name: 'Other Income', type: 'income', icon: 'PlusCircle', color: '#10B981' },
];

export const ALL_DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

