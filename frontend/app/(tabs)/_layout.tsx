import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';
import { Tabs, useRouter, useSegments, usePathname } from 'expo-router';
import { useThemeStore } from '../../src/store/themeStore';
import { Home, Receipt, BarChart3, PiggyBank, User } from 'lucide-react-native';

const TAB_KEYS = ['index', 'transactions', 'analytics', 'budgets', 'profile'] as const;
const TAB_ROUTES = [
  '/(tabs)',
  '/(tabs)/transactions',
  '/(tabs)/analytics',
  '/(tabs)/budgets',
  '/(tabs)/profile',
] as const;

export default function TabLayout() {
  const { theme } = useThemeStore();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  // Determine current active tab index
  let currentTab = 'index';
  if (segments[0] === '(tabs)' && segments[1]) {
    currentTab = segments[1];
  } else if (pathname.includes('transactions')) {
    currentTab = 'transactions';
  } else if (pathname.includes('analytics')) {
    currentTab = 'analytics';
  } else if (pathname.includes('budgets')) {
    currentTab = 'budgets';
  } else if (pathname.includes('profile')) {
    currentTab = 'profile';
  }

  const currentIndex = TAB_KEYS.indexOf(currentTab as any);
  const currentTabRef = useRef(currentIndex);
  currentTabRef.current = currentIndex;

  // Horizontal pan responder to enable natural swipe left/right tab switching
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const { pageY } = evt.nativeEvent;
        const screenHeight = Dimensions.get('window').height;

        // Do not intercept gestures in the bottom tab bar area (last 75px)
        if (pageY > screenHeight - 75) {
          return false;
        }

        // Only claim responder when horizontal drag is deliberate and dominates vertical motion
        return Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 2.2;
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, vx } = gestureState;
        const idx = currentTabRef.current;
        if (idx === -1) return;

        // Swipe Left -> next tab
        const isSwipeLeft = dx < -50 || (dx < -25 && vx < -0.35);
        // Swipe Right -> previous tab
        const isSwipeRight = dx > 50 || (dx > 25 && vx > 0.35);

        if (isSwipeLeft && idx < TAB_ROUTES.length - 1) {
          router.navigate(TAB_ROUTES[idx + 1]);
        } else if (isSwipeRight && idx > 0) {
          router.navigate(TAB_ROUTES[idx - 1]);
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Transactions',
            tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="budgets"
          options={{
            title: 'Budgets',
            tabBarIcon: ({ color, size }) => <PiggyBank size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
