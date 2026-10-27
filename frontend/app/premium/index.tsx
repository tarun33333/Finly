import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../src/store/themeStore';
import { Button } from '../../src/components/buttons/Button';
import { Sparkles, Check, X, Shield, Zap, TrendingUp } from 'lucide-react-native';

export default function PremiumScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();

  const benefits = [
    'Unlimited UPI payment screenshot extractions',
    'Deep Gemini 2.5 Flash financial pattern analysis',
    'Custom threshold alerts for all spending categories',
    'Automated recurring payment & subscription auditor',
    'Tax reports & monthly Excel / CSV exports',
    'Priority cloud backup & encryption',
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Finly Plus</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.badgeCircle, { backgroundColor: theme.colors.badgeBackground }]}>
          <Sparkles size={36} color={theme.colors.primary} />
        </View>

        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Supercharge your savings
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Unlock advanced AI financial capabilities built for Indian smart spenders.
        </Text>

        {/* Price Card */}
        <View
          style={[
            styles.priceCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
          ]}
        >
          <Text style={[styles.planName, { color: theme.colors.primary }]}>ANNUAL PLAN</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.currency, { color: theme.colors.textPrimary }]}>₹</Text>
            <Text style={[styles.amount, { color: theme.colors.textPrimary }]}>99</Text>
            <Text style={[styles.period, { color: theme.colors.textSecondary }]}>/ month</Text>
          </View>
          <Text style={[styles.billedText, { color: theme.colors.textMuted }]}>
            Billed annually at ₹1,188 • 30-day money-back guarantee
          </Text>
        </View>

        {/* Benefit list */}
        <View style={styles.benefitList}>
          {benefits.map((b, i) => (
            <View key={i} style={styles.benefitItem}>
              <View style={[styles.checkCircle, { backgroundColor: 'rgba(22, 163, 74, 0.15)' }]}>
                <Check size={14} color="#16A34A" />
              </View>
              <Text style={[styles.benefitText, { color: theme.colors.textPrimary }]}>{b}</Text>
            </View>
          ))}
        </View>

        <Button
          title="Upgrade to Finly Plus"
          size="lg"
          onPress={() => router.back()}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  badgeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  priceCard: {
    width: '100%',
    padding: 20,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 24,
  },
  planName: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 22,
    fontWeight: '700',
    marginRight: 2,
  },
  amount: {
    fontSize: 44,
    fontWeight: '800',
  },
  period: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  billedText: {
    fontSize: 12,
    marginTop: 6,
  },
  benefitList: {
    width: '100%',
    gap: 14,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

