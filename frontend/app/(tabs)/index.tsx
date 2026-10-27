import React from 'react';
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
import { useRouter } from 'expo-router';
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
import { FinancialSummary, Transaction, Insight } from '../../src/types';
import { getMonthName } from '../../src/utils/date';
import {
  PlusCircle,
  Camera,
  UploadCloud,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();

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
    queryFn: () => apiClient.get('/transactions?limit=5'),
  });

  const {
    data: weeklyTrend,
    refetch: refetchTrend,
  } = useQuery({
    queryKey: ['spending-trend-7'],
    queryFn: () => apiClient.get('/analytics/spending-trend?days=7'),
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

  const onRefresh = async () => {
    await Promise.all([
      refetchSummary(),
      refetchTxns(),
      refetchTrend(),
      refetchCategories(),
      refetchInsights(),
    ]);
  };

  const topInsight = insights && insights.length > 0 ? insights[0] : null;

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
        {/* Balance Card */}
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

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
            onPress={() => router.push({ pathname: '/transactions/add', params: { type: 'expense' } })}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: `${theme.colors.expense}15` }]}>
              <TrendingDown size={18} color={theme.colors.expense} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
            onPress={() => router.push({ pathname: '/transactions/add', params: { type: 'income' } })}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: `${theme.colors.income}15` }]}>
              <PlusCircle size={18} color={theme.colors.income} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>Add Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
            onPress={() => router.push({ pathname: '/upload/receipt', params: { mode: 'upi' } })}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: `${theme.colors.primary}15` }]}>
              <UploadCloud size={18} color={theme.colors.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>Scan UPI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
            onPress={() => router.push({ pathname: '/upload/receipt', params: { mode: 'receipt' } })}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: `${theme.colors.accent}15` }]}>
              <Camera size={18} color={theme.colors.accent} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>Scan Bill</Text>
          </TouchableOpacity>
        </View>

        {/* AI Insight Card */}
        {topInsight ? (
          <InsightCard
            title={topInsight.title}
            explanation={topInsight.explanation}
            estimatedSaving={topInsight.estimatedSaving}
            onPressAction={() => router.push('/insights')}
          />
        ) : (
          <InsightCard
            title="Start Tracking to Unlock AI Insights"
            explanation="Record your daily expenses or scan a payment screenshot to receive personalized rupee-saving recommendations."
            estimatedSaving={1500}
            onPressAction={() => router.push({ pathname: '/upload/receipt', params: { mode: 'upi' } })}
          />
        )}

        {/* 7-Day Trend Chart */}
        {weeklyTrend && weeklyTrend.length > 0 && (
          <WeeklyTrendChart data={weeklyTrend} />
        )}

        {/* Category Breakdown */}
        {categoryBreakdown && categoryBreakdown.length > 0 && (
          <CategoryPieChart categories={categoryBreakdown} />
        )}

        {/* Recent Transactions Section */}
        <View style={styles.sectionHeader}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
            Recent Transactions
          </Text>
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
    paddingBottom: 32,
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
  actionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
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

