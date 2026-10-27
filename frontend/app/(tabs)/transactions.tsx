import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/services/api/client';
import { TransactionItem } from '../../src/components/transactions/TransactionItem';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Transaction } from '../../src/types';
import { Search, Plus, Download, X } from 'lucide-react-native';
import { downloadCsvFile } from '../../src/utils/export';

export default function TransactionsScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all'); // all | expense | income
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  const {
    data: transactions,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Transaction[]>({
    queryKey: ['transactions-list', search, selectedType, selectedMethod],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedMethod !== 'all') params.append('paymentMethod', selectedMethod);
      params.append('limit', '50');

      return apiClient.get(`/transactions?${params.toString()}`);
    },
  });

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
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
            placeholder="Search merchant, description, reference ID..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Type Filter Pills */}
      <View style={styles.filterRow}>
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
                {type === 'all' ? 'All Transactions' : type}
              </Text>
            </TouchableOpacity>
          );
        })}
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
              search
                ? `No transactions matching "${search}" were found.`
                : 'No transactions recorded yet in this category.'
            }
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
  searchContainer: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  searchWrapper: {
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 40,
  },
});
