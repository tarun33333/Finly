import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/services/api/client';
import { Button } from '../../src/components/buttons/Button';
import { Category, TransactionType, PaymentMethod, PaymentStatus } from '../../src/types';
import { deduplicateCategories } from '../../src/utils/category';
import {
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react-native';

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];

export default function ReviewImportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();

  const extracted = params.extractedData ? JSON.parse(params.extractedData as string) : {};
  const duplicateInfo = params.duplicateData ? JSON.parse(params.duplicateData as string) : {};
  const attachmentPath = (params.attachmentPath as string) || '';

  const [type, setType] = useState<TransactionType>(extracted.transactionType || 'expense');
  const [amount, setAmount] = useState(String(extracted.amount || ''));
  const [merchant, setMerchant] = useState(extracted.merchant || '');
  const [description, setDescription] = useState(extracted.description || '');
  const [date, setDate] = useState(extracted.transactionDate || new Date().toISOString().split('T')[0]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(extracted.categoryId || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(extracted.paymentMethod || 'UPI');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(extracted.paymentStatus || 'success');
  const [referenceId, setReferenceId] = useState(extracted.referenceId || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch categories for type
  const { data: rawCategories } = useQuery<Category[]>({
    queryKey: ['categories', type],
    queryFn: () => apiClient.get(`/categories?type=${type}`),
  });

  const categories = React.useMemo(() => deduplicateCategories(rawCategories), [rawCategories]);

  React.useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      const match = categories.find((c) => c.name.toLowerCase() === (extracted.category || '').toLowerCase());
      setSelectedCategoryId(match ? match._id : categories[0]._id);
    }
  }, [categories, selectedCategoryId, extracted.category]);

  const handleConfirmAndSave = async (forceDuplicate = false) => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please verify the amount.');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Select Category', 'Please choose a category.');
      return;
    }

    let safeIsoDate = new Date().toISOString();
    try {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        safeIsoDate = parsed.toISOString();
      }
    } catch {}

    setLoading(true);
    try {
      await apiClient.post('/uploads/confirm-transaction', {
        type,
        amount: numAmount,
        currency: 'INR',
        categoryId: selectedCategoryId,
        merchant: merchant.trim(),
        description: description.trim(),
        transactionDate: safeIsoDate,
        paymentMethod,
        paymentStatus,
        referenceId: referenceId ? referenceId.trim() : undefined,
        attachmentPath,
        extractionConfidence: extracted.confidence || 0.9,
        source: 'upi_screenshot',
        notes: notes.trim(),
        userConfirmed: true,
        allowDuplicate: forceDuplicate,
      });

      // Invalidate queries so dashboard, transactions, and reports refresh
      await queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions-list'] });
      await queryClient.invalidateQueries({ queryKey: ['spending-trend'] });
      await queryClient.invalidateQueries({ queryKey: ['spending-trend-7'] });
      await queryClient.invalidateQueries({ queryKey: ['category-breakdown'] });
      await queryClient.invalidateQueries({ queryKey: ['home-budgets'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics-trend'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics-categories'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics-payments'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics-merchants'] });

      Alert.alert('Transaction Recorded', 'Your payment was confirmed and added to your finances.', [
        { text: 'Done', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not confirm transaction.');
    } finally {
      setLoading(false);
    }
  };

  const confidencePercent = Math.round((extracted.confidence || 0.85) * 100);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
          Review AI Extraction
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Confidence Banner */}
        <View
          style={[
            styles.confidenceCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.confidenceLeft}>
            <Sparkles size={18} color={theme.colors.primary} />
            <Text style={[styles.confidenceText, { color: theme.colors.textPrimary }]}>
              Finly Vision AI Confidence
            </Text>
          </View>
          <View
            style={[
              styles.confidenceBadge,
              { backgroundColor: confidencePercent >= 80 ? 'rgba(22, 163, 74, 0.15)' : 'rgba(245, 158, 11, 0.15)' },
            ]}
          >
            <Text
              style={[
                styles.confidenceScore,
                { color: confidencePercent >= 80 ? '#16A34A' : theme.colors.warning },
              ]}
            >
              {confidencePercent}% match
            </Text>
          </View>
        </View>

        {/* AI Warnings Banner if any */}
        {extracted.warnings && extracted.warnings.length > 0 && (
          <View
            style={[
              styles.warningBox,
              { backgroundColor: `${theme.colors.warning}15`, borderColor: theme.colors.warning },
            ]}
          >
            <AlertTriangle size={18} color={theme.colors.warning} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.warningTitle, { color: theme.colors.warning }]}>
                Please verify details
              </Text>
              {extracted.warnings.map((w: string, i: number) => (
                <Text key={i} style={[styles.warningText, { color: theme.colors.textPrimary }]}>
                  • {w}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Potential Duplicate Banner */}
        {duplicateInfo.isDuplicate && (
          <View
            style={[
              styles.warningBox,
              { backgroundColor: `${theme.colors.expense}15`, borderColor: theme.colors.expense },
            ]}
          >
            <AlertTriangle size={18} color={theme.colors.expense} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.warningTitle, { color: theme.colors.expense }]}>
                Potential Duplicate Transaction
              </Text>
              <Text style={[styles.warningText, { color: theme.colors.textPrimary }]}>
                {duplicateInfo.duplicateReason}
              </Text>
            </View>
          </View>
        )}

        {/* Amount Input */}
        <View style={styles.amountSection}>
          <Text style={[styles.currencyLabel, { color: theme.colors.textSecondary }]}>Amount (₹)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={[styles.amountInput, { color: theme.colors.textPrimary }]}
          />
        </View>

        {/* Transaction Type */}
        <View
          style={[
            styles.typeToggle,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={() => setType('expense')}
            style={[styles.typeTab, type === 'expense' && { backgroundColor: theme.colors.expense }]}
          >
            <Text style={[styles.typeTabText, { color: type === 'expense' ? '#FFF' : theme.colors.textSecondary }]}>
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setType('income')}
            style={[styles.typeTab, type === 'income' && { backgroundColor: theme.colors.income }]}
          >
            <Text style={[styles.typeTabText, { color: type === 'income' ? '#FFF' : theme.colors.textSecondary }]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Picker */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            Category (AI Suggested)
          </Text>
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

        {/* Merchant / Recipient */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            Merchant / Recipient
          </Text>
          <TextInput
            value={merchant}
            onChangeText={setMerchant}
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary },
            ]}
          />
        </View>

        {/* Date */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Date (YYYY-MM-DD)</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary },
            ]}
          />
        </View>

        {/* Reference ID / UTR */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            UPI Ref ID / UTR
          </Text>
          <TextInput
            value={referenceId}
            onChangeText={setReferenceId}
            placeholder="UPI/xxxxxxxxxxxx"
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary },
            ]}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Payment Method</Text>
          <View style={styles.paymentMethodRow}>
            {PAYMENT_METHODS.map((m) => {
              const isSelected = paymentMethod === m;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => setPaymentMethod(m)}
                  style={[
                    styles.methodPill,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.methodPillText, { color: isSelected ? '#FFF' : theme.colors.textPrimary }]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add personal note..."
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary },
            ]}
          />
        </View>

        {/* Buttons */}
        <Button
          title="Confirm & Save Transaction"
          icon={<ShieldCheck size={18} color="#FFF" />}
          size="lg"
          onPress={() => handleConfirmAndSave(false)}
          loading={loading}
          style={{ marginTop: 12 }}
        />

        <Button
          title="Cancel"
          variant="ghost"
          size="md"
          onPress={() => router.back()}
          style={{ marginTop: 8, marginBottom: 32 }}
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
    paddingTop: 8,
  },
  confidenceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  confidenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceScore: {
    fontSize: 12,
    fontWeight: '700',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 16,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currencyLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  amountInput: {
    fontSize: 42,
    fontWeight: '800',
    textAlign: 'center',
  },
  typeToggle: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeTabText: {
    fontSize: 14,
    fontWeight: '700',
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
  paymentMethodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  methodPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

