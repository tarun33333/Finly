import { palette } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';
import { shadows } from './shadows';
import { Theme } from './lightTheme';

export const darkTheme: Theme = {
  isDark: true,
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
    background: palette.dark.background,
    surface: palette.dark.surface,
    surfaceElevated: palette.dark.surfaceElevated,
    textPrimary: palette.dark.textPrimary,
    textSecondary: palette.dark.textSecondary,
    textMuted: palette.dark.textMuted,
    border: palette.dark.border,
    borderSubtle: palette.dark.borderSubtle,
    card: palette.dark.card,
    cardBorder: palette.dark.cardBorder,
    badgeBackground: palette.dark.badgeBackground,
  },
  typography,
  spacing,
  borderRadius,
  shadows,
};

