/**
 * Currency utilities for Indian Rupee (INR) and multi-currency support.
 * Amounts are tracked in integer minor units (paise for INR, cents for USD)
 * to avoid IEEE 754 floating-point errors.
 */

export const toPaise = (rupees: number): number => {
  return Math.round(rupees * 100);
};

export const toRupees = (paise: number): number => {
  return Number((paise / 100).toFixed(2));
};

export const formatINR = (rupees: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
};

export const parseAmount = (input: string | number): number => {
  if (typeof input === 'number') return input;
  // Clean currency symbols, commas, spaces
  const cleaned = input.replace(/[₹$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

