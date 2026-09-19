import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { getDeviceInfo } from '../../services/deviceService';
import { formatBytes } from '../../services/storageService';

/**
 * SystemMonitorScreen
 * ----------------------
 * Shows real, static device info (model, OS, total RAM, app version).
 * Clearly labeled "Device Info" rather than "Live CPU/RAM Monitor" - a
 * true live per-app performance monitor needs a native module (planned
 * for the bare-workflow batch).
 */
export default function SystemMonitorScreen() {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    getDeviceInfo().then((result) => {
      setInfo(result);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DEVICE INFO</Text>
      <Text style={styles.subtitle}>&gt; static device information_</Text>

      <View style={styles.card}>
        <Row icon="hardware-chip" label="Model" value={`${info.brand || ''} ${info.modelName || 'Unknown'}`} />
        <Row icon="logo-android" label="OS" value={`${info.osName || '-'} ${info.osVersion || ''}`} />
        <Row
          icon="server"
          label="Total RAM"
          value={info.totalMemoryBytes ? formatBytes(info.totalMemoryBytes) : 'পাওয়া যায়নি'}
        />
        <Row icon="apps" label="App Version" value={`${info.appVersion || '-'} (build ${info.buildVersion || '-'})`} />
      </View>

      <Text style={styles.note}>
        নোট: লাইভ CPU% / প্রতি-অ্যাপ RAM ব্যবহার দেখাতে native module লাগবে - এটা পরের একটি ব্যাচে
        (bare workflow) যোগ করা হবে।
      </Text>
    </View>
  );
}

function Row({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={COLORS.secondary} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
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
  },
  subtitle: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.cyanGlow,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  rowLabel: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  rowValue: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    maxWidth: '50%',
  },
  note: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
