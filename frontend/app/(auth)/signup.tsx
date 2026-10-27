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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { Button } from '../../src/components/buttons/Button';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowLeft, Check, X } from 'lucide-react-native';

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
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Create account</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Start tracking your income, UPI payments, and budgets with Finly.
            </Text>
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
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Full Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <UserIcon size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    setErrorMessage('');
                  }}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor={theme.colors.textMuted}
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <Mail size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    setErrorMessage('');
                  }}
                  placeholder="rahul@example.com"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <Lock size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
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
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={18} color={theme.colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Password checklist */}
              <View style={styles.checklist}>
                <View style={styles.checkItem}>
                  {hasMinLength ? <Check size={12} color="#16A34A" /> : <X size={12} color="#9CA3AF" />}
                  <Text style={[styles.checkText, { color: hasMinLength ? '#16A34A' : theme.colors.textMuted }]}>
                    8+ characters
                  </Text>
                </View>
                <View style={styles.checkItem}>
                  {hasUpperCase ? <Check size={12} color="#16A34A" /> : <X size={12} color="#9CA3AF" />}
                  <Text style={[styles.checkText, { color: hasUpperCase ? '#16A34A' : theme.colors.textMuted }]}>
                    1 uppercase
                  </Text>
                </View>
                <View style={styles.checkItem}>
                  {hasNumber ? <Check size={12} color="#16A34A" /> : <X size={12} color="#9CA3AF" />}
                  <Text style={[styles.checkText, { color: hasNumber ? '#16A34A' : theme.colors.textMuted }]}>
                    1 number
                  </Text>
                </View>
              </View>
            </View>

            {/* Currency Pill */}
            <View style={styles.currencyNotice}>
              <Text style={[styles.currencyText, { color: theme.colors.textSecondary }]}>
                Default Currency: <Text style={{ fontWeight: '700', color: theme.colors.primary }}>₹ INR (Indian Rupee)</Text>
              </Text>
            </View>

            <Button
              title="Create Account"
              size="lg"
              onPress={handleRegister}
              loading={loading}
              disabled={!isPasswordValid || !email || !name}
              style={{ marginTop: 8 }}
            />
          </View>

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
    paddingTop: 16,
    paddingBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  form: {
    gap: 16,
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
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  checklist: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkText: {
    fontSize: 11,
    fontWeight: '500',
  },
  currencyNotice: {
    paddingVertical: 8,
  },
  currencyText: {
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});

