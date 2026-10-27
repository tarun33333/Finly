import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { formatINR } from '../../utils/currency';
import { ArrowDownLeft, ArrowUpRight, ShieldAlert, Eye, EyeOff, Sparkles } from 'lucide-react-native';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
  monthName?: string;
  savingsRate?: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  income,
  expense,
  monthName,
  savingsRate,
}) => {
  const { theme } = useThemeStore();
  const [hideBalance, setHideBalance] = useState(false);

  // Compute savings rate if not explicitly passed
  const calculatedSavingsRate =
    savingsRate !== undefined
      ? savingsRate
      : income > 0
      ? Math.max(0, Math.round(((income - expense) / income) * 100))
      : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.borderRadius.xl,
          ...theme.shadows.lg,
        },
      ]}
    >
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={[styles.subtitleText, { color: 'rgba(255, 255, 255, 0.85)' }]}>
              Estimated Available Balance
            </Text>
            <TouchableOpacity
              onPress={() => setHideBalance(!hideBalance)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.eyeBtn}
            >
              {hideBalance ? (
                <EyeOff size={16} color="rgba(255, 255, 255, 0.8)" />
              ) : (
                <Eye size={16} color="rgba(255, 255, 255, 0.8)" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={[styles.balanceAmount, { color: theme.colors.white }]}>
            {hideBalance ? '••••••••' : formatINR(balance)}
          </Text>
        </View>

        {monthName && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{monthName}</Text>
          </View>
        )}
      </View>

      {/* Savings Health Rate Meter */}
      <View style={styles.savingsMeterContainer}>
        <View style={styles.savingsMeterHeader}>
          <View style={styles.savingsMeterLabelRow}>
            <Sparkles size={12} color="#FBBF24" />
            <Text style={styles.savingsMeterText}>
              Savings Rate: <Text style={{ fontWeight: '700' }}>{calculatedSavingsRate}%</Text>
            </Text>
          </View>
          <Text style={styles.savingsStatusText}>
            {calculatedSavingsRate >= 30
              ? 'Excellent'
              : calculatedSavingsRate >= 15
              ? 'Healthy'
              : calculatedSavingsRate > 0
              ? 'Fair'
              : 'Attention Needed'}
          </Text>
        </View>
        <View style={styles.savingsProgressBarBg}>
          <View
            style={[
              styles.savingsProgressBarFill,
              {
                width: `${Math.min(100, Math.max(5, calculatedSavingsRate))}%`,
                backgroundColor:
                  calculatedSavingsRate >= 25
                    ? '#34D399'
                    : calculatedSavingsRate >= 10
                    ? '#FBBF24'
                    : '#F87171',
              },
            ]}
          />
        </View>
      </View>

      {/* Income & Expense Breakdown */}
      <View style={styles.metricsContainer}>
        {/* Income Card */}
        <View style={styles.metricItem}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(52, 211, 153, 0.25)' }]}>
            <ArrowDownLeft size={16} color="#34D399" />
          </View>
          <View>
            <Text style={styles.metricLabel}>Income</Text>
            <Text style={styles.metricValue}>
              {hideBalance ? '••••••' : `+${formatINR(income)}`}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Expense Card */}
        <View style={styles.metricItem}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(248, 113, 113, 0.25)' }]}>
            <ArrowUpRight size={16} color="#F87171" />
          </View>
          <View>
            <Text style={styles.metricLabel}>Expenses</Text>
            <Text style={styles.metricValue}>
              {hideBalance ? '••••••' : `-${formatINR(expense)}`}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 2,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  savingsMeterContainer: {
    marginTop: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 10,
    padding: 10,
  },
  savingsMeterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  savingsMeterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savingsMeterText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
  },
  savingsStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  savingsProgressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  savingsProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

