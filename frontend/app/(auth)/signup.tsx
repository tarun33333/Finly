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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { Button } from '../../src/components/buttons/Button';
import { GoogleButton } from '../../src/components/buttons/GoogleButton';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowLeft, Check, ShieldCheck } from 'lucide-react-native';

export default function SignupScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { register } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currency] = useState('INR');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

  const handleRegister = async () => {
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Please fulfill all password security requirements.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await register(name.trim(), email.trim(), password, currency);
      router.replace('/(auth)/onboarding');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={[styles.logoWrapper, { shadowColor: theme.colors.primary }]}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Create account ✨</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Start tracking your income, UPI payments, and budgets with Finly.
            </Text>
          </View>

          {/* Google Sign In Button */}
          <GoogleButton
            onSuccess={() => router.replace('/(tabs)')}
            style={styles.googleBtn}
          />

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>or register with email</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          {errorMessage ? (
            <View style={[styles.errorBox, { backgroundColor: `${theme.colors.expense}15` }]}>
              <Text style={[styles.errorText, { color: theme.colors.expense }]}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <View style={styles.form}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Full Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <UserIcon size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    setErrorMessage('');
                  }}
                  placeholder="e.g. Tarun Kumar"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="words"
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                />
              </View>
            </View>

            {/* Email */}
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

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Password</Text>
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
                  placeholder="Create a strong password"
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

            {/* Password Requirements Checklist */}
            <View style={[styles.rulesCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.rulesTitle, { color: theme.colors.textSecondary }]}>
                Password Requirements
              </Text>
              <View style={styles.ruleItem}>
                <Check size={14} color={hasMinLength ? '#10B981' : theme.colors.textMuted} />
                <Text style={[styles.ruleText, { color: hasMinLength ? '#10B981' : theme.colors.textMuted }]}>
                  At least 8 characters
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Check size={14} color={hasUpperCase && hasLowerCase ? '#10B981' : theme.colors.textMuted} />
                <Text
                  style={[
                    styles.ruleText,
                    { color: hasUpperCase && hasLowerCase ? '#10B981' : theme.colors.textMuted },
                  ]}
                >
                  Uppercase and lowercase letters
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Check size={14} color={hasNumber ? '#10B981' : theme.colors.textMuted} />
                <Text style={[styles.ruleText, { color: hasNumber ? '#10B981' : theme.colors.textMuted }]}>
                  At least 1 number
                </Text>
              </View>
            </View>

            {/* Currency Note */}
            <View style={styles.currencyNoteRow}>
              <ShieldCheck size={14} color={theme.colors.primary} />
              <Text style={[styles.currencyNote, { color: theme.colors.textSecondary }]}>
                Primary currency set to <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>₹ INR</Text> (Indian Rupee)
              </Text>
            </View>

            {/* Submit */}
            <Button
              title="Create Account"
              size="lg"
              variant="primary"
              loading={loading}
              onPress={handleRegister}
              style={{ marginTop: 4 }}
            />
          </View>

          {/* Footer Login Link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.loginLink, { color: theme.colors.primary }]}>Sign In</Text>
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
    marginBottom: 20,
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
  label: {
    fontSize: 13,
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
  rulesCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  rulesTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  currencyNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  currencyNote: {
    fontSize: 12,
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
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
