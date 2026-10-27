import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { formatINR } from '../../utils/currency';

interface DayTrend {
  date: string;
  day: string;
  amount: number;
  count: number;
}

interface WeeklyTrendChartProps {
  data: DayTrend[];
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ data }) => {
  const { theme } = useThemeStore();

  if (!data || data.length === 0) return null;

  const maxAmount = Math.max(...data.map((d) => d.amount), 500);

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
      <View style={styles.header}>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
          7-Day Activity
        </Text>
        <Text style={[styles.subText, { color: theme.colors.textSecondary }]}>
          Daily Spending Trend
        </Text>
      </View>

      <View style={styles.chartArea}>
        {data.map((item, index) => {
          const heightPercent = Math.max(8, Math.round((item.amount / maxAmount) * 100));
          const isToday = index === data.length - 1;

          return (
            <View key={item.date} style={styles.barColumn}>
              {item.amount > 0 && (
                <Text style={[styles.barAmount, { color: theme.colors.textMuted }]}>
                  {item.amount >= 1000 ? `${(item.amount / 1000).toFixed(1)}k` : item.amount}
                </Text>
              )}
              <View style={[styles.barTrack, { backgroundColor: theme.colors.borderSubtle }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: isToday ? theme.colors.primary : theme.colors.primaryLight,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: isToday ? theme.colors.primary : theme.colors.textSecondary,
                    fontWeight: isToday ? '700' : '400',
                  },
                ]}
              >
                {item.day}
              </Text>
            </View>
          );
        })}
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
  header: {
    marginBottom: 16,
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 16,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 14,
    height: 80,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barAmount: {
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayLabel: {
    fontSize: 11,
    marginTop: 6,
  },
});

