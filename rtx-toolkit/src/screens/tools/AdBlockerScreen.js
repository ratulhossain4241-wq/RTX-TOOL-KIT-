import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import {
  enableAdBlocking,
  disableAdBlocking,
  getAdBlockingStatus,
} from '../../services/adBlockerService';
import { getBlocklistForPlan } from '../../data/adBlockDomains';

/**
 * AdBlockerScreen
 * -----------------
 * Requires the native module (modules/rtx-ad-blocker) - dev-client build
 * only, not Expo Go. Free users get a small blocklist, premium gets the
 * full list (see adBlockDomains.js). Clearly explains the DNS-based scope
 * limitation so no one expects it to block 100% of all ads.
 */
export default function AdBlockerScreen() {
  const { isPremium } = useAuth();
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    try {
      setActive(getAdBlockingStatus());
    } catch {
      setErrorMsg('Native module পাওয়া যায়নি - dev client build এ রান করুন।');
    }
  }, []);

  const handleToggle = async (value) => {
    setErrorMsg('');
    if (!value) {
      disableAdBlocking();
      setActive(false);
      return;
    }

    setLoading(true);
    const result = await enableAdBlocking(isPremium);
    setLoading(false);

    if (result.success) {
      setActive(true);
    } else if (result.needsPermission) {
      Alert.alert(
        'VPN পারমিশন প্রয়োজন',
        'একটা সিস্টেম ডায়ালগ দেখানো হয়েছে - সেখানে অনুমতি দিয়ে আবার সুইচ অন করুন।'
      );
    } else {
      setErrorMsg(result.error || 'চালু করা যায়নি।');
    }
  };

  const blocklist = getBlocklistForPlan(isPremium);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AD BLOCKER</Text>

      <View style={styles.statusCard}>
        <Ionicons name={active ? 'shield-checkmark' : 'shield-outline'} size={40} color={active ? COLORS.primary : COLORS.textMuted} />
        <Text style={styles.statusText}>{active ? 'চালু আছে' : 'বন্ধ আছে'}</Text>
        <Switch
          value={active}
          onValueChange={handleToggle}
          disabled={loading}
          trackColor={{ false: COLORS.border, true: COLORS.primaryDim }}
          thumbColor={active ? COLORS.primary : COLORS.textMuted}
        />
      </View>

      {!!errorMsg && <Text style={styles.error}>⚠ {errorMsg}</Text>}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>এটা কী ব্লক করে?</Text>
        <Text style={styles.infoText}>
          DNS-লেভেলে পরিচিত ad/tracker ডোমেইন ব্লক করে (স্থানীয় VPN ব্যবহার করে)। এটা সব ধরনের ad
          ব্লক করতে পারবে না - যেসব ad মূল অ্যাপের নিজস্ব ডোমেইনেই সার্ভ হয়, সেগুলো ব্লক হবে না।
        </Text>
        <Text style={styles.listLabel}>
          {isPremium ? `ফুল লিস্ট (${blocklist.length}টি ডোমেইন)` : `ফ্রি লিস্ট (${blocklist.length}টি ডোমেইন)`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  title: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.lg,
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.neonGlow,
  },
  statusText: {
    flex: 1,
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  error: {
    color: COLORS.danger,
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  infoTitle: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  listLabel: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
});
