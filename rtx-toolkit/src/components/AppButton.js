import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme/theme';

/**
 * AppButton - the ONE button component used across the whole app.
 * Keeping every button in one place is what stops the UI from "breaking" -
 * every screen automatically gets consistent size, spacing and color.
 *
 * Props:
 *  - label: string (required) - always show text, never icon-only
 *  - onPress: function
 *  - variant: 'primary' | 'secondary' | 'danger' | 'locked'  (default 'primary')
 *  - icon: Ionicons name (optional)
 *  - loading: bool - shows spinner, disables press, prevents double-tap bugs
 *  - disabled: bool - dims button and blocks press
 *  - fullWidth: bool (default true)
 */
export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
}) {
  const isDisabled = disabled || loading;
  const styleSet = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.base,
        styleSet.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        variant === 'primary' && !isDisabled && SHADOWS.neonGlow,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={styleSet.text.color} size="small" />
      ) : (
        <View style={styles.content}>
          {variant === 'locked' && (
            <Ionicons name="lock-closed" size={16} color={styleSet.text.color} style={styles.icon} />
          )}
          {icon && variant !== 'locked' && (
            <Ionicons name={icon} size={18} color={styleSet.text.color} style={styles.icon} />
          )}
          <Text style={[styles.text, styleSet.text]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48, // >= 44px touch target
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.xs,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: SPACING.xs,
  },
  text: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.md,
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.4,
  },
});

// Each variant = distinct look so users never confuse actions
const VARIANT_STYLES = {
  primary: {
    container: { backgroundColor: COLORS.primary },
    text: { color: '#05080a' },
  },
  secondary: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: COLORS.secondary,
    },
    text: { color: COLORS.secondary },
  },
  danger: {
    container: { backgroundColor: COLORS.danger },
    text: { color: '#0b0b0b' },
  },
  locked: {
    container: {
      backgroundColor: COLORS.surfaceAlt,
      borderWidth: 1,
      borderColor: COLORS.premiumGold,
    },
    text: { color: COLORS.premiumGold },
  },
};
