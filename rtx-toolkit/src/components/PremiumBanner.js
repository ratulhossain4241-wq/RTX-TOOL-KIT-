import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

/**
 * PremiumBanner
 * -------------
 * Sits at the top of the Dashboard. Two clear states:
 *  - Free user: gold outline banner, "UPGRADE" button -> Premium screen
 *  - Premium user: green "ACTIVE" badge with expiry date, no button
 * This is the ONLY place plan status is shown persistently, so the user
 * always knows where they stand without digging through menus.
 */
export default function PremiumBanner({ navigation }) {
  const { isPremium, profile } = useAuth();

  if (isPremium) {
    const expiry = profile?.expiryDate?.toDate ? profile.expiryDate.toDate() : profile?.expiryDate;
    const expiryText = expiry ? new Date(expiry).toLocaleDateString('bn-BD') : '';
    return (
      <View style={[styles.banner, styles.activeBanner]}>
        <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
        <View style={styles.textWrap}>
          <Text style={styles.activeTitle}>PREMIUM ACTIVE</Text>
          {!!expiryText && <Text style={styles.activeSub}>মেয়াদ: {expiryText} পর্যন্ত</Text>}
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.banner, styles.freeBanner]}
      onPress={() => navigation.navigate('Premium', { from: 'banner' })}
      activeOpacity={0.85}
    >
      <Ionicons name="flash" size={20} color={COLORS.premiumGold} />
      <View style={styles.textWrap}>
        <Text style={styles.freeTitle}>FREE PLAN</Text>
        <Text style={styles.freeSub}>সব ফিচার আনলক করতে Premium নিন</Text>
      </View>
      <View style={styles.upgradePill}>
        <Text style={styles.upgradeText}>UPGRADE</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  freeBanner: {
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.premiumGold,
  },
  activeBanner: {
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.primary,
  },
  textWrap: { flex: 1, marginLeft: SPACING.sm },
  freeTitle: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.sm,
    color: COLORS.premiumGold,
    letterSpacing: 1,
  },
  freeSub: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  activeTitle: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  activeSub: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  upgradePill: {
    backgroundColor: COLORS.premiumGold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  upgradeText: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.xs,
    color: COLORS.background,
  },
});
