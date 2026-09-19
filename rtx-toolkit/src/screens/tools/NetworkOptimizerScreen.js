import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import AppButton from '../../components/AppButton';
import { getNetworkInfo, getOptimizationTips } from '../../services/networkService';

/**
 * NetworkOptimizerScreen
 * ------------------------
 * Shows real connection info + honest, practical tips. Includes a shortcut
 * to the Speed Test tool so the user can verify their actual throughput
 * rather than trusting a made-up "boosted" number.
 */
export default function NetworkOptimizerScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getNetworkInfo();
    setInfo(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tips = info ? getOptimizationTips(info) : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NETWORK OPTIMIZER</Text>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      ) : (
        <>
          <View style={styles.statusCard}>
            <StatusRow
              icon={info.type === 'WIFI' ? 'wifi' : 'cellular'}
              label="কানেকশন টাইপ"
              value={info.type || 'অজানা'}
            />
            <StatusRow
              icon={info.isConnected ? 'checkmark-circle' : 'close-circle'}
              label="স্ট্যাটাস"
              value={info.isConnected ? 'কানেক্টেড' : 'ডিসকানেক্টেড'}
            />
            {!!info.ip && <StatusRow icon="locate" label="IP Address" value={info.ip} />}
          </View>

          <Text style={styles.tipsTitle}>টিপস</Text>
          <View style={styles.tipsCard}>
            {tips.map((tip, idx) => (
              <View key={idx} style={styles.tipRow}>
                <Text style={styles.tipBullet}>&gt;</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <AppButton
            label="স্পিড টেস্ট চালান"
            variant="secondary"
            icon="rocket"
            onPress={() => navigation.navigate('SpeedTest')}
          />
          <AppButton label="রিফ্রেশ করুন" variant="primary" icon="refresh" onPress={load} />
        </>
      )}
    </View>
  );
}

function StatusRow({ icon, label, value }) {
  return (
    <View style={styles.statusRow}>
      <Ionicons name={icon} size={20} color={COLORS.secondary} />
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
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
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.cyanGlow,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.xs },
  statusLabel: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  statusValue: { fontFamily: FONTS.monoBold, fontSize: FONTS.sizes.sm, color: COLORS.textPrimary },
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
