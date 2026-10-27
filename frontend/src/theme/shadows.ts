import { ViewStyle, Platform } from 'react-native';

export const shadows: Record<string, ViewStyle> = {
  sm: Platform.select({
    ios: {
      shadowColor: '#171A2B',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {
      boxShadow: '0 1px 2px rgba(23, 26, 43, 0.05)',
    } as any,
  }) || {},
  md: Platform.select({
    ios: {
      shadowColor: '#171A2B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {
      boxShadow: '0 4px 8px rgba(23, 26, 43, 0.08)',
    } as any,
  }) || {},
  lg: Platform.select({
    ios: {
      shadowColor: '#635BFF',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {
      boxShadow: '0 8px 16px rgba(99, 91, 255, 0.15)',
    } as any,
  }) || {},
};

