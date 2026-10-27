import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../src/store/themeStore';
import { Button } from '../../src/components/buttons/Button';
import { GoogleButton } from '../../src/components/buttons/GoogleButton';
import { Sparkles, Receipt, Target, ArrowRight, ShieldCheck } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Brand Logo & Header */}
        <View style={styles.header}>
          <View style={[styles.logoWrapper, { shadowColor: theme.colors.primary }]}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.brandName, { color: theme.colors.textPrimary }]}>Finly</Text>
          <View style={styles.taglineBadge}>
            <Sparkles size={14} color={theme.colors.primary} />
            <Text style={[styles.tagline, { color: theme.colors.primary }]}>
              Every Rupee Counts.
            </Text>
          </View>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            AI-powered personal finance tracker designed for India. Instant UPI screenshot extraction,
            automated budgeting, and grounded savings insights.
          </Text>
        </View>

        {/* Feature Highlights Grid */}
        <View style={styles.features}>
          <View style={[styles.featureCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: `${theme.colors.primary}18` }]}>
              <Receipt size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: theme.colors.textPrimary }]}>
                UPI & Receipt AI Scanner
              </Text>
              <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                Share GPay, PhonePe, or Paytm screenshots to extract amounts, dates, and merchants in seconds.
              </Text>
            </View>
          </View>

          <View style={[styles.featureCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(245, 158, 11, 0.18)' }]}>
              <Sparkles size={22} color={theme.colors.accent} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: theme.colors.textPrimary }]}>
                Grounded AI Insights
              </Text>
              <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                Clear, math-backed suggestions to curb runaway expenses and grow your emergency fund.
              </Text>
            </View>
          </View>

          <View style={[styles.featureCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(22, 163, 74, 0.18)' }]}>
              <Target size={22} color="#16A34A" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: theme.colors.textPrimary }]}>
                Smart Budget Thresholds
              </Text>
              <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                Visual progress bars and gentle alerts at 50%, 75%, and 90% before you overspend.
              </Text>
            </View>
          </View>
        </View>

        {/* Auth Action Hub */}
        <View style={styles.actions}>
          {/* Prominent Google Sign In */}
          <GoogleButton
            onSuccess={() => router.replace('/(tabs)')}
            style={styles.googleBtn}
          />

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>or with email</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          <Button
            title="Create an Account"
            size="lg"
            variant="primary"
            onPress={() => router.push('/(auth)/signup')}
            style={styles.btn}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={[styles.signInLink, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.signInLinkText, { color: theme.colors.textPrimary }]}>
              Already have an account? <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Sign In</Text>
            </Text>
            <ArrowRight size={15} color={theme.colors.primary} />
          </TouchableOpacity>

          <View style={styles.securityRow}>
            <ShieldCheck size={14} color={theme.colors.textMuted} />
            <Text style={[styles.legalText, { color: theme.colors.textMuted }]}>
              256-bit encrypted • Bank-grade local biometric security
            </Text>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  logoImage: {
    width: 86,
    height: 86,
    borderRadius: 22,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  features: {
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    gap: 10,
  },
  googleBtn: {
    marginBottom: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  btn: {
    width: '100%',
  },
  signInLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  signInLinkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
  },
  legalText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
