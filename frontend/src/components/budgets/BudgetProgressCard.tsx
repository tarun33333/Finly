import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Budget } from '../../types';
import { useThemeStore } from '../../store/themeStore';
import { formatINR } from '../../utils/currency';
import { AlertTriangle } from 'lucide-react-native';

interface BudgetProgressCardProps {
  budget: Budget;
  onPress: () => void;
}

export const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({
  budget,
  onPress,
}) => {
  const { theme } = useThemeStore();
  const progress = budget.progress || {
    spent: 0,
    remaining: budget.limitAmount,
    percentage: 0,
    isOverBudget: false,
    overAmount: 0,
    dailyAverage: 0,
    projectedSpend: 0,
  };

  const getProgressColor = () => {
    if (progress.percentage >= 90 || progress.isOverBudget) {
      return theme.colors.expense;
    }
    if (progress.percentage >= 75) {
      return theme.colors.warning;
    }
    return theme.colors.secondary;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.lg,
          ...theme.shadows.sm,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
            {budget.name}
          </Text>
          <Text style={[styles.periodText, { color: theme.colors.textSecondary }]}>
            {budget.period.toUpperCase()} BUDGET
          </Text>
        </View>

        <View style={styles.amountArea}>
          <Text style={[styles.spentText, { color: theme.colors.textPrimary }]}>
            {formatINR(progress.spent, false)}
          </Text>
          <Text style={[styles.limitText, { color: theme.colors.textSecondary }]}>
            of {formatINR(budget.limitAmount, false)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.barBackground, { backgroundColor: theme.colors.borderSubtle }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.min(100, progress.percentage)}%`,
              backgroundColor: getProgressColor(),
            },
          ]}
        />
      </View>

      {/* Footer Metrics */}
      <View style={styles.footerRow}>
        <Text style={[styles.percentageText, { color: getProgressColor() }]}>
          {progress.percentage}% spent
        </Text>

        {progress.isOverBudget ? (
          <View style={styles.warningRow}>
            <AlertTriangle size={14} color={theme.colors.expense} />
            <Text style={[styles.remainingText, { color: theme.colors.expense }]}>
              Over by {formatINR(progress.overAmount, false)}
            </Text>
          </View>
        ) : (
          <Text style={[styles.remainingText, { color: theme.colors.textSecondary }]}>
            {formatINR(progress.remaining, false)} remaining
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleArea: {
    flex: 1,
  },
  periodText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  amountArea: {
    alignItems: 'flex-end',
  },
  spentText: {
    fontSize: 16,
    fontWeight: '700',
  },
  limitText: {
    fontSize: 12,
    marginTop: 2,
  },
  barBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '600',
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

