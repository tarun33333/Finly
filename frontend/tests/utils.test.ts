import { describe, it, expect } from 'vitest';
import { formatINR, parseRupees } from '../src/utils/currency';
import { formatIndianDate } from '../src/utils/date';
import { deduplicateCategories } from '../src/utils/category';
import { Category } from '../src/types';

describe('Finly Frontend Unit Tests', () => {
  describe('Category Deduplication', () => {
    it('removes duplicate categories sharing the same name and type', () => {
      const input: Category[] = [
        {
          _id: 'user_1',
          userId: 'user_123',
          name: 'Food & Dining',
          type: 'expense',
          icon: 'Utensils',
          color: '#FF5733',
          isDefault: true,
          isActive: true,
        },
        {
          _id: 'sys_1',
          userId: null as any,
          name: 'Food & Dining',
          type: 'expense',
          icon: 'Utensils',
          color: '#FF5733',
          isDefault: true,
          isActive: true,
        },
        {
          _id: 'user_2',
          userId: 'user_123',
          name: 'Shopping',
          type: 'expense',
          icon: 'ShoppingBag',
          color: '#33FF57',
          isDefault: true,
          isActive: true,
        },
      ];

      const deduped = deduplicateCategories(input);
      expect(deduped.length).toBe(2);
      expect(deduped.map((c) => c.name)).toEqual(['Food & Dining', 'Shopping']);
      // Prioritizes the user's category over null system category
      const food = deduped.find((c) => c.name === 'Food & Dining');
      expect(food?._id).toBe('user_1');
    });

    it('returns empty array when input is null or undefined', () => {
      expect(deduplicateCategories(null)).toEqual([]);
      expect(deduplicateCategories(undefined)).toEqual([]);
    });
  });

  describe('Indian Rupee (INR) Formatting', () => {
    it('formats integer rupees correctly in en-IN format', () => {
      const formatted = formatINR(125000);
      expect(formatted).toContain('1,25,000');
    });

    it('formats decimals correctly', () => {
      const formatted = formatINR(350.5);
      expect(formatted).toContain('350.50');
    });

    it('handles negative amounts correctly', () => {
      const formatted = formatINR(-450);
      expect(formatted.startsWith('-')).toBe(true);
      expect(formatted).toContain('450');
    });

    it('parses formatted strings into numeric values', () => {
      expect(parseRupees('₹1,25,000.50')).toBe(125000.5);
      expect(parseRupees('450')).toBe(450);
      expect(parseRupees('')).toBe(0);
    });
  });

  describe('Indian Date Formatting', () => {
    it('formats ISO date into Indian localized date string', () => {
      const date = new Date('2026-10-27T10:00:00Z');
      const formatted = formatIndianDate(date);
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Oct');
    });
  });
});

