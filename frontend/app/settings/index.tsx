import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../src/store/themeStore';
import {
  ArrowLeft,
  Palette,
  Shield,
  Bell,
  Tags,
  Download,
  FileText,
  ChevronRight,
  Info,
} from 'lucide-react-native';

export default function SettingsIndexScreen() {
  const router = useRouter();
  const { theme, mode } = useThemeStore();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>PREFERENCES</Text>
          <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <TouchableOpacity
              onPress={() => router.push('/settings/appearance')}
              style={styles.item}
            >
              <View style={styles.itemLeft}>
                <Palette size={20} color={theme.colors.primary} />
                <Text style={[styles.itemText, { color: theme.colors.textPrimary }]}>Appearance</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={[styles.itemValue, { color: theme.colors.textSecondary }]}>
                  {mode.toUpperCase()}
                </Text>
                <ChevronRight size={18} color={theme.colors.textMuted} />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <TouchableOpacity
              onPress={() => router.push('/settings/security')}
              style={styles.item}
            >
              <View style={styles.itemLeft}>
                <Shield size={20} color={theme.colors.secondary} />
                <Text style={[styles.itemText, { color: theme.colors.textPrimary }]}>Security & App Lock</Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <TouchableOpacity
              onPress={() => router.push('/settings/notifications')}
              style={styles.item}
            >
              <View style={styles.itemLeft}>
                <Bell size={20} color={theme.colors.accent} />
                <Text style={[styles.itemText, { color: theme.colors.textPrimary }]}>Notifications</Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Data & Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>FINANCE DATA</Text>
          <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <TouchableOpacity
              onPress={() => router.push('/settings/categories')}
              style={styles.item}
            >
              <View style={styles.itemLeft}>
                <Tags size={20} color="#8B5CF6" />
                <Text style={[styles.itemText, { color: theme.colors.textPrimary }]}>Custom Categories</Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <TouchableOpacity
              onPress={() => router.push('/settings/data-export')}
              style={styles.item}
            >
              <View style={styles.itemLeft}>
                <Download size={20} color="#0D9488" />
                <Text style={[styles.itemText, { color: theme.colors.textPrimary }]}>Data Export (CSV & JSON)</Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <TouchableOpacity
              onPress={() => router.push('/reports')}
              style={styles.item}
            >
              <View style={styles.itemLeft}>
                <FileText size={20} color="#F59E0B" />
                <Text style={[styles.itemText, { color: theme.colors.textPrimary }]}>Financial Reports</Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* About Finly */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>ABOUT</Text>
          <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.item}>
              <View style={styles.itemLeft}>
                <Info size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.itemText, { color: theme.colors.textPrimary }]}>Finly Version</Text>
              </View>
              <Text style={[styles.itemValue, { color: theme.colors.textSecondary }]}>1.0.0 (SDK 58)</Text>
            </View>
          </View>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 6,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  group: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemValue: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginLeft: 48,
  },
});
