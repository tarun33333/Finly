import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeStore, ThemeMode } from '../../src/store/themeStore';
import { ArrowLeft, Check, Sun, Moon, Smartphone } from 'lucide-react-native';

export default function AppearanceScreen() {
  const router = useRouter();
  const { theme, mode, setMode } = useThemeStore();

  const options: Array<{ mode: ThemeMode; label: string; desc: string; icon: any }> = [
    {
      mode: 'system',
      label: 'System Match',
      desc: 'Follow your device system dark/light mode settings.',
      icon: Smartphone,
    },
    {
      mode: 'light',
      label: 'Light Mode',
      desc: 'Crisp, clean layout with light backgrounds.',
      icon: Sun,
    },
    {
      mode: 'dark',
      label: 'Dark Mode',
      desc: 'Easy on the eyes in low-light environments.',
      icon: Moon,
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Appearance</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.container}>
        {options.map((opt) => {
          const isSelected = mode === opt.mode;
          const Icon = opt.icon;

          return (
            <TouchableOpacity
              key={opt.mode}
              onPress={() => setMode(opt.mode)}
              style={[
                styles.optionCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: isSelected ? theme.colors.badgeBackground : theme.colors.background },
                ]}
              >
                <Icon size={20} color={isSelected ? theme.colors.primary : theme.colors.textSecondary} />
              </View>

              <View style={styles.infoArea}>
                <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>
                  {opt.label}
                </Text>
                <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>
                  {opt.desc}
                </Text>
              </View>

              {isSelected && (
                <View style={[styles.checkCircle, { backgroundColor: theme.colors.primary }]}>
                  <Check size={14} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoArea: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

