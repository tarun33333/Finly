import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '../../src/store/themeStore';
import { useAuthStore } from '../../src/store/authStore';
import { apiClient } from '../../src/services/api/client';
import { Header } from '../../src/components/common/Header';
import { BalanceCard } from '../../src/components/cards/BalanceCard';
import { InsightCard } from '../../src/components/cards/InsightCard';
import { TransactionItem } from '../../src/components/transactions/TransactionItem';
import { WeeklyTrendChart } from '../../src/components/charts/WeeklyTrendChart';
import { CategoryPieChart } from '../../src/components/charts/CategoryPieChart';
import { EmptyState } from '../../src/components/common/EmptyState';
import { FinancialSummary, Transaction, Insight, Budget } from '../../src/types';
import { getMonthName } from '../../src/utils/date';
import { formatINR } from '../../src/utils/currency';
import {
  PlusCircle,
  Camera,
  UploadCloud,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Target,
  ChevronRight,
  Zap,
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const [trendDays, setTrendDays] = useState<7 | 30>(7);

  // Queries
  const {
    data: summary,
    isLoading: loadingSummary,
    refetch: refetchSummary,
    isRefetching: refetchingSummary,
  } = useQuery<FinancialSummary>({
    queryKey: ['financial-summary'],
    queryFn: () => apiClient.get('/transactions/summary'),
  });

  const {
    data: recentTxns,
    isLoading: loadingTxns,
    refetch: refetchTxns,
  } = useQuery<Transaction[]>({
    queryKey: ['recent-transactions'],
    queryFn: () => apiClient.get('/transactions?limit=6&sortBy=transactionDate&sortOrder=desc'),
  });

  const {
    data: weeklyTrend,
    refetch: refetchTrend,
  } = useQuery({
    queryKey: ['spending-trend', trendDays],
    queryFn: () => apiClient.get(`/analytics/spending-trend?days=${trendDays}`),
  });

  const {
    data: categoryBreakdown,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['category-breakdown'],
    queryFn: () => apiClient.get('/analytics/category-breakdown'),
  });

  const {
    data: insights,
    refetch: refetchInsights,
  } = useQuery<Insight[]>({
    queryKey: ['active-insights'],
    queryFn: () => apiClient.get('/insights'),
  });

  const {
    data: budgets,
    refetch: refetchBudgets,
  } = useQuery<Budget[]>({
    queryKey: ['home-budgets'],
    queryFn: () => apiClient.get('/budgets'),
  });

  // Re-fetch all queries whenever the user focuses/navigates back to the Home tab
  useFocusEffect(
    useCallback(() => {
      refetchSummary();
      refetchTxns();
      refetchTrend();
      refetchCategories();
      refetchInsights();
      refetchBudgets();
    }, [refetchSummary, refetchTxns, refetchTrend, refetchCategories, refetchInsights, refetchBudgets])
  );

  const onRefresh = async () => {
    await Promise.all([
      refetchSummary(),
      refetchTxns(),
      refetchTrend(),
      refetchCategories(),
      refetchInsights(),
      refetchBudgets(),
    ]);
  };

  const topInsight = insights && insights.length > 0 ? insights[0] : null;
  const activeBudgets = budgets && budgets.length > 0 ? budgets.slice(0, 3) : [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refetchingSummary}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Innovative Balance Card with Privacy Eye & Savings Health Rate */}
        {loadingSummary ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : (
          <BalanceCard
            balance={summary?.estimatedBalance || 0}
            income={summary?.periodIncome || 0}
            expense={summary?.periodExpense || 0}
            monthName={getMonthName()}
          />
        )}

        {/* Vibrant Quick Actions Grid */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.primaryActionPill,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => router.push({ pathname: '/upload/receipt', params: { mode: 'upi' } })}
            activeOpacity={0.8}
          >
            <View style={styles.primaryActionIconCircle}>
              <UploadCloud size={18} color="#FFF" />
            </View>
            <Text style={[styles.actionLabel, { color: '#FFF', fontWeight: '700' }]}>Scan UPI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
            onPress={() => router.push({ pathname: '/upload/receipt', params: { mode: 'receipt' } })}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: `${theme.colors.accent}18` }]}>
              <Camera size={18} color={theme.colors.accent} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>Scan Bill</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
            onPress={() => router.push({ pathname: '/transactions/add', params: { type: 'expense' } })}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: `${theme.colors.expense}18` }]}>
              <TrendingDown size={18} color={theme.colors.expense} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>+ Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
            onPress={() => router.push({ pathname: '/transactions/add', params: { type: 'income' } })}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: `${theme.colors.income}18` }]}>
              <PlusCircle size={18} color={theme.colors.income} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>+ Income</Text>
          </TouchableOpacity>
        </View>

        {/* AI Financial Advisor Pulse Banner */}
        {topInsight ? (
          <InsightCard
            title={topInsight.title}
            explanation={topInsight.explanation}
            estimatedSaving={topInsight.estimatedSaving}
            onPressAction={() => router.push('/insights')}
          />
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/upload/receipt', params: { mode: 'upi' } })}
            style={[
              styles.aiPulseBanner,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={[styles.aiPulseIcon, { backgroundColor: 'rgba(99, 91, 255, 0.12)' }]}>
              <Sparkles size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.aiPulseContent}>
              <View style={styles.aiPulseBadgeRow}>
                <Text style={[styles.aiPulseTag, { color: theme.colors.primary }]}>FINLY AI ADVISOR</Text>
                <View style={styles.pulseDot} />
              </View>
              <Text style={[styles.aiPulseTitle, { color: theme.colors.textPrimary }]}>
                Scan your daily UPI screenshots
              </Text>
              <Text style={[styles.aiPulseSub, { color: theme.colors.textSecondary }]}>
                Finly auto-extracts merchants, detects savings habits & tracks budget limits.
              </Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* Spending Velocity Trend Chart with 7D / 30D Switcher */}
        {weeklyTrend && weeklyTrend.length > 0 && (
          <WeeklyTrendChart
            data={weeklyTrend}
            days={trendDays}
            onDaysChange={(d) => setTrendDays(d as 7 | 30)}
          />
        )}

        {/* Top Active Budgets Quick Glance */}
        {activeBudgets.length > 0 && (
          <View
            style={[
              styles.budgetsSection,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.lg,
              },
            ]}
          >
            <View style={styles.budgetsHeader}>
              <View style={styles.budgetsTitleRow}>
                <Target size={16} color={theme.colors.primary} />
                <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginLeft: 6 }]}>
                  Monthly Budgets
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/budgets')}
                style={styles.seeAllBtn}
              >
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Manage</Text>
                <ArrowRight size={14} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {activeBudgets.map((b) => {
              const spent = b.progress?.spent || 0;
              const limit = b.limitAmount || 1;
              const pct = Math.min(100, Math.round((spent / limit) * 100));
              const isOver = pct >= 100;
              const barColor = isOver
                ? theme.colors.expense
                : pct >= 80
                ? theme.colors.warning
                : theme.colors.primary;

              return (
                <TouchableOpacity
                  key={b._id}
                  style={styles.budgetRowItem}
                  onPress={() => router.push(`/budgets/${b._id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.budgetRowMeta}>
                    <Text style={[styles.budgetName, { color: theme.colors.textPrimary }]}>
                      {b.name}
                    </Text>
                    <Text style={[styles.budgetAmountText, { color: theme.colors.textSecondary }]}>
                      {formatINR(spent, false)} <Text style={{ color: theme.colors.textMuted }}>/ {formatINR(limit, false)}</Text>
                    </Text>
                  </View>
                  <View style={[styles.budgetTrackBg, { backgroundColor: theme.colors.borderSubtle }]}>
                    <View
                      style={[
                        styles.budgetTrackFill,
                        { width: `${pct}%`, backgroundColor: barColor },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Category Breakdown */}
        {categoryBreakdown && categoryBreakdown.length > 0 && (
          <CategoryPieChart categories={categoryBreakdown} />
        )}

        {/* Recent Transactions Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWithBadge}>
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
              Recent Activity
            </Text>
            {recentTxns && recentTxns.length > 0 && (
              <View style={[styles.countBadge, { backgroundColor: `${theme.colors.primary}18` }]}>
                <Text style={[styles.countBadgeText, { color: theme.colors.primary }]}>
                  {recentTxns.length}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => router.push('/(tabs)/transactions')}
          >
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>View All</Text>
            <ArrowRight size={14} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {loadingTxns ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
        ) : recentTxns && recentTxns.length > 0 ? (
          recentTxns.map((txn) => (
            <TransactionItem
              key={txn._id}
              transaction={txn}
              onPress={() => router.push(`/transactions/${txn._id}`)}
            />
          ))
        ) : (
          <EmptyState
            title="No transactions yet"
            description="Add your first expense or upload a UPI screenshot to see it here."
            buttonTitle="Add Transaction"
            onButtonPress={() => router.push('/transactions/add')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingBottom: 36,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  primaryActionPill: {
    borderWidth: 0,
    shadowColor: '#635BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  aiPulseBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiPulseIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiPulseContent: {
    flex: 1,
  },
  aiPulseBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  aiPulseTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  aiPulseTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  aiPulseSub: {
    fontSize: 11,
    lineHeight: 16,
  },
  budgetsSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
  },
  budgetsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  budgetsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetRowItem: {
    marginBottom: 12,
  },
  budgetRowMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  budgetName: {
    fontSize: 13,
    fontWeight: '600',
  },
  budgetAmountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  budgetTrackBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  budgetTrackFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
