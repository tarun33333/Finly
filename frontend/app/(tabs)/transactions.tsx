import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/services/api/client';
import { TransactionItem } from '../../src/components/transactions/TransactionItem';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Transaction, Category } from '../../src/types';
import {
  Search,
  Plus,
  Download,
  X,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Check,
  Calendar,
  CreditCard,
  Layers,
} from 'lucide-react-native';
import { downloadCsvFile } from '../../src/utils/export';
import { formatINR } from '../../src/utils/currency';
import { deduplicateCategories } from '../../src/utils/category';

type DateFilterType = 'all' | 'today' | 'week' | 'month';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export default function TransactionsScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all'); // all | expense | income
  const [dateRange, setDateRange] = useState<DateFilterType>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Fetch available categories for category filter
  const { data: rawCategories } = useQuery<Category[]>({
    queryKey: ['filter-categories'],
    queryFn: () => apiClient.get('/categories'),
  });

  const categories = useMemo(() => deduplicateCategories(rawCategories), [rawCategories]);

  // Calculate start/end date filters based on selection
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    if (dateRange === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    if (dateRange === 'week') {
      const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    }
    if (dateRange === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    }
    return { startDate: undefined, endDate: undefined };
  }, [dateRange]);

  // Sort parameter computation
  const { sortBy, sortOrder } = useMemo(() => {
    switch (sortOption) {
      case 'oldest':
        return { sortBy: 'transactionDate', sortOrder: 'asc' };
      case 'highest':
        return { sortBy: 'amount', sortOrder: 'desc' };
      case 'lowest':
        return { sortBy: 'amount', sortOrder: 'asc' };
      case 'newest':
      default:
        return { sortBy: 'transactionDate', sortOrder: 'desc' };
    }
  }, [sortOption]);

  const {
    data: transactions,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Transaction[]>({
    queryKey: [
      'transactions-list',
      search,
      selectedType,
      selectedMethod,
      selectedCategoryId,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedMethod !== 'all') params.append('paymentMethod', selectedMethod);
      if (selectedCategoryId !== 'all') params.append('categoryId', selectedCategoryId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('limit', '60');

      return apiClient.get(`/transactions?${params.toString()}`);
    },
  });

  // Re-fetch transactions whenever user navigates to this tab
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedType !== 'all') count++;
    if (dateRange !== 'all') count++;
    if (selectedMethod !== 'all') count++;
    if (selectedCategoryId !== 'all') count++;
    if (sortOption !== 'newest') count++;
    return count;
  }, [selectedType, dateRange, selectedMethod, selectedCategoryId, sortOption]);

  const resetAllFilters = () => {
    setSelectedType('all');
    setDateRange('all');
    setSelectedMethod('all');
    setSelectedCategoryId('all');
    setSortOption('newest');
    setSearch('');
  };

  // Summary totals for currently displayed transactions
  const { totalExpense, totalIncome, count } = useMemo(() => {
    if (!transactions) return { totalExpense: 0, totalIncome: 0, count: 0 };
    let exp = 0;
    let inc = 0;
    transactions.forEach((t) => {
      if (t.type === 'expense') exp += t.amount;
      else if (t.type === 'income') inc += t.amount;
    });
    return { totalExpense: exp, totalIncome: inc, count: transactions.length };
  }, [transactions]);

  const handleExportCsv = async () => {
    try {
      const csvData = await apiClient.get<string>('/exports/transactions.csv');
      await downloadCsvFile(csvData, 'finly_transactions');
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'Could not export CSV file.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>Transactions</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleExportCsv}
            style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            accessibilityLabel="Export CSV"
          >
            <Download size={18} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/transactions/add')}
            style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Plus size={18} color="#FFF" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar + Filter Trigger */}
      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchWrapper,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Search size={18} color={theme.colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search merchant, description, UPI ref..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.filterTriggerBtn,
            {
              backgroundColor: activeFilterCount > 0 ? theme.colors.primary : theme.colors.surface,
              borderColor: activeFilterCount > 0 ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={18} color={activeFilterCount > 0 ? '#FFF' : theme.colors.textPrimary} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadgeCircle}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Type Filter Chips */}
      <View style={styles.quickChipsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
          {(['all', 'expense', 'income'] as const).map((type) => {
            const active = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: active ? '#FFF' : theme.colors.textSecondary, textTransform: 'capitalize' },
                  ]}
                >
                  {type === 'all' ? 'All Types' : type}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Quick Date Range Pills */}
          {(['all', 'today', 'week', 'month'] as const).map((period) => {
            const active = dateRange === period;
            const labelMap = { all: 'All Dates', today: 'Today', week: '7 Days', month: 'This Month' };
            return (
              <TouchableOpacity
                key={period}
                onPress={() => setDateRange(period)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: active ? `${theme.colors.accent}20` : theme.colors.surface,
                    borderColor: active ? theme.colors.accent : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: active ? theme.colors.accent : theme.colors.textSecondary },
                  ]}
                >
                  {labelMap[period]}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Reset Filters Chip if any filter is active */}
          {activeFilterCount > 0 && (
            <TouchableOpacity onPress={resetAllFilters} style={styles.resetFilterChip}>
              <RotateCcw size={12} color={theme.colors.expense} />
              <Text style={[styles.resetFilterText, { color: theme.colors.expense }]}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Filter Summary Header Strip */}
      <View style={[styles.summaryStrip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle }]}>
        <Text style={[styles.summaryCount, { color: theme.colors.textSecondary }]}>
          {count} {count === 1 ? 'transaction' : 'transactions'}
        </Text>
        <View style={styles.summaryTotalsRow}>
          {totalExpense > 0 && (
            <Text style={[styles.summaryExpense, { color: theme.colors.expense }]}>
              Spent: -{formatINR(totalExpense, false)}
            </Text>
          )}
          {totalIncome > 0 && (
            <Text style={[styles.summaryIncome, { color: theme.colors.income }]}>
              Income: +{formatINR(totalIncome, false)}
            </Text>
          )}
        </View>
      </View>

      {/* Transaction List */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : transactions && transactions.length > 0 ? (
          transactions.map((txn) => (
            <TransactionItem
              key={txn._id}
              transaction={txn}
              onPress={() => router.push(`/transactions/${txn._id}`)}
            />
          ))
        ) : (
          <EmptyState
            title="No transactions found"
            description={
              search || activeFilterCount > 0
                ? 'No transactions match your current search and filter criteria.'
                : 'No transactions recorded yet in this category.'
            }
            buttonTitle={activeFilterCount > 0 ? 'Clear Filters' : 'Add Transaction'}
            onButtonPress={activeFilterCount > 0 ? resetAllFilters : () => router.push('/transactions/add')}
          />
        )}
      </ScrollView>

      {/* Comprehensive Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Filter size={20} color={theme.colors.primary} />
                <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Filter & Sort</Text>
              </View>
              <TouchableOpacity onPress={() => setShowFilterModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Sort By Section */}
              <View style={styles.modalSection}>
                <View style={styles.sectionLabelRow}>
                  <ArrowUpDown size={15} color={theme.colors.textSecondary} />
                  <Text style={[styles.modalSectionTitle, { color: theme.colors.textPrimary }]}>Sort By</Text>
                </View>
                <View style={styles.chipGrid}>
                  {[
                    { key: 'newest', label: 'Newest First' },
                    { key: 'oldest', label: 'Oldest First' },
                    { key: 'highest', label: 'Highest Amount' },
                    { key: 'lowest', label: 'Lowest Amount' },
                  ].map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      onPress={() => setSortOption(opt.key as SortOption)}
                      style={[
                        styles.modalChip,
                        sortOption === opt.key && {
                          backgroundColor: `${theme.colors.primary}20`,
                          borderColor: theme.colors.primary,
                        },
                        { borderColor: theme.colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalChipText,
                          { color: sortOption === opt.key ? theme.colors.primary : theme.colors.textSecondary },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {sortOption === opt.key && <Check size={14} color={theme.colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Payment Method Section */}
              <View style={styles.modalSection}>
                <View style={styles.sectionLabelRow}>
                  <CreditCard size={15} color={theme.colors.textSecondary} />
                  <Text style={[styles.modalSectionTitle, { color: theme.colors.textPrimary }]}>Payment Method</Text>
                </View>
                <View style={styles.chipGrid}>
                  {['all', 'UPI', 'Cash', 'Debit Card', 'Credit Card', 'Bank Transfer'].map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setSelectedMethod(m)}
                      style={[
                        styles.modalChip,
                        selectedMethod === m && {
                          backgroundColor: `${theme.colors.primary}20`,
                          borderColor: theme.colors.primary,
                        },
                        { borderColor: theme.colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalChipText,
                          { color: selectedMethod === m ? theme.colors.primary : theme.colors.textSecondary },
                        ]}
                      >
                        {m === 'all' ? 'All Methods' : m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Category Filter Section */}
              {categories && categories.length > 0 && (
                <View style={styles.modalSection}>
                  <View style={styles.sectionLabelRow}>
                    <Layers size={15} color={theme.colors.textSecondary} />
                    <Text style={[styles.modalSectionTitle, { color: theme.colors.textPrimary }]}>Category</Text>
                  </View>
                  <View style={styles.chipGrid}>
                    <TouchableOpacity
                      onPress={() => setSelectedCategoryId('all')}
                      style={[
                        styles.modalChip,
                        selectedCategoryId === 'all' && {
                          backgroundColor: `${theme.colors.primary}20`,
                          borderColor: theme.colors.primary,
                        },
                        { borderColor: theme.colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalChipText,
                          { color: selectedCategoryId === 'all' ? theme.colors.primary : theme.colors.textSecondary },
                        ]}
                      >
                        All Categories
                      </Text>
                    </TouchableOpacity>
                    {categories.map((c) => (
                      <TouchableOpacity
                        key={c._id}
                        onPress={() => setSelectedCategoryId(c._id)}
                        style={[
                          styles.modalChip,
                          selectedCategoryId === c._id && {
                            backgroundColor: `${c.color}25`,
                            borderColor: c.color,
                          },
                          { borderColor: theme.colors.border },
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalChipText,
                            { color: selectedCategoryId === c._id ? c.color : theme.colors.textSecondary },
                          ]}
                        >
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={resetAllFilters} style={styles.resetBtn}>
                <Text style={[styles.resetBtnText, { color: theme.colors.textSecondary }]}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={[styles.applyBtn, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 12,
    gap: 4,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 10,
    gap: 8,
    alignItems: 'center',
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterTriggerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadgeCircle: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  quickChipsWrapper: {
    marginBottom: 8,
  },
  filterChipsRow: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resetFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  resetFilterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  summaryCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryTotalsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryExpense: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryIncome: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 40,
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
  modalSection: {
    marginBottom: 18,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  resetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
