import { describe, it, expect } from 'vitest';
import { formatINR, parseRupees } from '../src/utils/currency';
import { formatIndianDate } from '../src/utils/date';

describe('Finly Frontend Unit Tests', () => {
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

