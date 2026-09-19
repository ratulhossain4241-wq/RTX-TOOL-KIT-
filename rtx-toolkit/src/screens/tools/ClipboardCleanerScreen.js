import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import AppButton from '../../components/AppButton';
import { getClipboardPreview, clearClipboard } from '../../services/clipboardService';

/**
 * ClipboardCleanerScreen
 * ------------------------
 * Shows what's currently on the clipboard (truncated preview, so we never
 * accidentally display something long/sensitive in full) and lets the user
 * clear it with one tap.
 */
export default function ClipboardCleanerScreen() {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const text = await getClipboardPreview();
      setPreview(text);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleClear = async () => {
    await clearClipboard();
    Alert.alert('সফল', 'ক্লিপবোর্ড ক্লিন করা হয়েছে।');
    refresh();
  };

  const truncated = preview ? (preview.length > 80 ? `${preview.slice(0, 80)}...` : preview) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CLIPBOARD CLEANER</Text>

      <View style={styles.card}>
        <Ionicons name="copy" size={28} color={COLORS.secondary} />
        <Text style={styles.label}>বর্তমান ক্লিপবোর্ড:</Text>
        <Text style={styles.preview} numberOfLines={3}>
          {loading ? 'লোড হচ্ছে...' : truncated || '(খালি)'}
        </Text>
      </View>

      <AppButton
        label="ক্লিপবোর্ড ক্লিন করুন"
        variant="primary"
        icon="trash-bin"
        onPress={handleClear}
        disabled={loading || !preview}
      />

      <Text style={styles.note}>
        নোট: ফোন OS এর নিরাপত্তা নীতির কারণে কোনো অ্যাপ পুরনো ক্লিপবোর্ড হিস্ট্রি দেখতে পারে না -
        শুধু এই মুহূর্তে যা কপি করা আছে সেটাই দেখা/মোছা যায়।
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
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.cyanGlow,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  preview: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  note: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
