import mongoose from 'mongoose';
import { Category } from '../models/Category';
import { Transaction } from '../models/Transaction';
import { Budget } from '../models/Budget';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { logger } from './logger';

async function cleanupCategories() {
  try {
    await connectDatabase();
    logger.info('Starting category reference cleanup...');

    // 1. Get all system categories (userId: null)
    const systemCats = await Category.find({ userId: null });
    logger.info(`Found ${systemCats.length} system default categories.`);

    // 2. Check transactions pointing to system categories and remap them to the user's own category
    const txns = await Transaction.find({});
    let remappedTxns = 0;

    for (const txn of txns) {
      if (!txn.categoryId) continue;
      const cat = await Category.findById(txn.categoryId);
      if (cat && !cat.userId) {
        // This transaction points to a system category
        // Find matching user category for this user
        let userCat = await Category.findOne({
          userId: txn.userId,
          name: cat.name,
          type: cat.type,
        });

        if (!userCat) {
          // Clone it for the user if it doesn't exist
          userCat = await Category.create({
            userId: txn.userId,
            name: cat.name,
            type: cat.type,
            icon: cat.icon,
            color: cat.color,
            isDefault: true,
            isActive: true,
          });
        }

        txn.categoryId = userCat._id as any;
        await txn.save();
        remappedTxns++;
        logger.info(`Remapped transaction "${txn.merchant || txn.description}" to user category "${userCat.name}"`);
      }
    }

    logger.info(`Remapped ${remappedTxns} transactions to user-specific categories.`);

    // 3. Check budgets pointing to system categories
    const budgets = await Budget.find({});
    let remappedBudgets = 0;

    for (const budget of budgets) {
      if (!budget.categoryId) continue;
      const cat = await Category.findById(budget.categoryId);
      if (cat && !cat.userId) {
        const userCat = await Category.findOne({
          userId: budget.userId,
          name: cat.name,
          type: 'expense',
        });

        if (userCat) {
          budget.categoryId = userCat._id as any;
          await budget.save();
          remappedBudgets++;
          logger.info(`Remapped budget "${budget.name}" to user category "${userCat.name}"`);
        }
      }
    }

    logger.info(`Remapped ${remappedBudgets} budgets to user-specific categories.`);
    logger.info('Category reference cleanup completed successfully.');
    await disconnectDatabase();
  } catch (err) {
    logger.error({ err }, 'Error during category cleanup');
    process.exit(1);
  }
}

cleanupCategories();

