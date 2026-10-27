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
import { apiClient } from '../../src/services/api/client';
import { BudgetProgressCard } from '../../src/components/budgets/BudgetProgressCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Budget } from '../../src/types';
import { Plus } from 'lucide-react-native';

export default function BudgetsScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();

  const {
    data: budgets,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Budget[]>({
    queryKey: ['budgets-list'],
    queryFn: () => apiClient.get('/budgets'),
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>Budgets</Text>
        <TouchableOpacity
          onPress={() => router.push('/budgets/create')}
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Plus size={18} color="#FFF" />
          <Text style={styles.addBtnText}>New Budget</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { void refetch(); }}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : budgets && budgets.length > 0 ? (
          budgets.map((b) => (
            <BudgetProgressCard
              key={b._id}
              budget={b}
              onPress={() => router.push(`/budgets/${b._id}`)}
            />
          ))
        ) : (
          <EmptyState
            title="No budgets set"
            description="Set a monthly or category budget to keep your spending on track."
            buttonTitle="Create Your First Budget"
            onButtonPress={() => router.push('/budgets/create')}
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
    paddingBottom: 12,
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
  container: {
    paddingTop: 8,
    paddingBottom: 40,
  },
});

