import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Transaction } from '../../types';
import { useThemeStore } from '../../store/themeStore';
import { formatINR } from '../../utils/currency';
import { formatIndianDate } from '../../utils/date';
import {
  Utensils,
  ShoppingBag,
  Car,
  Fuel,
  ShoppingCart,
  Zap,
  Home,
  HeartPulse,
  Briefcase,
  Laptop,
  CreditCard,
  Tag,
} from 'lucide-react-native';

const ICON_MAP: Record<string, any> = {
  Utensils,
  ShoppingBag,
  Car,
  Fuel,
  ShoppingCart,
  Zap,
  Home,
  HeartPulse,
  Briefcase,
  Laptop,
  CreditCard,
  Tag,
};

interface TransactionItemProps {
  transaction: Transaction;
  onPress: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
}) => {
  const { theme } = useThemeStore();

  const isIncome = transaction.type === 'income';
  const category = typeof transaction.categoryId === 'object' ? transaction.categoryId : null;
  const categoryName = category?.name || 'General';
  const categoryColor = category?.color || theme.colors.primary;
  const IconComponent = category?.icon && ICON_MAP[category.icon] ? ICON_MAP[category.icon] : Tag;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderSubtle,
        },
      ]}
    >
      {/* Icon Badge */}
      <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}20` }]}>
        <IconComponent size={20} color={categoryColor} />
      </View>

      {/* Main Info */}
      <View style={styles.infoContainer}>
        <Text
          numberOfLines={1}
          style={[styles.merchantText, { color: theme.colors.textPrimary }]}
        >
          {transaction.merchant || transaction.description || categoryName}
        </Text>

        <View style={styles.subRow}>
          <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
            {formatIndianDate(transaction.transactionDate)}
          </Text>
          <Text style={[styles.dot, { color: theme.colors.textMuted }]}>•</Text>
          <View style={[styles.methodBadge, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.methodText, { color: theme.colors.textSecondary }]}>
              {transaction.paymentMethod}
            </Text>
          </View>
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amountText,
            { color: isIncome ? theme.colors.income : theme.colors.textPrimary },
          ]}
        >
          {isIncome ? '+' : '-'}{formatINR(transaction.amount)}
        </Text>

        {transaction.paymentStatus !== 'success' && (
          <Text style={[styles.statusText, { color: theme.colors.warning }]}>
            {transaction.paymentStatus}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  merchantText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
  },
  dot: {
    marginHorizontal: 6,
    fontSize: 10,
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  methodText: {
    fontSize: 10,
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginTop: 2,
  },
});

