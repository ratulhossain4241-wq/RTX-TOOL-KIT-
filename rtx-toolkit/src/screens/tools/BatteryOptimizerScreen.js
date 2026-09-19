import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Battery from 'expo-battery';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import AppButton from '../../components/AppButton';
import { getBatteryInfo, getBatteryTips } from '../../services/batteryService';

const STATE_LABELS = {
  [Battery.BatteryState.UNKNOWN]: 'অজানা',
  [Battery.BatteryState.UNPLUGGED]: 'আনপ্লাগড',
  [Battery.BatteryState.CHARGING]: 'চার্জ হচ্ছে',
  [Battery.BatteryState.FULL]: 'ফুল চার্জ',
};

export default function BatteryOptimizerScreen() {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getBatteryInfo();
    setInfo(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const sub = Battery.addBatteryLevelListener(() => load());
    return () => sub.remove();
  }, [load]);

  const tips = info ? getBatteryTips(info) : [];
  const isCharging = info?.state === Battery.BatteryState.CHARGING || info?.state === Battery.BatteryState.FULL;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BATTERY OPTIMIZER</Text>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      ) : (
        <>
          <View style={styles.batteryCard}>
            <Ionicons
              name={isCharging ? 'battery-charging' : 'battery-half'}
              size={48}
              color={info.percent <= 20 && !isCharging ? COLORS.danger : COLORS.primary}
            />
            <Text style={styles.percent}>{info.percent}%</Text>
            <Text style={styles.stateText}>{STATE_LABELS[info.state] || 'অজানা'}</Text>
            {info.lowPowerMode && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>LOW POWER MODE ON</Text>
              </View>
            )}
          </View>

          <Text style={styles.tipsTitle}>ব্যাটারি বাঁচানোর টিপস</Text>
          <View style={styles.tipsCard}>
            {tips.map((tip, idx) => (
              <View key={idx} style={styles.tipRow}>
                <Text style={styles.tipBullet}>&gt;</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <AppButton label="রিফ্রেশ করুন" variant="secondary" icon="refresh" onPress={load} />
        </>
      )}
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
  batteryCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.neonGlow,
  },
  percent: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.xxl,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  stateText: { fontFamily: FONTS.mono, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  badge: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  badgeText: { fontFamily: FONTS.monoBold, fontSize: FONTS.sizes.xs, color: COLORS.secondary },
  tipsTitle: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  tipsCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  tipRow: { flexDirection: 'row', marginBottom: SPACING.sm },
  tipBullet: { color: COLORS.primary, fontFamily: FONTS.monoBold, marginRight: SPACING.xs },
  tipText: { flex: 1, fontFamily: FONTS.mono, fontSize: FONTS.sizes.sm, color: COLORS.textPrimary },
});
