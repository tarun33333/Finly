import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const { theme } = useThemeStore();

  const getContainerStyle = (): ViewStyle => {
    let paddingVertical = 12;
    let paddingHorizontal = 18;
    if (size === 'sm') {
      paddingVertical = 8;
      paddingHorizontal = 12;
    } else if (size === 'lg') {
      paddingVertical = 16;
      paddingHorizontal = 24;
    }

    let backgroundColor = theme.colors.primary;
    let borderWidth = 0;
    let borderColor = 'transparent';

    switch (variant) {
      case 'primary':
        backgroundColor = theme.colors.primary;
        break;
      case 'secondary':
        backgroundColor = theme.colors.secondary;
        break;
      case 'danger':
        backgroundColor = theme.colors.expense;
        break;
      case 'outline':
        backgroundColor = 'transparent';
        borderWidth = 1.5;
        borderColor = theme.colors.primary;
        break;
      case 'ghost':
        backgroundColor = 'transparent';
        break;
    }

    return {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.md,
      opacity: disabled || loading ? 0.6 : 1,
      paddingVertical,
      paddingHorizontal,
      backgroundColor,
      borderWidth,
      borderColor,
    };
  };

  const getTextStyle = (): TextStyle => {
    let fontSize = theme.typography.button.fontSize;
    if (size === 'sm') fontSize = 14;
    if (size === 'lg') fontSize = 17;

    let color = theme.colors.white;
    switch (variant) {
      case 'outline':
        color = theme.colors.primary;
        break;
      case 'ghost':
        color = theme.colors.textPrimary;
        break;
      case 'secondary':
      case 'primary':
      case 'danger':
      default:
        color = theme.colors.white;
        break;
    }

    return {
      ...theme.typography.button,
      fontSize,
      color,
    };
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.white}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[getTextStyle(), icon ? { marginLeft: 8 } : null, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

