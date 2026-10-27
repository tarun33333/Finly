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
import { Budget } from '../../src/types';
import { formatINR } from '../../src/utils/currency';
import { formatIndianDate } from '../../src/utils/date';
import { ArrowLeft, Trash2, Calendar, Target, TrendingUp, AlertTriangle } from 'lucide-react-native';

export default function BudgetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();

  const { data: budget, isLoading } = useQuery<Budget>({
    queryKey: ['budget', id],
    queryFn: () => apiClient.get(`/budgets/${id}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/budgets/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['budgets-list'] });
      router.back();
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to delete budget.');
    },
  });

  const handleDelete = () => {
    Alert.alert('Delete Budget', 'Are you sure you want to delete this budget?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  if (isLoading || !budget) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const progress = budget.progress || {
    spent: 0,
    remaining: budget.limitAmount,
    percentage: 0,
    isOverBudget: false,
    overAmount: 0,
    dailyAverage: 0,
    projectedSpend: 0,
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          style={[styles.iconBtn, { backgroundColor: `${theme.colors.expense}15`, borderColor: theme.colors.expense }]}
        >
          <Trash2 size={18} color={theme.colors.expense} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View
          style={[
            styles.mainCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.budgetName, { color: theme.colors.textPrimary }]}>
            {budget.name}
          </Text>

          <Text style={[styles.spentNumber, { color: theme.colors.textPrimary }]}>
            {formatINR(progress.spent, false)}
          </Text>
          <Text style={[styles.limitNumber, { color: theme.colors.textSecondary }]}>
            Limit: {formatINR(budget.limitAmount, false)}
          </Text>

          {/* Progress Bar */}
          <View style={[styles.barTrack, { backgroundColor: theme.colors.borderSubtle }]}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.min(100, progress.percentage)}%`,
                  backgroundColor: progress.isOverBudget ? theme.colors.expense : theme.colors.secondary,
                },
              ]}
            />
          </View>

          <Text
            style={[
              styles.percentageText,
              { color: progress.isOverBudget ? theme.colors.expense : theme.colors.secondary },
            ]}
          >
            {progress.percentage}% consumed
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Target size={20} color={theme.colors.primary} />
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Remaining</Text>
            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
              {formatINR(progress.remaining, false)}
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <TrendingUp size={20} color={theme.colors.accent} />
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Projected Spend</Text>
            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
              {formatINR(progress.projectedSpend, false)}
            </Text>
          </View>
        </View>

        {/* Period Details */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.infoRow}>
            <Calendar size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Budget Period
            </Text>
            <Text style={[styles.infoVal, { color: theme.colors.textPrimary }]}>
              {formatIndianDate(budget.startDate)} – {formatIndianDate(budget.endDate)}
            </Text>
          </View>
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
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  mainCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  budgetName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  spentNumber: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 2,
  },
  limitNumber: {
    fontSize: 14,
    marginBottom: 16,
  },
  barTrack: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 'auto',
  },
});
