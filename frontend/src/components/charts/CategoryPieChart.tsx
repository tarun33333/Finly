import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { formatINR } from '../../utils/currency';

interface CategoryItem {
  categoryId: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

interface CategoryPieChartProps {
  categories: CategoryItem[];
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ categories }) => {
  const { theme } = useThemeStore();

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <View
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
      <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: 16 }]}>
        Category Breakdown
      </Text>

      {/* Stacked Percentage Bar */}
      <View style={styles.barContainer}>
        {categories.map((cat, i) => (
          <View
            key={cat.categoryId || i}
            style={{
              width: `${Math.max(2, cat.percentage)}%`,
              backgroundColor: cat.color || theme.colors.primary,
              height: 12,
              borderTopLeftRadius: i === 0 ? 6 : 0,
              borderBottomLeftRadius: i === 0 ? 6 : 0,
              borderTopRightRadius: i === categories.length - 1 ? 6 : 0,
              borderBottomRightRadius: i === categories.length - 1 ? 6 : 0,
            }}
          />
        ))}
      </View>

      {/* Legend Rows */}
      <View style={styles.legendContainer}>
        {categories.slice(0, 6).map((cat) => (
          <View key={cat.categoryId} style={styles.legendRow}>
            <View style={styles.leftCol}>
              <View style={[styles.colorDot, { backgroundColor: cat.color || theme.colors.primary }]} />
              <Text numberOfLines={1} style={[styles.nameText, { color: theme.colors.textPrimary }]}>
                {cat.name}
              </Text>
            </View>

            <View style={styles.rightCol}>
              <Text style={[styles.amountText, { color: theme.colors.textPrimary }]}>
                {formatINR(cat.amount, false)}
              </Text>
              <Text style={[styles.percentText, { color: theme.colors.textSecondary }]}>
                {cat.percentage}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
  },
  barContainer: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },
  legendContainer: {
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  percentText: {
    fontSize: 12,
    width: 32,
    textAlign: 'right',
  },
});

