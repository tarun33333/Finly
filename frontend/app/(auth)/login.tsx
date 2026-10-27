import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { Button } from '../../src/components/buttons/Button';
import { GoogleButton } from '../../src/components/buttons/GoogleButton';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Fingerprint, Sparkles } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { login, isBiometricLocked, unlockWithBiometrics } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@finly.app');
    setPassword('DemoPassword123!');
    setErrorMessage('');
  };

  const handleBiometricUnlock = async () => {
    const success = await unlockWithBiometrics();
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Authentication Failed', 'Biometric recognition could not be verified.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Top Bar */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoWrapper, { shadowColor: theme.colors.primary }]}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Welcome back 👋</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Sign in to keep tracking every rupee with Finly.
            </Text>
          </View>

          {/* Biometric Unlock Banner if app is locked */}
          {isBiometricLocked && (
            <TouchableOpacity
              onPress={handleBiometricUnlock}
              style={[
                styles.biometricCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
              ]}
            >
              <Fingerprint size={28} color={theme.colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.bioTitle, { color: theme.colors.textPrimary }]}>
                  Unlock with Biometrics
                </Text>
                <Text style={[styles.bioSub, { color: theme.colors.textSecondary }]}>
                  Touch sensor or use Face ID to quickly enter
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Google Sign In Button */}
          <GoogleButton
            onSuccess={() => router.replace('/(tabs)')}
            style={styles.googleBtn}
          />

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>or with email</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          {errorMessage ? (
            <View style={[styles.errorBox, { backgroundColor: `${theme.colors.expense}15` }]}>
              <Text style={[styles.errorText, { color: theme.colors.expense }]}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <Mail size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    setErrorMessage('');
                  }}
                  placeholder="name@example.com"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Password</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text style={[styles.forgotText, { color: theme.colors.primary }]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <Lock size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!showPassword}
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  {showPassword ? (
                    <EyeOff size={18} color={theme.colors.textMuted} />
                  ) : (
                    <Eye size={18} color={theme.colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <Button
              title="Sign In"
              size="lg"
              variant="primary"
              loading={loading}
              onPress={handleLogin}
              style={{ marginTop: 8 }}
            />

            {/* Quick Demo Fill Helper */}
            <TouchableOpacity
              onPress={handleDemoFill}
              style={[
                styles.demoBtn,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <Sparkles size={14} color={theme.colors.accent} />
              <Text style={[styles.demoText, { color: theme.colors.textSecondary }]}>
                Quick Demo Sign-In Fill
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Signup Link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={[styles.signupLink, { color: theme.colors.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  logoImage: {
    width: 68,
    height: 68,
    borderRadius: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  biometricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  bioTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  bioSub: {
    fontSize: 11,
    marginTop: 2,
  },
  googleBtn: {
    marginBottom: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  eyeBtn: {
    padding: 4,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  demoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
  },
  signupLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
