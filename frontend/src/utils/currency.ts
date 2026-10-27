/**
 * Indian Rupee (INR) formatting utility
 */
export const formatINR = (amount: number, showDecimals = true): string => {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  if (amount < 0) {
    return `-${formatted}`;
  }
  return formatted;
};

export const parseRupees = (input: string): number => {
  if (!input) return 0;
  const cleaned = input.replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

