import { palette } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';
import { shadows } from './shadows';

export const lightTheme = {
  isDark: false,
  colors: {
    primary: palette.primary,
    primaryDark: palette.primaryDark,
    primaryLight: palette.primaryLight,
    secondary: palette.secondary,
    accent: palette.accent,
    info: palette.info,
    expense: palette.expense,
    income: palette.income,
    warning: palette.warning,
    white: palette.white,
    black: palette.black,
    background: palette.light.background,
    surface: palette.light.surface,
    surfaceElevated: palette.light.surfaceElevated,
    textPrimary: palette.light.textPrimary,
    textSecondary: palette.light.textSecondary,
    textMuted: palette.light.textMuted,
    border: palette.light.border,
    borderSubtle: palette.light.borderSubtle,
    card: palette.light.card,
    cardBorder: palette.light.cardBorder,
    badgeBackground: palette.light.badgeBackground,
  },
  typography,
  spacing,
  borderRadius,
  shadows,
};

export type Theme = typeof lightTheme;

