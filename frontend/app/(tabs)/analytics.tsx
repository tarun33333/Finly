import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/services/api/client';
import { CategoryPieChart } from '../../src/components/charts/CategoryPieChart';
import { WeeklyTrendChart } from '../../src/components/charts/WeeklyTrendChart';
import { formatINR } from '../../src/utils/currency';
import { getMonthName } from '../../src/utils/date';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Calendar,
  Filter,
  Check,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Store,
  CreditCard,
  X,
} from 'lucide-react-native';

type PresetRange = '7d' | '30d' | 'month' | 'custom';

export default function AnalyticsScreen() {
  const { theme } = useThemeStore();

  const [preset, setPreset] = useState<PresetRange>('month');
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Default custom dates
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const thirtyDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }, []);

  const [customFrom, setCustomFrom] = useState(thirtyDaysAgoStr);
  const [customTo, setCustomTo] = useState(todayStr);
  const [appliedCustomFrom, setAppliedCustomFrom] = useState(thirtyDaysAgoStr);
  const [appliedCustomTo, setAppliedCustomTo] = useState(todayStr);

  // Compute active query parameters
  const { startDate, endDate, trendDays, activeLabel } = useMemo(() => {
    const now = new Date();
    if (preset === '7d') {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return {
        startDate: start.toISOString(),
        endDate: now.toISOString(),
        trendDays: 7,
        activeLabel: 'Last 7 Days',
      };
    }
    if (preset === '30d') {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return {
        startDate: start.toISOString(),
        endDate: now.toISOString(),
        trendDays: 30,
        activeLabel: 'Last 30 Days',
      };
    }
    if (preset === 'custom') {
      return {
        startDate: new Date(appliedCustomFrom + 'T00:00:00.000Z').toISOString(),
        endDate: new Date(appliedCustomTo + 'T23:59:59.999Z').toISOString(),
        trendDays: 30,
        activeLabel: `${appliedCustomFrom} → ${appliedCustomTo}`,
      };
    }
    // Default: current month
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      startDate: start.toISOString(),
      endDate: now.toISOString(),
      trendDays: now.getDate(),
      activeLabel: getMonthName(),
    };
  }, [preset, appliedCustomFrom, appliedCustomTo]);

  // Analytics API queries
  const {
    data: overview,
    isLoading: loadingOverview,
    refetch: refetchOverview,
    isRefetching,
  } = useQuery({
    queryKey: ['analytics-overview', startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      return apiClient.get(`/analytics/overview?${params.toString()}`);
    },
  });

  const {
    data: trendData,
    refetch: refetchTrend,
  } = useQuery({
    queryKey: ['analytics-trend', startDate, endDate, trendDays],
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('days', String(trendDays));
      return apiClient.get(`/analytics/spending-trend?${params.toString()}`);
    },
  });

  const { data: categoryBreakdown, refetch: refetchCategories } = useQuery({
    queryKey: ['analytics-categories', startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      return apiClient.get(`/analytics/category-breakdown?${params.toString()}`);
    },
  });

  const { data: paymentMethods, refetch: refetchPayments } = useQuery({
    queryKey: ['analytics-payments', startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      return apiClient.get(`/analytics/payment-methods?${params.toString()}`);
    },
  });

  const { data: monthComp, refetch: refetchComp } = useQuery({
    queryKey: ['analytics-month-comp'],
    queryFn: () => apiClient.get('/analytics/month-comparison'),
    enabled: preset === 'month',
  });

  const { data: topMerchants, refetch: refetchMerchants } = useQuery({
    queryKey: ['analytics-merchants', startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      return apiClient.get(`/analytics/top-merchants?${params.toString()}`);
    },
  });

  // Re-fetch all queries when screen gains focus
  useFocusEffect(
    useCallback(() => {
      refetchOverview();
      refetchTrend();
      refetchCategories();
      refetchPayments();
      if (preset === 'month') refetchComp();
      refetchMerchants();
    }, [refetchOverview, refetchTrend, refetchCategories, refetchPayments, refetchComp, refetchMerchants, preset])
  );

  const onRefresh = async () => {
    await Promise.all([
      refetchOverview(),
      refetchTrend(),
      refetchCategories(),
      refetchPayments(),
      refetchComp(),
      refetchMerchants(),
    ]);
  };

  const handleApplyCustomDates = () => {
    setAppliedCustomFrom(customFrom);
    setAppliedCustomTo(customTo);
    setPreset('custom');
    setShowCustomModal(false);
  };

  const handleQuickPresetDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    setCustomFrom(d.toISOString().split('T')[0]);
    setCustomTo(new Date().toISOString().split('T')[0]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>Financial Insights</Text>
          <Text style={[styles.subTitle, { color: theme.colors.textSecondary }]}>
            Data trends & spending analysis
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCustomModal(true)}
          style={[
            styles.dateRangeBadge,
            {
              backgroundColor: theme.colors.surface,
              borderColor: preset === 'custom' ? theme.colors.primary : theme.colors.border,
            },
          ]}
        >
          <Calendar size={14} color={theme.colors.primary} />
          <Text style={[styles.dateRangeBadgeText, { color: theme.colors.textPrimary }]}>
            {activeLabel}
          </Text>
          <ChevronDown size={14} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Date Range Selector Pills */}
      <View style={styles.presetsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsContent}>
          <TouchableOpacity
            onPress={() => setPreset('month')}
            style={[
              styles.presetPill,
              preset === 'month' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
              { backgroundColor: preset === 'month' ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.presetText, { color: preset === 'month' ? '#FFF' : theme.colors.textSecondary }]}>
              This Month
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPreset('7d')}
            style={[
              styles.presetPill,
              preset === '7d' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
              { backgroundColor: preset === '7d' ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.presetText, { color: preset === '7d' ? '#FFF' : theme.colors.textSecondary }]}>
              Last 7 Days
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPreset('30d')}
            style={[
              styles.presetPill,
              preset === '30d' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
              { backgroundColor: preset === '30d' ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.presetText, { color: preset === '30d' ? '#FFF' : theme.colors.textSecondary }]}>
              Last 30 Days
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowCustomModal(true)}
            style={[
              styles.presetPill,
              preset === 'custom' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
              { backgroundColor: preset === 'custom' ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Calendar size={13} color={preset === 'custom' ? '#FFF' : theme.colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.presetText, { color: preset === 'custom' ? '#FFF' : theme.colors.textSecondary }]}>
              Custom Range
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
                <Sparkles size={16} color={theme.colors.accent} />
              </View>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>Daily Average</Text>
              <Text style={[styles.kpiValue, { color: theme.colors.textPrimary }]}>
                {formatINR(overview?.dailyAverage || 0, false)}/day
              </Text>
            </View>
          </View>
        )}

        {/* Daily Spending Velocity Chart for Selected Range */}
        {trendData && trendData.length > 0 && (
          <WeeklyTrendChart
            data={trendData}
            days={trendData.length}
          />
        )}

        {/* Category Expense Breakdown */}
        {categoryBreakdown && categoryBreakdown.length > 0 ? (
          <CategoryPieChart categories={categoryBreakdown} />
        ) : (
          <View style={[styles.cardBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.emptySectionText, { color: theme.colors.textSecondary }]}>
              No category expense data recorded for this time range.
            </Text>
          </View>
        )}

        {/* Month-over-Month Comparison (if viewing month) */}
        {preset === 'month' && monthComp && (
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

        {/* Payment Methods Breakdown */}
        {paymentMethods && paymentMethods.length > 0 && (
          <View
            style={[
              styles.cardBox,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <CreditCard size={18} color={theme.colors.primary} />
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginLeft: 8 }]}>
                Payment Methods Distribution
              </Text>
            </View>

            {paymentMethods.map((pm: any) => (
              <View key={pm.paymentMethod} style={styles.paymentMethodBlock}>
                <View style={styles.paymentMethodRow}>
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
                    <Text style={[styles.pmPercent, { color: theme.colors.primary }]}>
                      {pm.percentage}%
                    </Text>
                  </View>
                </View>
                {/* Visual Distribution Bar */}
                <View style={[styles.pmBarTrack, { backgroundColor: theme.colors.borderSubtle }]}>
                  <View
                    style={[
                      styles.pmBarFill,
                      {
                        width: `${Math.min(100, Math.max(2, pm.percentage))}%`,
                        backgroundColor:
                          pm.paymentMethod === 'UPI'
                            ? theme.colors.primary
                            : pm.paymentMethod === 'Cash'
                            ? theme.colors.accent
                            : theme.colors.secondary,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Top Merchants Leaderboard */}
        {topMerchants && topMerchants.length > 0 && (
          <View
            style={[
              styles.cardBox,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Store size={18} color={theme.colors.primary} />
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginLeft: 8 }]}>
                Top Spending Merchants
              </Text>
            </View>

            {topMerchants.map((m: any, i: number) => (
              <View key={m.merchant || i} style={styles.merchantRow}>
                <View style={[styles.rankBadge, { backgroundColor: `${theme.colors.primary}18` }]}>
                  <Text style={[styles.rankNumber, { color: theme.colors.primary }]}>#{i + 1}</Text>
                </View>
                <View style={{ flex: 1, marginHorizontal: 12 }}>
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

      {/* Date From & Date To Selection Modal */}
      <Modal
        visible={showCustomModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Calendar size={20} color={theme.colors.primary} />
                <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
                  Select Date Range
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowCustomModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Quick Helper Presets */}
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Quick Range Presets</Text>
            <View style={styles.quickPresetGrid}>
              {[
                { label: '7 Days', days: 7 },
                { label: '14 Days', days: 14 },
                { label: '30 Days', days: 30 },
                { label: '90 Days', days: 90 },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.quickPresetBtn, { borderColor: theme.colors.border }]}
                  onPress={() => handleQuickPresetDays(item.days)}
                >
                  <Text style={[styles.quickPresetBtnText, { color: theme.colors.textPrimary }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date From Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>Date From (YYYY-MM-DD)</Text>
              <TextInput
                value={customFrom}
                onChangeText={setCustomFrom}
                placeholder="2026-09-01"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.dateInput, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
              />
            </View>

            {/* Date To Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>Date To (YYYY-MM-DD)</Text>
              <TextInput
                value={customTo}
                onChangeText={setCustomTo}
                placeholder="2026-10-27"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.dateInput, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
              />
            </View>

            <TouchableOpacity
              onPress={handleApplyCustomDates}
              style={[styles.applyRangeBtn, { backgroundColor: theme.colors.primary }]}
            >
              <Check size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.applyRangeBtnText}>Generate Analytics Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 8,
  },
  subTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  dateRangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  dateRangeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  presetsRow: {
    marginBottom: 8,
  },
  presetsContent: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  presetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  container: {
    paddingBottom: 40,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
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
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardBox: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptySectionText: {
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 12,
  },
  compRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compCol: {
    flex: 1,
  },
  compLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  compVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  paymentMethodBlock: {
    marginBottom: 12,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pmLeft: {},
  pmRight: {
    alignItems: 'flex-end',
  },
  pmName: {
    fontSize: 13,
    fontWeight: '600',
  },
  pmCount: {
    fontSize: 11,
  },
  pmAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  pmPercent: {
    fontSize: 11,
    fontWeight: '600',
  },
  pmBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  pmBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: '800',
  },
  merchantName: {
    fontSize: 13,
    fontWeight: '600',
  },
  merchantCount: {
    fontSize: 11,
  },
  merchantTotal: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  quickPresetGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickPresetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickPresetBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  applyRangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  applyRangeBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
