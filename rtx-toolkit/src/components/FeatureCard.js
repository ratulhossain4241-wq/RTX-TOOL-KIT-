import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme/theme';
import { usePlanLimit } from '../hooks/usePlanLimit';

/**
 * FeatureCard
 * -----------
 * One tile in the Dashboard grid. Same size/shape for every feature so the
 * grid never looks uneven. If the feature is premium-only and the user is
 * free, it shows a gold lock badge and routes straight to Premium screen
 * instead of opening the feature (no confusing error state).
 *
 * Props:
 *  - icon: Ionicons name
 *  - label: string
 *  - featureKey: key from FEATURE_LIMITS (in usePlanLimit.js)
 *  - onPress: function - called only when NOT locked
 *  - navigation: nav object - used to redirect to Premium screen when locked
 */
export default function FeatureCard({ icon, label, featureKey, onPress, navigation }) {
  const { isLocked } = usePlanLimit(featureKey);

  const handlePress = () => {
    if (isLocked) {
      navigation.navigate('Premium', { from: featureKey });
      return;
    }
    onPress();
  };

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.card} onPress={handlePress}>
      {isLocked && (
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={12} color={COLORS.background} />
        </View>
      )}
      <View style={[styles.iconWrap, isLocked && styles.iconWrapLocked]}>
        <Ionicons
          name={icon}
          size={26}
          color={isLocked ? COLORS.textMuted : COLORS.primary}
        />
      </View>
      <Text style={[styles.label, isLocked && styles.labelLocked]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const CARD_SIZE = '31%'; // 3 columns with gaps, consistent everywhere

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.neonGlow,
  },
  iconWrapLocked: {
    shadowOpacity: 0,
    elevation: 0,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  labelLocked: {
    color: COLORS.textMuted,
  },
  lockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.premiumGold,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
