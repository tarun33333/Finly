import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore, ThemeMode } from '../../src/store/themeStore';
import { Button } from '../../src/components/buttons/Button';
import { apiClient } from '../../src/services/api/client';
import { Check, Sparkles } from 'lucide-react-native';

const POPULAR_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Transportation',
  'Shopping',
  'Bills & Utilities',
  'Subscriptions',
  'Healthcare',
  'Entertainment',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { theme, mode, setMode } = useThemeStore();

  const [incomeTarget, setIncomeTarget] = useState(user?.monthlyIncomeTarget ? String(user.monthlyIncomeTarget) : '');
  const [spendingTarget, setSpendingTarget] = useState(user?.monthlySpendingTarget ? String(user.monthlySpendingTarget) : '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Food & Dining',
    'Groceries',
    'Transportation',
  ]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(mode);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const payload = {
        monthlyIncomeTarget: incomeTarget ? Number(incomeTarget) : undefined,
        monthlySpendingTarget: spendingTarget ? Number(spendingTarget) : undefined,
        themePreference: selectedTheme,
        preferences: {
          budgetAlerts,
          weeklySummary,
          biometricEnabled: user?.preferences?.biometricEnabled || false,
        },
        onboardingCompleted: true,
      };

      await apiClient.patch('/users/me', payload);
      await setMode(selectedTheme);
      updateUser(payload);
      router.replace('/(tabs)');
    } catch {
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: theme.colors.badgeBackground }]}>
            <Sparkles size={14} color={theme.colors.primary} />
            <Text style={[styles.badgeText, { color: theme.colors.primary }]}>Quick Setup</Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Personalize your Finly
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Tailor your budgeting goals, theme, and spending categories. You can always change these later.
          </Text>
        </View>

        {/* Monthly Income & Target */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Financial Targets (Optional)
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Estimated Monthly Income (₹)
            </Text>
            <TextInput
              value={incomeTarget}
              onChangeText={setIncomeTarget}
              placeholder="e.g. 75000"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              style={[
                styles.input,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary },
              ]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Monthly Spending Target (₹)
            </Text>
            <TextInput
              value={spendingTarget}
              onChangeText={setSpendingTarget}
              placeholder="e.g. 45000"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              style={[
                styles.input,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary },
              ]}
            />
          </View>
        </View>

        {/* Primary Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Where do you spend most?
          </Text>
          <View style={styles.pillContainer}>
            {POPULAR_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => toggleCategory(cat)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  {isSelected && <Check size={14} color="#FFF" style={{ marginRight: 4 }} />}
                  <Text
                    style={[
                      styles.pillText,
                      { color: isSelected ? '#FFF' : theme.colors.textPrimary },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Theme Preference */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Appearance
          </Text>
          <View style={styles.themeRow}>
            {(['system', 'light', 'dark'] as ThemeMode[]).map((t) => {
              const active = selectedTheme === t;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setSelectedTheme(t)}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: active ? theme.colors.badgeBackground : theme.colors.surface,
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeText,
                      { color: active ? theme.colors.primary : theme.colors.textSecondary, textTransform: 'capitalize' },
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notification preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Alerts & Insights
          </Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>
                Budget threshold notifications
              </Text>
              <Text style={[styles.switchDesc, { color: theme.colors.textSecondary }]}>
                Get alerted before you hit 75% and 90% of your budget
              </Text>
            </View>
            <Switch
              value={budgetAlerts}
              onValueChange={setBudgetAlerts}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>
                Weekly spending digest
              </Text>
              <Text style={[styles.switchDesc, { color: theme.colors.textSecondary }]}>
                Every Sunday summary of income vs expenses
              </Text>
            </View>
            <Switch
              value={weeklySummary}
              onValueChange={setWeeklySummary}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
        </View>

        <Button
          title="Complete Setup"
          size="lg"
          onPress={handleFinish}
          loading={loading}
          style={{ marginTop: 12, marginBottom: 16 }}
        />

        <TouchableOpacity onPress={handleFinish} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
            Skip for now
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
