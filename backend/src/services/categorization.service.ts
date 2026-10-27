import { Transaction } from '../models/Transaction';
import { Category, ICategory } from '../models/Category';
import mongoose from 'mongoose';

// Deterministic keywords mapped to category names
const MERCHANT_KEYWORD_RULES: Record<string, string> = {
  // Food & Dining
  swiggy: 'Food & Dining',
  zomato: 'Food & Dining',
  mcdonald: 'Food & Dining',
  starbucks: 'Food & Dining',
  'chai point': 'Food & Dining',
  domino: 'Food & Dining',
  haldiram: 'Food & Dining',
  'burger king': 'Food & Dining',
  pizza: 'Food & Dining',
  restaurant: 'Food & Dining',
  cafe: 'Food & Dining',
  dhaba: 'Food & Dining',
  baker: 'Food & Dining',

  // Groceries
  blinkit: 'Groceries',
  zepto: 'Groceries',
  bigbasket: 'Groceries',
  dmart: 'Groceries',
  'nature basket': 'Groceries',
  'reliance smart': 'Groceries',
  kirana: 'Groceries',
  supermarket: 'Groceries',
  grocer: 'Groceries',
  vegetable: 'Groceries',
  fruit: 'Groceries',

  // Transportation
  uber: 'Transportation',
  ola: 'Transportation',
  rapido: 'Transportation',
  irctc: 'Transportation',
  redbus: 'Transportation',
  metro: 'Transportation',
  railway: 'Transportation',
  auto: 'Transportation',
  cab: 'Transportation',

  // Fuel
  'indian oil': 'Fuel',
  iocl: 'Fuel',
  'bharat petroleum': 'Fuel',
  bpcl: 'Fuel',
  hpcl: 'Fuel',
  shell: 'Fuel',
  petrol: 'Fuel',
  diesel: 'Fuel',
  cng: 'Fuel',

  // Shopping
  amazon: 'Shopping',
  flipkart: 'Shopping',
  myntra: 'Shopping',
  nykaa: 'Shopping',
  ajio: 'Shopping',
  zara: 'Shopping',
  retail: 'Shopping',
  cloth: 'Shopping',
  fashion: 'Shopping',

  // Bills & Utilities
  bescom: 'Bills & Utilities',
  'tata power': 'Bills & Utilities',
  electricity: 'Bills & Utilities',
  airtel: 'Bills & Utilities',
  jio: 'Bills & Utilities',
  vodafone: 'Bills & Utilities',
  vi: 'Bills & Utilities',
  fibernet: 'Bills & Utilities',
  broadband: 'Bills & Utilities',
  gas: 'Bills & Utilities',
  water: 'Bills & Utilities',

  // Subscriptions
  netflix: 'Subscriptions',
  spotify: 'Subscriptions',
  hotstar: 'Subscriptions',
  prime: 'Subscriptions',
  youtube: 'Subscriptions',
  subscription: 'Subscriptions',

  // Healthcare
  apollo: 'Healthcare',
  medplus: 'Healthcare',
  pharmeasy: 'Healthcare',
  '1mg': 'Healthcare',
  pharmacy: 'Healthcare',
  hospital: 'Healthcare',
  clinic: 'Healthcare',
  doctor: 'Healthcare',

  // Investments
  zerodha: 'Investments',
  groww: 'Investments',
  upstox: 'Investments',
  kuvera: 'Investments',
  'mutual fund': 'Investments',

  // Salary & Income
  salary: 'Salary',
  payroll: 'Salary',
  freelance: 'Freelancing',
  upwork: 'Freelancing',
  fiverr: 'Freelancing',
};

class CategorizationService {
  /**
   * Suggest category using merchant rules and historical user habits
   */
  async suggestCategory(
    userId: string | mongoose.Types.ObjectId,
    merchantName: string,
    description = '',
    transactionType: 'expense' | 'income' = 'expense'
  ): Promise<{ categoryId: string; categoryName: string; confidence: number }> {
    const combinedText = `${merchantName} ${description}`.toLowerCase().trim();

    // 1. Check user's own historical confirmed transactions for this merchant
    if (merchantName) {
      const pastTxn = await Transaction.findOne({
        userId,
        merchant: { $regex: new RegExp(`^${merchantName.trim()}$`, 'i') },
        userConfirmed: true,
      })
        .sort({ createdAt: -1 })
        .populate<{ categoryId: ICategory }>('categoryId');

      if (pastTxn && pastTxn.categoryId) {
        return {
          categoryId: pastTxn.categoryId._id.toString(),
          categoryName: pastTxn.categoryId.name,
          confidence: 0.95,
        };
      }
    }

    // 2. Check deterministic keyword rules
    for (const [keyword, categoryName] of Object.entries(MERCHANT_KEYWORD_RULES)) {
      if (combinedText.includes(keyword)) {
        const cat = await Category.findOne({
          $or: [{ userId }, { userId: null, isDefault: true }],
          name: categoryName,
          type: transactionType,
          isActive: true,
        });

        if (cat) {
          return {
            categoryId: cat._id.toString(),
            categoryName: cat.name,
            confidence: 0.85,
          };
        }
      }
    }

    // 3. Fallback to default "Other" or "Other Income"
    const fallbackName = transactionType === 'income' ? 'Other Income' : 'Other';
    const fallbackCat = await Category.findOne({
      $or: [{ userId }, { userId: null, isDefault: true }],
      name: fallbackName,
      type: transactionType,
    });

    if (fallbackCat) {
      return {
        categoryId: fallbackCat._id.toString(),
        categoryName: fallbackCat.name,
        confidence: 0.4,
      };
    }

    // If no category found at all, find first available
    const anyCat = await Category.findOne({
      $or: [{ userId }, { userId: null }],
      type: transactionType,
      isActive: true,
    });

    return {
      categoryId: anyCat ? anyCat._id.toString() : '',
      categoryName: anyCat ? anyCat.name : fallbackName,
      confidence: 0.3,
    };
  }
}

export const categorizationService = new CategorizationService();

