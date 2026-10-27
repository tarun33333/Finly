import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { formatINR } from '../../utils/currency';
import { ArrowDownLeft, ArrowUpRight, ShieldAlert } from 'lucide-react-native';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
  monthName?: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  income,
  expense,
  monthName,
}) => {
  const { theme } = useThemeStore();

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
        <View>
          <Text style={[styles.subtitleText, { color: 'rgba(255, 255, 255, 0.8)' }]}>
            Total Tracked Balance
          </Text>
          <Text style={[styles.balanceAmount, { color: theme.colors.white }]}>
            {formatINR(balance)}
          </Text>
        </View>

        {monthName && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{monthName}</Text>
          </View>
        )}
      </View>

      {/* Balance disclaimer (Section 8: Finly must not claim access to real bank balances) */}
      <View style={styles.disclaimerRow}>
        <ShieldAlert size={12} color="rgba(255, 255, 255, 0.7)" />
        <Text style={styles.disclaimerText}>
          Estimated tracked balance based on recorded transactions
        </Text>
      </View>

      {/* Income & Expense Breakdown */}
      <View style={styles.metricsContainer}>
        {/* Income Card */}
        <View style={styles.metricItem}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(32, 201, 151, 0.25)' }]}>
            <ArrowDownLeft size={16} color="#20C997" />
          </View>
          <View>
            <Text style={styles.metricLabel}>Income</Text>
            <Text style={styles.metricValue}>+{formatINR(income)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Expense Card */}
        <View style={styles.metricItem}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(249, 115, 115, 0.25)' }]}>
            <ArrowUpRight size={16} color="#F97373" />
          </View>
          <View>
            <Text style={styles.metricLabel}>Expenses</Text>
            <Text style={styles.metricValue}>-{formatINR(expense)}</Text>
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
  subtitleText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  disclaimerText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  metricsContainer: {
    flexDirection: 'row',
    marginTop: 20,
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
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

