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
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/services/api/client';
import { Button } from '../../src/components/buttons/Button';
import { Category } from '../../src/types';
import { ArrowLeft } from 'lucide-react-native';

export default function CreateBudgetScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();

  const [name, setName] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [loading, setLoading] = useState(false);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories', 'expense'],
    queryFn: () => apiClient.get('/categories?type=expense'),
  });

  const handleCreate = async () => {
    const numLimit = parseFloat(limitAmount);
    if (!name.trim()) {
      Alert.alert('Budget Name', 'Please enter a name for this budget.');
      return;
    }
    if (!numLimit || numLimit <= 0) {
      Alert.alert('Budget Limit', 'Please enter a valid limit amount in ₹.');
      return;
    }

    setLoading(true);

    const now = new Date();
    const startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59));

    try {
      await apiClient.post('/budgets', {
        name: name.trim(),
        categoryId: selectedCategoryId,
        limitAmount: numLimit,
        currency: 'INR',
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        alertThresholds: [50, 75, 90, 100],
      });

      await queryClient.invalidateQueries({ queryKey: ['budgets-list'] });
      router.back();
    } catch (err: any) {
      Alert.alert('Creation Failed', err.message || 'Could not create budget.');
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
          Create Budget
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            Budget Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Monthly Dining Out, Groceries Budget"
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary },
            ]}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            Spending Limit (₹)
          </Text>
          <TextInput
            value={limitAmount}
            onChangeText={setLimitAmount}
            placeholder="e.g. 10000"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary },
            ]}
          />
        </View>

        {/* Scope: Overall vs Specific Category */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            Category Scope
          </Text>
          <View style={styles.categoryGrid}>
            <TouchableOpacity
              onPress={() => setSelectedCategoryId(null)}
              style={[
                styles.catPill,
                {
                  backgroundColor: selectedCategoryId === null ? theme.colors.primary : theme.colors.surface,
                  borderColor: selectedCategoryId === null ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  { color: selectedCategoryId === null ? '#FFF' : theme.colors.textPrimary },
                ]}
              >
                All Spending (Overall)
              </Text>
            </TouchableOpacity>

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

        <Button
          title="Create Budget"
          size="lg"
          onPress={handleCreate}
          loading={loading}
          style={{ marginTop: 24 }}
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
    marginBottom: 20,
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

