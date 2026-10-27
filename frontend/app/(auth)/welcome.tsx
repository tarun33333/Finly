import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../src/store/themeStore';
import { Button } from '../../src/components/buttons/Button';
import { Wallet, Sparkles, Receipt, TrendingUp } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Brand Logo & Header */}
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary }]}>
            <Wallet size={36} color={theme.colors.white} />
          </View>
          <Text style={[styles.brandName, { color: theme.colors.textPrimary }]}>Finly</Text>
          <Text style={[styles.tagline, { color: theme.colors.primary }]}>Every Rupee Counts.</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            AI-powered personal finance tracker designed for India. Instant UPI screenshot extraction,
            automated budgeting, and grounded savings insights.
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.features}>
          <View style={[styles.featureCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: `${theme.colors.secondary}20` }]}>
              <Receipt size={22} color={theme.colors.secondary} />
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
            <View style={[styles.featureIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Sparkles size={22} color={theme.colors.primary} />
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
            <View style={[styles.featureIcon, { backgroundColor: `${theme.colors.accent}20` }]}>
              <TrendingUp size={22} color={theme.colors.accent} />
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

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Get Started"
            size="lg"
            variant="primary"
            onPress={() => router.push('/(auth)/signup')}
            style={styles.btn}
          />

          <Button
            title="Sign In"
            size="lg"
            variant="outline"
            onPress={() => router.push('/(auth)/login')}
            style={styles.btn}
          />

          <Text style={[styles.legalText, { color: theme.colors.textMuted }]}>
            By continuing, you agree to Finly's Terms of Service and Privacy Policy. All financial data is encrypted and privately isolated.
          </Text>
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
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#635BFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 12,
  },
  features: {
    gap: 12,
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  actions: {
    gap: 12,
  },
  btn: {
    width: '100%',
  },
  legalText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
    paddingHorizontal: 16,
  },
});

