import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
  days?: number;
  onDaysChange?: (days: number) => void;
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({
  data,
  days = 7,
  onDaysChange,
}) => {
  const { theme } = useThemeStore();

  if (!data || data.length === 0) return null;

  const totalSpent = data.reduce((sum, d) => sum + d.amount, 0);
  const dailyAverage = Math.round(totalSpent / data.length);
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
        <View style={{ flex: 1 }}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
            Spending Velocity
          </Text>
          <Text style={[styles.subText, { color: theme.colors.textSecondary }]}>
            Avg: <Text style={{ fontWeight: '700', color: theme.colors.primary }}>{formatINR(dailyAverage)}/day</Text> • Total: {formatINR(totalSpent)}
          </Text>
        </View>

        {onDaysChange && (
          <View style={[styles.timeframePill, { backgroundColor: theme.colors.background }]}>
            <TouchableOpacity
              onPress={() => onDaysChange(7)}
              style={[styles.pillBtn, days === 7 && { backgroundColor: theme.colors.primary }]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: days === 7 ? '#FFF' : theme.colors.textSecondary },
                ]}
              >
                7D
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDaysChange(30)}
              style={[styles.pillBtn, days === 30 && { backgroundColor: theme.colors.primary }]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: days === 30 ? '#FFF' : theme.colors.textSecondary },
                ]}
              >
                30D
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        horizontal={days > 7}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartArea}
      >
        {data.map((item, index) => {
          const heightPercent = Math.max(8, Math.round((item.amount / maxAmount) * 100));
          const isToday = index === data.length - 1;
          const isPeak = item.amount > 0 && item.amount === Math.max(...data.map((d) => d.amount));

          return (
            <View
              key={item.date}
              style={[styles.barColumn, days > 7 && { width: 36, marginHorizontal: 2 }]}
            >
              {item.amount > 0 && (
                <Text style={[styles.barAmount, { color: isPeak ? theme.colors.expense : theme.colors.textMuted }]}>
                  {item.amount >= 1000 ? `${(item.amount / 1000).toFixed(0)}k` : item.amount}
                </Text>
              )}
              <View style={[styles.barTrack, { backgroundColor: theme.colors.borderSubtle }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: isPeak
                        ? theme.colors.expense
                        : isToday
                        ? theme.colors.primary
                        : theme.colors.primaryLight,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: isToday ? theme.colors.primary : theme.colors.textSecondary,
                    fontWeight: isToday ? '700' : '500',
                  },
                ]}
              >
                {days > 14 ? item.date.slice(8) : item.day}
              </Text>
            </View>
          );
        })}
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
  },
  timeframePill: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 2,
  },
  pillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
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
    height: 90,
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'flex-end',
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
