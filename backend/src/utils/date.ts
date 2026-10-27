/**
 * Date and timezone utilities for Finly.
 * Default timezone: Asia/Kolkata (+05:30) for Indian users.
 */

export const getTimezoneOffsetMinutes = (timezone = 'Asia/Kolkata'): number => {
  // Asia/Kolkata is UTC+5:30 => 330 minutes
  if (timezone === 'Asia/Kolkata') return 330;
  return 0;
};

export const getMonthDateRange = (
  year?: number,
  month?: number // 1-12
): { startDate: Date; endDate: Date } => {
  const now = new Date();
  const targetYear = year ?? now.getFullYear();
  const targetMonth = month !== undefined ? month - 1 : now.getMonth();

  const startDate = new Date(Date.UTC(targetYear, targetMonth, 1, 0, 0, 0, 0));
  // End of month is day 0 of next month
  const endDate = new Date(Date.UTC(targetYear, targetMonth + 1, 0, 23, 59, 59, 999));

  return { startDate, endDate };
};

export const getWeekDateRange = (referenceDate = new Date()): { startDate: Date; endDate: Date } => {
  const date = new Date(referenceDate);
  const day = date.getDay(); // 0 is Sunday
  const diffToMonday = date.getDate() - day + (day === 0 ? -6 : 1);
  
  const monday = new Date(date.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { startDate: monday, endDate: sunday };
};

export const formatIndianDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(d);
};

