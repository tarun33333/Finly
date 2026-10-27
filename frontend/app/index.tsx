import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { useThemeStore } from '../src/store/themeStore';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, isBiometricLocked } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
    } else if (isBiometricLocked) {
      router.replace('/(auth)/login');
    } else if (user && !user.onboardingCompleted) {
      router.replace('/(auth)/onboarding');
    } else {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, isBiometricLocked, user]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

