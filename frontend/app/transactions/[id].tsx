import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/services/api/client';
import { Transaction } from '../../src/types';
import { formatINR } from '../../src/utils/currency';
import { formatIndianDate } from '../../src/utils/date';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Hash,
  FileText,
  Trash2,
  Edit2,
  CheckCircle,
} from 'lucide-react-native';

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();

  const { data: transaction, isLoading } = useQuery<Transaction>({
    queryKey: ['transaction', id],
    queryFn: () => apiClient.get(`/transactions/${id}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/transactions/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions-list'] });
      router.back();
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to delete transaction.');
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to permanently delete this transaction? Your balances and budget totals will update.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  if (isLoading || !transaction) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const isIncome = transaction.type === 'income';
  const category = typeof transaction.categoryId === 'object' ? transaction.categoryId : null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.actionBtns}>
          <TouchableOpacity
            onPress={() => router.push(`/transactions/edit/${id}`)}
            style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <Edit2 size={18} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.iconBtn, { backgroundColor: `${theme.colors.expense}15`, borderColor: theme.colors.expense }]}
          >
            <Trash2 size={18} color={theme.colors.expense} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Main Card */}
        <View
          style={[
            styles.amountCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: isIncome ? `${theme.colors.income}20` : `${theme.colors.expense}20` },
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                { color: isIncome ? theme.colors.income : theme.colors.expense },
              ]}
            >
              {transaction.type.toUpperCase()}
            </Text>
          </View>

          <Text
            style={[
              styles.amountText,
              { color: isIncome ? theme.colors.income : theme.colors.textPrimary },
            ]}
          >
            {isIncome ? '+' : '-'}{formatINR(transaction.amount)}
          </Text>

          <Text style={[styles.merchantText, { color: theme.colors.textPrimary }]}>
            {transaction.merchant || transaction.description || 'Recorded Transaction'}
          </Text>

          {category && (
            <View style={[styles.catBadge, { backgroundColor: `${category.color}20` }]}>
              <View style={[styles.catDot, { backgroundColor: category.color }]} />
              <Text style={[styles.catName, { color: category.color }]}>{category.name}</Text>
            </View>
          )}
        </View>

        {/* Detailed Fields List */}
        <View
          style={[
            styles.detailList,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Calendar size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Date & Time
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
              {formatIndianDate(transaction.transactionDate)}
              {transaction.transactionTime ? ` at ${transaction.transactionTime}` : ''}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <CreditCard size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Payment Method
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
              {transaction.paymentMethod}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <CheckCircle size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Payment Status
              </Text>
            </View>
            <Text
              style={[
                styles.detailValue,
                {
                  color: transaction.paymentStatus === 'success' ? '#16A34A' : theme.colors.warning,
                  textTransform: 'capitalize',
                  fontWeight: '700',
                },
              ]}
            >
              {transaction.paymentStatus}
            </Text>
          </View>

          {transaction.referenceId ? (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.detailLabelRow}>
                  <Hash size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    UPI / Ref ID
                  </Text>
                </View>
                <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
                  {transaction.referenceId}
                </Text>
              </View>
            </>
          ) : null}

          {transaction.notes ? (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.detailLabelRow}>
                  <FileText size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    Notes
                  </Text>
                </View>
                <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
                  {transaction.notes}
                </Text>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  amountCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  amountText: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  merchantText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailList: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
});
