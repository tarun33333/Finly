import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/services/api/client';
import { CategoryPieChart } from '../../src/components/charts/CategoryPieChart';
import { formatINR } from '../../src/utils/currency';
import { getMonthName } from '../../src/utils/date';
import { TrendingUp, TrendingDown, PiggyBank, Calendar } from 'lucide-react-native';

export default function AnalyticsScreen() {
  const { theme } = useThemeStore();

  const {
    data: overview,
    isLoading: loadingOverview,
    refetch: refetchOverview,
    isRefetching,
  } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => apiClient.get('/analytics/overview'),
  });

  const { data: categoryBreakdown, refetch: refetchCategories } = useQuery({
    queryKey: ['analytics-categories'],
    queryFn: () => apiClient.get('/analytics/category-breakdown'),
  });

  const { data: paymentMethods, refetch: refetchPayments } = useQuery({
    queryKey: ['analytics-payments'],
    queryFn: () => apiClient.get('/analytics/payment-methods'),
  });

  const { data: monthComp, refetch: refetchComp } = useQuery({
    queryKey: ['analytics-month-comp'],
    queryFn: () => apiClient.get('/analytics/month-comparison'),
  });

  const { data: topMerchants, refetch: refetchMerchants } = useQuery({
    queryKey: ['analytics-merchants'],
    queryFn: () => apiClient.get('/analytics/top-merchants'),
  });

  const onRefresh = async () => {
    await Promise.all([
      refetchOverview(),
      refetchCategories(),
      refetchPayments(),
      refetchComp(),
      refetchMerchants(),
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>Analytics</Text>
        <View style={[styles.monthBadge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Calendar size={14} color={theme.colors.primary} />
          <Text style={[styles.monthBadgeText, { color: theme.colors.textPrimary }]}>
            {getMonthName()}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* KPI 4-Box Grid */}
        {loadingOverview ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.kpiGrid}>
            <View
              style={[
                styles.kpiCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <View style={[styles.kpiIconCircle, { backgroundColor: 'rgba(22, 163, 74, 0.15)' }]}>
                <TrendingDown size={16} color="#16A34A" />
              </View>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>Total Income</Text>
              <Text style={[styles.kpiValue, { color: theme.colors.textPrimary }]}>
                {formatINR(overview?.income || 0, false)}
              </Text>
            </View>

            <View
              style={[
                styles.kpiCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <View style={[styles.kpiIconCircle, { backgroundColor: 'rgba(249, 115, 115, 0.15)' }]}>
                <TrendingUp size={16} color="#F97373" />
              </View>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>Total Expenses</Text>
              <Text style={[styles.kpiValue, { color: theme.colors.textPrimary }]}>
                {formatINR(overview?.expense || 0, false)}
              </Text>
            </View>

            <View
              style={[
                styles.kpiCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <View style={[styles.kpiIconCircle, { backgroundColor: 'rgba(99, 91, 255, 0.15)' }]}>
                <PiggyBank size={16} color={theme.colors.primary} />
              </View>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>Savings Rate</Text>
              <Text style={[styles.kpiValue, { color: theme.colors.primary }]}>
                {overview?.savingsRate || 0}%
              </Text>
            </View>

            <View
              style={[
                styles.kpiCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <View style={[styles.kpiIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Calendar size={16} color={theme.colors.accent} />
              </View>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>Daily Average</Text>
              <Text style={[styles.kpiValue, { color: theme.colors.textPrimary }]}>
                {formatINR(overview?.dailyAverage || 0, false)}/day
              </Text>
            </View>
          </View>
        )}

        {/* Month-over-Month Comparison */}
        {monthComp && (
          <View
            style={[
              styles.cardBox,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: 12 }]}>
              Month-over-Month Comparison
            </Text>

            <View style={styles.compRow}>
              <View style={styles.compCol}>
                <Text style={[styles.compLabel, { color: theme.colors.textSecondary }]}>Current Month</Text>
                <Text style={[styles.compVal, { color: theme.colors.textPrimary }]}>
                  {formatINR(monthComp.currentMonth?.expense || 0, false)}
                </Text>
              </View>

              <View style={styles.compCol}>
                <Text style={[styles.compLabel, { color: theme.colors.textSecondary }]}>Previous Month</Text>
                <Text style={[styles.compVal, { color: theme.colors.textPrimary }]}>
                  {formatINR(monthComp.previousMonth?.expense || 0, false)}
                </Text>
              </View>

              <View style={styles.compCol}>
                <Text style={[styles.compLabel, { color: theme.colors.textSecondary }]}>Difference</Text>
                <Text
                  style={[
                    styles.compVal,
                    {
                      color:
                        monthComp.changes?.expenseDifference > 0
                          ? theme.colors.expense
                          : theme.colors.income,
                    },
                  ]}
                >
                  {monthComp.changes?.expenseDifference > 0 ? '+' : ''}
                  {formatINR(monthComp.changes?.expenseDifference || 0, false)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Category Expense Breakdown */}
        {categoryBreakdown && categoryBreakdown.length > 0 && (
          <CategoryPieChart categories={categoryBreakdown} />
        )}

        {/* Payment Methods Breakdown */}
        {paymentMethods && paymentMethods.length > 0 && (
          <View
            style={[
              styles.cardBox,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: 14 }]}>
              Payment Methods
            </Text>

            {paymentMethods.map((pm: any) => (
              <View key={pm.paymentMethod} style={styles.paymentMethodRow}>
                <View style={styles.pmLeft}>
                  <Text style={[styles.pmName, { color: theme.colors.textPrimary }]}>
                    {pm.paymentMethod}
                  </Text>
                  <Text style={[styles.pmCount, { color: theme.colors.textSecondary }]}>
                    {pm.count} transactions
                  </Text>
                </View>
                <View style={styles.pmRight}>
                  <Text style={[styles.pmAmount, { color: theme.colors.textPrimary }]}>
                    {formatINR(pm.amount, false)}
                  </Text>
                  <Text style={[styles.pmPercent, { color: theme.colors.textSecondary }]}>
                    {pm.percentage}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Top Merchants */}
        {topMerchants && topMerchants.length > 0 && (
          <View
            style={[
              styles.cardBox,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: 14 }]}>
              Top Spending Merchants
            </Text>

            {topMerchants.map((m: any, i: number) => (
              <View key={m.merchant || i} style={styles.merchantRow}>
                <Text style={[styles.rankNumber, { color: theme.colors.primary }]}>#{i + 1}</Text>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <Text style={[styles.merchantName, { color: theme.colors.textPrimary }]}>
                    {m.merchant}
                  </Text>
                  <Text style={[styles.merchantCount, { color: theme.colors.textSecondary }]}>
                    {m.transactionCount} payments
                  </Text>
                </View>
                <Text style={[styles.merchantTotal, { color: theme.colors.textPrimary }]}>
                  {formatINR(m.amount, false)}
                </Text>
              </View>
            ))}
          </View>
        )}
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
    paddingTop: 12,
    paddingBottom: 12,
  },
  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  monthBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  container: {
    paddingBottom: 40,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  kpiCard: {
    width: '48%',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  kpiIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardBox: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  compRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compCol: {
    alignItems: 'center',
  },
  compLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  compVal: {
    fontSize: 15,
    fontWeight: '700',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pmLeft: {
    gap: 2,
  },
  pmName: {
    fontSize: 14,
    fontWeight: '600',
  },
  pmCount: {
    fontSize: 12,
  },
  pmRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  pmAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  pmPercent: {
    fontSize: 12,
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '800',
    width: 24,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '600',
  },
  merchantCount: {
    fontSize: 12,
  },
  merchantTotal: {
    fontSize: 14,
    fontWeight: '700',
  },
});

