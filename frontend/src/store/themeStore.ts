import { create } from 'zustand';
import { Appearance } from 'react-native';
import { lightTheme, darkTheme, Theme } from '../theme';
import { storage } from '../utils/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  theme: Theme;
  isDark: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  initTheme: () => Promise<void>;
}

const getEffectiveTheme = (mode: ThemeMode): { theme: Theme; isDark: boolean } => {
  if (mode === 'system') {
    const systemScheme = Appearance.getColorScheme();
    const isDark = systemScheme === 'dark';
    return { theme: isDark ? darkTheme : lightTheme, isDark };
  }
  const isDark = mode === 'dark';
  return { theme: isDark ? darkTheme : lightTheme, isDark };
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  theme: lightTheme,
  isDark: false,

  setMode: async (mode: ThemeMode) => {
    const { theme, isDark } = getEffectiveTheme(mode);
    set({ mode, theme, isDark });
    await storage.setItem('finly_theme_mode', mode);
  },

  initTheme: async () => {
    const saved = await storage.getItem<ThemeMode>('finly_theme_mode');
    const mode = saved || 'system';
    const { theme, isDark } = getEffectiveTheme(mode);
    set({ mode, theme, isDark });
  },
}));

