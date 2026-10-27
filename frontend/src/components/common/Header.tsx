import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { Sun, Moon, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showThemeToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showThemeToggle = true,
}) => {
  const { theme, isDark, mode, setMode } = useThemeStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const toggleTheme = () => {
    if (mode === 'light') {
      setMode('dark');
    } else {
      setMode('light');
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.leftRow}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            {subtitle || `${getGreeting()},`}
          </Text>
          <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>
            {title || firstName}
          </Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        {showThemeToggle && (
          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.iconButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            {isDark ? (
              <Sun size={20} color={theme.colors.accent} />
            ) : (
              <Moon size={20} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => router.push('/settings/notifications')}
          style={[
            styles.iconButton,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Bell size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

