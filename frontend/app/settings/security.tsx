import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/services/api/client';
import { ArrowLeft, Fingerprint, Lock, ChevronRight } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export default function SecurityScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { theme } = useThemeStore();

  const [biometricEnabled, setBiometricEnabled] = useState(
    user?.preferences?.biometricEnabled || false
  );

  const handleToggleBiometric = async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          'Biometrics Not Available',
          'Your device does not have biometric hardware or no fingerprint/face is registered.'
        );
        return;
      }
    }

    setBiometricEnabled(value);
    try {
      await apiClient.patch('/users/me/preferences', { biometricEnabled: value });
      updateUser({ preferences: { ...user?.preferences, biometricEnabled: value } as any });
    } catch {
      setBiometricEnabled(!value);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
          Security & Lock
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
              <Fingerprint size={22} color={theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
                  Biometric App Lock
                </Text>
                <Text style={[styles.rowDesc, { color: theme.colors.textSecondary }]}>
                  Require Face ID or Fingerprint when opening Finly
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
        </View>

        <View
          style={[
            styles.cardGroup,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, marginTop: 16 },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.rowClickable}
          >
            <View style={styles.rowLeft}>
              <Lock size={20} color={theme.colors.secondary} />
              <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
                Change Password
              </Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
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
  },
  rowClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
});

