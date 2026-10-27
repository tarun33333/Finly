import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Sparkles, ArrowRight, X } from 'lucide-react-native';
import { formatINR } from '../../utils/currency';

interface InsightCardProps {
  title: string;
  explanation: string;
  estimatedSaving?: number;
  onPressAction?: () => void;
  onDismiss?: () => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  explanation,
  estimatedSaving,
  onPressAction,
  onDismiss,
}) => {
  const { theme } = useThemeStore();

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
        <View style={styles.badgeRow}>
          <View style={[styles.aiBadge, { backgroundColor: theme.colors.badgeBackground }]}>
            <Sparkles size={14} color={theme.colors.primary} />
            <Text style={[styles.badgeText, { color: theme.colors.primary }]}>Finly AI</Text>
          </View>

          {estimatedSaving && estimatedSaving > 0 && (
            <View style={[styles.savingsBadge, { backgroundColor: 'rgba(32, 201, 151, 0.15)' }]}>
              <Text style={[styles.savingsText, { color: theme.colors.secondary }]}>
                Potential saving: ~{formatINR(estimatedSaving, false)}
              </Text>
            </View>
          )}
        </View>

        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
            <X size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 10 }]}>
        {title}
      </Text>

      <Text
        style={[
          theme.typography.body,
          { color: theme.colors.textSecondary, marginTop: 6, lineHeight: 21 },
        ]}
      >
        {explanation}
      </Text>

      {onPressAction && (
        <TouchableOpacity
          onPress={onPressAction}
          style={[styles.actionRow, { borderTopColor: theme.colors.borderSubtle }]}
        >
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>View Details</Text>
          <ArrowRight size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
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
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  savingsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

