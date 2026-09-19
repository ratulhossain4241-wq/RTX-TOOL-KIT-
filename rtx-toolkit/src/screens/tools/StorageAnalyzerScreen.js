import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import AppButton from '../../components/AppButton';
import { getAppStorageBreakdown, clearAppCache, formatBytes } from '../../services/storageService';

/**
 * StorageAnalyzerScreen
 * ----------------------
 * Shows a real breakdown of what THIS app is storing on the device
 * (cache vs documents), and lets the user clear the cache safely.
 * Scope note is shown clearly so no one thinks this covers the whole phone.
 */
export default function StorageAnalyzerScreen() {
  const [loading, setLoading] = useState(true);
  const [breakdown, setBreakdown] = useState(null);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAppStorageBreakdown();
      setBreakdown(result);
    } catch (err) {
      Alert.alert('সমস্যা', 'স্টোরেজ তথ্য লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleClear = async () => {
    setClearing(true);
    try {
      const freed = await clearAppCache();
      Alert.alert('সফল', `${formatBytes(freed)} ক্লিন করা হয়েছে।`);
      await load();
    } catch (err) {
      Alert.alert('সমস্যা', 'ক্যাশ ক্লিন করা যায়নি।');
    } finally {
      setClearing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>STORAGE ANALYZER</Text>
      <Text style={styles.scopeNote}>শুধু এই অ্যাপের নিজের ডেটা দেখানো হচ্ছে (পুরো ফোনের নয়)</Text>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      ) : (
        <View style={styles.card}>
          <Row icon="server" label="Cache" value={formatBytes(breakdown?.cacheBytes)} />
          <Row icon="document-text" label="Documents" value={formatBytes(breakdown?.docBytes)} />
          <View style={styles.divider} />
          <Row icon="pie-chart" label="মোট" value={formatBytes(breakdown?.totalBytes)} bold />
        </View>
      )}

      <AppButton
        label="ক্যাশ ক্লিন করুন"
        variant="primary"
        icon="trash-bin"
        onPress={handleClear}
        loading={clearing}
        disabled={loading}
      />
    </View>
  );
}

function Row({ icon, label, value, bold }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={bold ? COLORS.primary : COLORS.secondary} />
      <Text style={[styles.rowLabel, bold && styles.rowLabelBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]}>{value}</Text>
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
  scopeNote: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
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
    ...SHADOWS.neonGlow,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  rowLabel: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  rowLabelBold: { color: COLORS.textPrimary, fontFamily: FONTS.monoBold },
  rowValue: { fontFamily: FONTS.mono, fontSize: FONTS.sizes.md, color: COLORS.textPrimary },
  rowValueBold: { color: COLORS.primary, fontFamily: FONTS.monoBold, fontSize: FONTS.sizes.lg },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
});
