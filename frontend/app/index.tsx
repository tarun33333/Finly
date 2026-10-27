import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { useThemeStore } from '../src/store/themeStore';
import { Sparkles, Shield } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, isBiometricLocked } = useAuthStore();
  const { theme } = useThemeStore();

  // Animation drivers
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.8)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Entrance choreography
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0.35,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(glowScale, {
        toValue: 1.25,
        duration: 1200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        delay: 350,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 600,
        delay: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Subtle continuous breathing pulse for the logo
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const timer = setTimeout(() => {
      pulseLoop.start();
    }, 900);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
    };
  }, []);

  // 3. Navigation routing after minimum display time
  useEffect(() => {
    if (isLoading) return;

    const navTimer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/(auth)/welcome');
      } else if (isBiometricLocked) {
        router.replace('/(auth)/login');
      } else if (user && !user.onboardingCompleted) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    }, 1400);

    return () => clearTimeout(navTimer);
  }, [isAuthenticated, isLoading, isBiometricLocked, user]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Background Ambient Glow */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            backgroundColor: theme.colors.primary,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      {/* Centered Logo & Branding */}
      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: Animated.multiply(logoScale, pulseAnim) }],
            },
          ]}
        >
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={[styles.appName, { color: theme.colors.textPrimary }]}>Finly</Text>
          <View style={styles.taglineRow}>
            <Sparkles size={14} color={theme.colors.primary} />
            <Text style={[styles.tagline, { color: theme.colors.primary }]}>
              Every Rupee Counts.
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Footer Assurance Badge */}
      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        <View style={[styles.securityBadge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Shield size={13} color={theme.colors.textSecondary} />
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            AI-Powered Personal Finance • India
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    filter: 'blur(45px)',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#635BFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  logoImage: {
    width: 105,
    height: 105,
    borderRadius: 26,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
