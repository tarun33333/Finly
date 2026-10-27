import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/services/api/client';
import { ArrowLeft, BellRing, CalendarDays } from 'lucide-react-native';

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { theme } = useThemeStore();

  const [budgetAlerts, setBudgetAlerts] = useState(
    user?.preferences?.budgetAlerts ?? true
  );
  const [weeklySummary, setWeeklySummary] = useState(
    user?.preferences?.weeklySummary ?? true
  );

  const handleUpdate = async (key: 'budgetAlerts' | 'weeklySummary', value: boolean) => {
    if (key === 'budgetAlerts') setBudgetAlerts(value);
    if (key === 'weeklySummary') setWeeklySummary(value);

    try {
      await apiClient.patch('/users/me/preferences', { [key]: value });
      updateUser({ preferences: { ...user?.preferences, [key]: value } as any });
    } catch {
      // rollback
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
          Notifications
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.container}>
        <View
          style={[
            styles.cardGroup,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <BellRing size={20} color={theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
                  Budget Threshold Alerts
                </Text>
                <Text style={[styles.rowDesc, { color: theme.colors.textSecondary }]}>
                  Receive warnings when reaching 75% and 90% of budget limits
                </Text>
              </View>
            </View>
            <Switch
              value={budgetAlerts}
              onValueChange={(val) => handleUpdate('budgetAlerts', val)}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <CalendarDays size={20} color={theme.colors.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
                  Weekly Spending Digest
                </Text>
                <Text style={[styles.rowDesc, { color: theme.colors.textSecondary }]}>
                  Weekly summary of cash flow every Sunday evening
                </Text>
              </View>
            </View>
            <Switch
              value={weeklySummary}
              onValueChange={(val) => handleUpdate('weeklySummary', val)}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
        </View>
      </View>
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
    paddingTop: 16,
  },
  cardGroup: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginVertical: 10,
  },
});

