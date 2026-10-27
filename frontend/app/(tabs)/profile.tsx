import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/services/api/client';
import {
  User as UserIcon,
  Palette,
  Shield,
  Bell,
  Tags,
  Download,
  LogOut,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, mode } = useThemeStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Data',
      'This will permanently delete your Finly account and all recorded transactions, categories, and budgets. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete('/users/me');
              await logout();
              router.replace('/(auth)/welcome');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete account.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View
          style={[
            styles.userCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <View style={[styles.avatarCircle, { backgroundColor: theme.colors.badgeBackground }]}>
            <UserIcon size={32} color={theme.colors.primary} />
          </View>
          <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
            {user?.name || 'Finly User'}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
            {user?.email}
          </Text>

          <View style={[styles.currencyPill, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.currencyPillText, { color: theme.colors.primary }]}>
              Currency: ₹ INR
            </Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            PREFERENCES
          </Text>

          <View
            style={[
              styles.menuGroup,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <TouchableOpacity
              onPress={() => router.push('/settings/appearance')}
              style={styles.menuItem}
            >
              <View style={styles.menuLeft}>
                <Palette size={20} color={theme.colors.primary} />
                <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>Appearance</Text>
              </View>
              <View style={styles.menuRight}>
                <Text style={[styles.menuValue, { color: theme.colors.textSecondary }]}>
                  {mode.toUpperCase()}
                </Text>
                <ChevronRight size={18} color={theme.colors.textMuted} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              onPress={() => router.push('/settings/security')}
              style={styles.menuItem}
            >
              <View style={styles.menuLeft}>
                <Shield size={20} color={theme.colors.secondary} />
                <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>Security & Lock</Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              onPress={() => router.push('/settings/notifications')}
              style={styles.menuItem}
            >
              <View style={styles.menuLeft}>
                <Bell size={20} color={theme.colors.accent} />
                <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>Notifications</Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            MANAGEMENT
          </Text>

          <View
            style={[
              styles.menuGroup,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <TouchableOpacity
              onPress={() => router.push('/settings/categories')}
              style={styles.menuItem}
            >
              <View style={styles.menuLeft}>
                <Tags size={20} color="#8B5CF6" />
                <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>Categories</Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              onPress={() => router.push('/reports')}
              style={styles.menuItem}
            >
              <View style={styles.menuLeft}>
                <Download size={20} color="#0D9488" />
                <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
                  Export Statements (CSV)
                </Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            ACCOUNT
          </Text>

          <View
            style={[
              styles.menuGroup,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <LogOut size={20} color={theme.colors.textPrimary} />
                <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>Sign Out</Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity onPress={handleDeleteAccount} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Trash2 size={20} color={theme.colors.expense} />
                <Text style={[styles.menuText, { color: theme.colors.expense }]}>Delete Account</Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.versionText, { color: theme.colors.textMuted }]}>
          Finly v1.0.0 (Build 2026.10) • Every Rupee Counts.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  userCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 12,
  },
  currencyPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currencyPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  versionText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
  },
});

