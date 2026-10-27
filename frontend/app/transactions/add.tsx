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
import { Category, TransactionType, PaymentMethod } from '../../src/types';
import { ArrowLeft, Sparkles, AlertTriangle, Check } from 'lucide-react-native';

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();

  const [type, setType] = useState<TransactionType>(
    (params.type as TransactionType) || 'expense'
  );
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [quickText, setQuickText] = useState('');
  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories', type],
    queryFn: () => apiClient.get(`/categories?type=${type}`),
  });

  // Auto-select valid category when loaded or when type changes
  React.useEffect(() => {
    if (categories && categories.length > 0) {
      const match = categories.find((c) => c._id === selectedCategoryId);
      if (!match) {
        setSelectedCategoryId(categories[0]._id);
      }
    }
  }, [categories, selectedCategoryId]);

  // Quick Text Natural Language Parser (e.g. "Spent 250 on lunch using UPI")
  const handleParseQuickText = () => {
    if (!quickText.trim()) return;

    const lower = quickText.toLowerCase();

    // Extract amount
    const amountMatch = lower.match(/(?:spent|paid|rs\.?|₹|\s)(\d+(?:\.\d{1,2})?)/i) || lower.match(/(\d+(?:\.\d{1,2})?)/);
    if (amountMatch && amountMatch[1]) {
      setAmount(amountMatch[1]);
    }

    // Determine type
    if (lower.includes('received') || lower.includes('earned') || lower.includes('salary')) {
      setType('income');
    } else {
      setType('expense');
    }

    // Determine payment method
    if (lower.includes('cash')) setPaymentMethod('Cash');
    else if (lower.includes('card')) setPaymentMethod('Debit Card');
    else setPaymentMethod('UPI');

    // Extract description / merchant hints
    if (lower.includes('swiggy')) {
      setMerchant('Swiggy');
      setDescription('Food order');
    } else if (lower.includes('zomato')) {
      setMerchant('Zomato');
      setDescription('Food order');
    } else if (lower.includes('uber')) {
      setMerchant('Uber');
      setDescription('Cab ride');
    } else if (lower.includes('blinkit') || lower.includes('grocery')) {
      setMerchant('Blinkit');
      setDescription('Grocery');
    } else {
      setDescription(quickText);
    }
  };

  const handleSave = async (forceDuplicate = false) => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount in ₹.');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Select Category', 'Please choose a category for this transaction.');
      return;
    }

    setLoading(true);
    setDuplicateWarning(null);

    try {
      const res = await apiClient.post('/transactions', {
        type,
        amount: numAmount,
        currency: 'INR',
        categoryId: selectedCategoryId,
        merchant: merchant.trim(),
        description: description.trim(),
        paymentMethod,
        transactionDate: new Date().toISOString(),
        notes: notes.trim(),
        allowDuplicate: forceDuplicate,
      });

      if (res.isDuplicateWarning && !forceDuplicate) {
        setDuplicateWarning(res.message);
        setLoading(false);
        return;
      }

      // Invalidate queries so dashboard, transactions, and reports refresh
      await queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions-list'] });
      await queryClient.invalidateQueries({ queryKey: ['spending-trend-7'] });
      await queryClient.invalidateQueries({ queryKey: ['category-breakdown'] });

      router.back();
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not record transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
          Add Transaction
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Quick Text Entry Mode */}
        <View
          style={[
            styles.quickBox,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.quickHeader}>
            <Sparkles size={14} color={theme.colors.primary} />
            <Text style={[styles.quickTitle, { color: theme.colors.primary }]}>
              Quick AI Entry
            </Text>
          </View>
          <View style={styles.quickInputRow}>
            <TextInput
              value={quickText}
              onChangeText={setQuickText}
              placeholder='e.g. "Spent ₹250 on lunch using UPI"'
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.quickInput, { color: theme.colors.textPrimary }]}
            />
            <TouchableOpacity
              onPress={handleParseQuickText}
              style={[styles.quickParseBtn, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.quickParseText}>Fill</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Duplicate Warning Alert */}
        {duplicateWarning && (
          <View style={[styles.duplicateBox, { backgroundColor: `${theme.colors.warning}15`, borderColor: theme.colors.warning }]}>
            <AlertTriangle size={18} color={theme.colors.warning} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.dupTitle, { color: theme.colors.warning }]}>
                Possible Duplicate Detected
              </Text>
              <Text style={[styles.dupMsg, { color: theme.colors.textPrimary }]}>
                {duplicateWarning}
              </Text>
              <TouchableOpacity
                onPress={() => handleSave(true)}
                style={[styles.dupConfirmBtn, { backgroundColor: theme.colors.warning }]}
              >
                <Text style={styles.dupConfirmText}>Save Anyway</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Type Switcher: Expense vs Income */}
        <View
          style={[
            styles.typeToggleContainer,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={() => setType('expense')}
            style={[
              styles.typeTab,
              type === 'expense' && { backgroundColor: theme.colors.expense },
            ]}
          >
            <Text
              style={[
                styles.typeTabText,
                { color: type === 'expense' ? '#FFF' : theme.colors.textSecondary },
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setType('income')}
            style={[
              styles.typeTab,
              type === 'income' && { backgroundColor: theme.colors.income },
            ]}
          >
            <Text
              style={[
                styles.typeTabText,
                { color: type === 'income' ? '#FFF' : theme.colors.textSecondary },
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input Large */}
        <View style={styles.amountSection}>
          <Text style={[styles.currencySymbol, { color: theme.colors.textPrimary }]}>₹</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="decimal-pad"
            style={[styles.amountInput, { color: theme.colors.textPrimary }]}
            autoFocus
          />
        </View>

        {/* Category Picker Grid */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            Select Category
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

        {/* Merchant & Description */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            Merchant / Payee Name
          </Text>
          <TextInput
            value={merchant}
            onChangeText={setMerchant}
            placeholder="e.g. Swiggy, Blinkit, House Owner"
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary },
            ]}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            Description / Item
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Lunch Biryani, Weekly Groceries"
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary },
            ]}
          />
        </View>

        {/* Payment Method Selector */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            Payment Method
          </Text>
          <View style={styles.paymentMethodRow}>
            {PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethod === method;
              return (
                <TouchableOpacity
                  key={method}
                  onPress={() => setPaymentMethod(method)}
                  style={[
                    styles.methodPill,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.methodPillText,
                      { color: isSelected ? '#FFF' : theme.colors.textPrimary },
                    ]}
                  >
                    {method}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            Notes (Optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any extra detail"
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary },
            ]}
          />
        </View>

        {/* Save Button */}
        <Button
          title={type === 'expense' ? 'Record Expense' : 'Record Income'}
          size="lg"
          variant={type === 'expense' ? 'primary' : 'secondary'}
          onPress={() => handleSave(false)}
          loading={loading}
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
    paddingTop: 8,
  },
  quickBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  quickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  quickInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickInput: {
    flex: 1,
    fontSize: 13,
  },
  quickParseBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickParseText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  duplicateBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  dupTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  dupMsg: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  dupConfirmBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  dupConfirmText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  typeToggleContainer: {
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
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '700',
    marginRight: 6,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    minWidth: 100,
  },
  fieldGroup: {
    marginBottom: 18,
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

