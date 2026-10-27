import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Transaction } from '../models/Transaction';
import { Budget } from '../models/Budget';
import { Goal } from '../models/Goal';
import { Notification } from '../models/Notification';
import { ALL_DEFAULT_CATEGORIES } from '../constants/categories';
import { hashPassword } from './password';
import { toPaise } from './currency';
import { logger } from './logger';

async function seed() {
  console.log('🌱 Starting Finly database seeding...');
  await connectDatabase();

  const demoEmail = 'demo@finly.app';
  await User.deleteOne({ email: demoEmail });

  const passwordHash = await hashPassword('DemoPassword123!');
  const user = await User.create({
    name: 'Rahul Sharma',
    email: demoEmail,
    passwordHash,
    emailVerified: true,
    currency: 'INR',
    themePreference: 'system',
    monthlyIncomeTarget: 85000,
    monthlySpendingTarget: 50000,
    onboardingCompleted: true,
    preferences: {
      weeklySummary: true,
      budgetAlerts: true,
      biometricEnabled: false,
    },
  });

  // Seed user categories
  const categoriesToInsert = ALL_DEFAULT_CATEGORIES.map((cat) => ({
    userId: user._id,
    name: cat.name,
    type: cat.type,
    icon: cat.icon,
    color: cat.color,
    isDefault: true,
    isActive: true,
  }));
  const insertedCategories = await Category.insertMany(categoriesToInsert);

  const getCatId = (name: string) => {
    const c = insertedCategories.find((cat) => cat.name === name);
    return c ? c._id : insertedCategories[0]._id;
  };

  // Seed sample transactions in current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const sampleTransactions = [
    {
      userId: user._id,
      type: 'income',
      amount: 85000,
      amountInPaise: toPaise(85000),
      currency: 'INR',
      categoryId: getCatId('Salary'),
      merchant: 'Tata Consultancy Services',
      description: 'Monthly Salary Credit',
      transactionDate: new Date(year, month, 1, 9, 30),
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'success',
      source: 'manual',
    },
    {
      userId: user._id,
      type: 'expense',
      amount: 22000,
      amountInPaise: toPaise(22000),
      currency: 'INR',
      categoryId: getCatId('Rent & Housing'),
      merchant: 'House Owner - Rajan',
      description: 'Monthly Apartment Rent',
      transactionDate: new Date(year, month, 2, 10, 0),
      paymentMethod: 'UPI',
      paymentStatus: 'success',
      referenceId: 'UPI/428192019283/RENT',
      source: 'upi_screenshot',
    },
    {
      userId: user._id,
      type: 'expense',
      amount: 1450,
      amountInPaise: toPaise(1450),
      currency: 'INR',
      categoryId: getCatId('Bills & Utilities'),
      merchant: 'BESCOM Electricity',
      description: 'Electricity bill for October',
      transactionDate: new Date(year, month, 5, 14, 15),
      paymentMethod: 'UPI',
      paymentStatus: 'success',
      referenceId: 'UPI/983726152431/BESCOM',
      source: 'upi_screenshot',
    },
    {
      userId: user._id,
      type: 'expense',
      amount: 450,
      amountInPaise: toPaise(450),
      currency: 'INR',
      categoryId: getCatId('Food & Dining'),
      merchant: 'Swiggy',
      description: 'Lunch Biryani',
      transactionDate: new Date(year, month, 6, 13, 30),
      paymentMethod: 'UPI',
      paymentStatus: 'success',
      source: 'upi_screenshot',
    },
    {
      userId: user._id,
      type: 'expense',
      amount: 2350,
      amountInPaise: toPaise(2350),
      currency: 'INR',
      categoryId: getCatId('Groceries'),
      merchant: 'Blinkit',
      description: 'Weekly grocery essentials',
      transactionDate: new Date(year, month, 8, 18, 45),
      paymentMethod: 'UPI',
      paymentStatus: 'success',
      source: 'upi_screenshot',
    },
    {
      userId: user._id,
      type: 'expense',
      amount: 180,
      amountInPaise: toPaise(180),
      currency: 'INR',
      categoryId: getCatId('Transportation'),
      merchant: 'Uber Auto',
      description: 'Ride to office',
      transactionDate: new Date(year, month, 10, 8, 45),
      paymentMethod: 'UPI',
      paymentStatus: 'success',
      source: 'upi_screenshot',
    },
    {
      userId: user._id,
      type: 'expense',
      amount: 649,
      amountInPaise: toPaise(649),
      currency: 'INR',
      categoryId: getCatId('Subscriptions'),
      merchant: 'Netflix',
      description: 'Premium Family Plan',
      transactionDate: new Date(year, month, 12, 11, 0),
      paymentMethod: 'Credit Card',
      paymentStatus: 'success',
      isRecurring: true,
      source: 'manual',
    },
    {
      userId: user._id,
      type: 'expense',
      amount: 3200,
      amountInPaise: toPaise(3200),
      currency: 'INR',
      categoryId: getCatId('Shopping'),
      merchant: 'Myntra',
      description: 'Running shoes & athletic t-shirt',
      transactionDate: new Date(year, month, 15, 20, 10),
      paymentMethod: 'UPI',
      paymentStatus: 'success',
      source: 'manual',
    },
    {
      userId: user._id,
      type: 'expense',
      amount: 2000,
      amountInPaise: toPaise(2000),
      currency: 'INR',
      categoryId: getCatId('Fuel'),
      merchant: 'Indian Oil Petrol Pump',
      description: 'Full tank petrol',
      transactionDate: new Date(year, month, 18, 17, 30),
      paymentMethod: 'UPI',
      paymentStatus: 'success',
      source: 'receipt',
    },
    {
      userId: user._id,
      type: 'income',
      amount: 12000,
      amountInPaise: toPaise(12000),
      currency: 'INR',
      categoryId: getCatId('Freelancing'),
      merchant: 'Design Client',
      description: 'Mobile App UI Consulting',
      transactionDate: new Date(year, month, 20, 16, 0),
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'success',
      source: 'manual',
    },
  ];

  await Transaction.insertMany(sampleTransactions);

  // Seed Budgets
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

  await Budget.create([
    {
      userId: user._id,
      name: 'Overall Monthly Budget',
      categoryId: null,
      limitAmount: 50000,
      limitAmountInPaise: toPaise(50000),
      period: 'monthly',
      startDate: monthStart,
      endDate: monthEnd,
      alertThresholds: [50, 75, 90, 100],
    },
    {
      userId: user._id,
      name: 'Food & Dining Budget',
      categoryId: getCatId('Food & Dining'),
      limitAmount: 8000,
      limitAmountInPaise: toPaise(8000),
      period: 'monthly',
      startDate: monthStart,
      endDate: monthEnd,
      alertThresholds: [50, 75, 90, 100],
    },
    {
      userId: user._id,
      name: 'Groceries Budget',
      categoryId: getCatId('Groceries'),
      limitAmount: 10000,
      limitAmountInPaise: toPaise(10000),
      period: 'monthly',
      startDate: monthStart,
      endDate: monthEnd,
      alertThresholds: [50, 75, 90, 100],
    },
  ]);

  // Seed Savings Goal
  await Goal.create({
    userId: user._id,
    title: 'Emergency Fund (6 Months)',
    targetAmount: 250000,
    targetAmountInPaise: toPaise(250000),
    currentAmount: 110000,
    currentAmountInPaise: toPaise(110000),
    targetDate: new Date(year + 1, 5, 30),
    currency: 'INR',
    status: 'in_progress',
    contributions: [
      {
        amount: 25000,
        amountInPaise: toPaise(25000),
        date: new Date(year, month - 1, 5),
        notes: 'Monthly allocation',
      },
    ],
  });

  // Seed Sample Notifications
  await Notification.create({
    userId: user._id,
    type: 'weekly_summary',
    title: 'Weekly Financial Summary',
    message: 'You spent ₹5,430 this week across 4 transactions. You are within your monthly target.',
  });

  console.log('✅ Demo data seeded successfully!');
  console.log(`👤 Demo Account: ${demoEmail}`);
  console.log('🔑 Password: DemoPassword123!');
  await disconnectDatabase();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

