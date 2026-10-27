import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../../src/store/themeStore';
import { apiClient } from '../../../src/services/api/client';
import { Button } from '../../../src/components/buttons/Button';
import { Category, Transaction, PaymentMethod } from '../../../src/types';
import { ArrowLeft } from 'lucide-react-native';
import { deduplicateCategories } from '../../../src/utils/category';

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];

export default function EditTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();

  const { data: transaction, isLoading } = useQuery<Transaction>({
    queryKey: ['transaction', id],
    queryFn: () => apiClient.get(`/transactions/${id}`),
  });

  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setAmount(String(transaction.amount));
      const catId = typeof transaction.categoryId === 'object' ? transaction.categoryId._id : transaction.categoryId;
      setSelectedCategoryId(catId);
      setMerchant(transaction.merchant || '');
      setDescription(transaction.description || '');
      setPaymentMethod(transaction.paymentMethod);
      setNotes(transaction.notes || '');
    }
  }, [transaction]);

  const { data: rawCategories } = useQuery<Category[]>({
    queryKey: ['categories', transaction?.type || 'expense'],
    queryFn: () => apiClient.get(`/categories?type=${transaction?.type || 'expense'}`),
    enabled: !!transaction,
  });

  const categories = React.useMemo(() => deduplicateCategories(rawCategories), [rawCategories]);

  const handleUpdate = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setSaving(true);
    try {
      await apiClient.patch(`/transactions/${id}`, {
        amount: numAmount,
        categoryId: selectedCategoryId,
        merchant: merchant.trim(),
        description: description.trim(),
        paymentMethod,
        notes: notes.trim(),
      });

      await queryClient.invalidateQueries({ queryKey: ['transaction', id] });
      await queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions-list'] });
      await queryClient.invalidateQueries({ queryKey: ['spending-trend'] });
      await queryClient.invalidateQueries({ queryKey: ['category-breakdown'] });
      await queryClient.invalidateQueries({ queryKey: ['home-budgets'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics-trend'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics-categories'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics-payments'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics-merchants'] });

      router.back();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update transaction.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !transaction) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
          Edit Transaction
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Amount (₹)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary },
            ]}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories?.map((cat) => {
              const isSelected = selectedCategoryId === cat._id;
              return (
                <TouchableOpacity
                  key={cat._id}
                  onPress={() => setSelectedCategoryId(cat._id)}
                  style={[
                    styles.catPill,
                    {
                      backgroundColor: isSelected ? `${cat.color}25` : theme.colors.surface,
                      borderColor: isSelected ? cat.color : theme.colors.border,
                    },
                  ]}
                >
                  <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                  <Text
                    style={[
                      styles.catText,
                      { color: isSelected ? cat.color : theme.colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Merchant</Text>
          <TextInput
            value={merchant}
            onChangeText={setMerchant}
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary },
            ]}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary },
            ]}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Payment Method</Text>
          <View style={styles.categoryGrid}>
            {PAYMENT_METHODS.map((m) => {
              const isSelected = paymentMethod === m;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => setPaymentMethod(m)}
                  style={[
                    styles.catPill,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catText,
                      { color: isSelected ? '#FFF' : theme.colors.textPrimary },
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary },
            ]}
          />
        </View>

        <Button
          title="Save Changes"
          size="lg"
          onPress={handleUpdate}
          loading={saving}
          style={{ marginTop: 12, marginBottom: 32 }}
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
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  fieldGroup: {
    marginBottom: 16,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catText: {
    fontSize: 13,
  },
});

