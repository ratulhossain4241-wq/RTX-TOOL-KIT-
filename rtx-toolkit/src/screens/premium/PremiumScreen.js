import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/theme';
import AppButton from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';

const PERKS = [
  'Router Admin Dashboard আনলক',
  'App Lock - আনলিমিটেড অ্যাপ',
  'TV Remote - আনলিমিটেড ডিভাইস',
  'Junk Cleaner - আনলিমিটেড ক্লিন',
  'Duplicate Finder - আনলিমিটেড স্ক্যান',
  'Fake App Detector - আনলিমিটেড স্ক্যান',
  'Ad Blocker - ফুল ডোমেইন লিস্ট',
];

/**
 * PremiumScreen
 * -------------
 * Shows what premium unlocks + price, then routes to PaymentRequestScreen.
 * If the user already has an active premium plan, shows their status
 * instead of a duplicate "subscribe" button (avoids confusion).
 */
export default function PremiumScreen({ navigation }) {
  const { isPremium, profile } = useAuth();

  if (isPremium) {
    const expiry = profile?.expiryDate?.toDate ? profile.expiryDate.toDate() : profile?.expiryDate;
    const expiryText = expiry ? new Date(expiry).toLocaleDateString('bn-BD') : '';
    return (
      <View style={styles.centered}>
        <Ionicons name="shield-checkmark" size={56} color={COLORS.primary} />
        <Text style={styles.activeTitle}>আপনি ইতিমধ্যে PREMIUM</Text>
        {!!expiryText && <Text style={styles.activeSub}>মেয়াদ: {expiryText} পর্যন্ত</Text>}
        <AppButton label="ড্যাশবোর্ডে ফিরে যান" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.title}>GO PREMIUM</Text>
      <Text style={styles.price}>৳১০০০ <Text style={styles.perMonth}>/ মাস</Text></Text>

      <View style={styles.perksBox}>
        {PERKS.map((perk) => (
          <View key={perk} style={styles.perkRow}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
            <Text style={styles.perkText}>{perk}</Text>
          </View>
        ))}
      </View>

      <AppButton
        label="সাবস্ক্রাইব করুন"
        variant="primary"
        icon="flash"
        onPress={() => navigation.navigate('PaymentRequest')}
      />
      <AppButton label="পরে করব" variant="secondary" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.xl,
    color: COLORS.premiumGold,
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: SPACING.lg,
  },
  price: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.xxl,
    color: COLORS.primary,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  perMonth: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  perksBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  perkText: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  activeTitle: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.lg,
    color: COLORS.primary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  activeSub: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
});
