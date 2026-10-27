import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  Alert,
  Linking,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/api/client';
import { useRouter } from 'expo-router';

interface GoogleButtonProps {
  onSuccess?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  onSuccess,
  style,
  disabled = false,
}) => {
  const { theme } = useThemeStore();
  const { googleAuth } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Instant one-tap development login
  const handleQuickDevLogin = async () => {
    setLoading(true);
    try {
      const simulatedPayload = {
        sub: 'google_user_' + Date.now(),
        email: 'tarun.google@finly.app',
        name: 'Tarun Kumar',
        picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        email_verified: true,
      };

      const devToken = `dev_header.${btoa(JSON.stringify(simulatedPayload))}.dev_sig`;
      await googleAuth(devToken);

      if (onSuccess) {
        onSuccess();
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Google Sign-In Error', err.message || 'Could not complete Google sign-in.');
    } finally {
      setLoading(false);
    }
  };

  // Real Google OAuth browser flow
  const handleBrowserOAuth = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ url: string }>('/auth/google/url');
      if (res?.url) {
        const canOpen = await Linking.canOpenURL(res.url);
        if (canOpen) {
          await Linking.openURL(res.url);
          return;
        }
      }
      // If cannot open browser URL, fallback
      await handleQuickDevLogin();
    } catch (err: any) {
      // If OAuth URL generation failed, offer quick dev login
      Alert.alert(
        'Google OAuth Notice',
        err.message || 'Could not launch Google OAuth browser. Would you like to use quick dev sign-in instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Quick Dev Sign-In', onPress: handleQuickDevLogin },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    Alert.alert(
      'Continue with Google',
      'Choose how you want to sign in with Google:',
      [
        {
          text: '🌐 Real Google Account (Browser)',
          onPress: handleBrowserOAuth,
        },
        {
          text: '⚡ Quick Instant Sign-In',
          onPress: handleQuickDevLogin,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          ...theme.shadows.sm,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.primary} />
      ) : (
        <>
          {/* Official Google 'G' 4-color SVG Icon */}
          <Svg width={20} height={20} viewBox="0 0 24 24" style={styles.googleIcon}>
            <Path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <Path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <Path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <Path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </Svg>
          <Text style={[styles.buttonText, { color: theme.colors.textPrimary }]}>
            Continue with Google
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  googleIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
