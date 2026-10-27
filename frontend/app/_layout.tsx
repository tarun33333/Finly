import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeStore } from '../src/store/themeStore';
import { useAuthStore } from '../src/store/authStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { storage } from '../src/utils/storage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

function RootNavigator() {
  const router = useRouter();
  const { theme, isDark, initTheme } = useThemeStore();
  const { restoreSession, isLoading } = useAuthStore();

  useEffect(() => {
    initTheme();
    restoreSession();

    // Deep link listener for OAuth redirect (e.g. finly://auth/callback?accessToken=...&refreshToken=...)
    const handleDeepLink = async (event: { url: string }) => {
      try {
        const parsed = Linking.parse(event.url);
        const accessToken = (parsed.queryParams?.accessToken as string) || '';
        const refreshToken = (parsed.queryParams?.refreshToken as string) || '';

        if (accessToken && refreshToken) {
          await storage.setSecureItem('finly_access_token', accessToken);
          await storage.setSecureItem('finly_refresh_token', refreshToken);
          await restoreSession();
          router.replace('/(tabs)');
        }
      } catch (err) {
        console.warn('Error handling deep link:', err);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (isLoading) {
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

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="transactions/add"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="transactions/[id]" />
        <Stack.Screen name="transactions/edit/[id]" />
        <Stack.Screen name="transactions/review-import" options={{ presentation: 'modal' }} />
        <Stack.Screen name="upload/receipt" />
        <Stack.Screen name="upload/processing" />
        <Stack.Screen name="budgets/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="budgets/[id]" />
        <Stack.Screen name="reports/index" />
        <Stack.Screen name="insights/index" />
        <Stack.Screen name="settings/index" />
        <Stack.Screen name="settings/appearance" />
        <Stack.Screen name="settings/security" />
        <Stack.Screen name="settings/notifications" />
        <Stack.Screen name="settings/categories" />
        <Stack.Screen name="settings/data-export" />
        <Stack.Screen name="premium/index" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

