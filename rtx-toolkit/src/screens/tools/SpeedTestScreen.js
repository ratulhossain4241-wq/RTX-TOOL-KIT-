import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import AppButton from '../../components/AppButton';
import { measurePing, measureDownloadSpeed } from '../../services/speedTestService';

/**
 * SpeedTestScreen
 * ---------------
 * Shows REAL ping + download numbers only - never inflated. If a number
 * looks "too good" or "too bad", that's the actual network, not a bug to
 * hide. Big number = trust; users compare this against Fast.com themselves.
 */
export default function SpeedTestScreen() {
  const [status, setStatus] = useState('idle'); // idle | testing | done | error
  const [ping, setPing] = useState(null);
  const [download, setDownload] = useState(null);
  const [error, setError] = useState('');

  const runTest = async () => {
    setStatus('testing');
    setError('');
    setPing(null);
    setDownload(null);
    try {
      const pingMs = await measurePing();
      setPing(pingMs);

      const result = await measureDownloadSpeed();
      setDownload(result.mbps);

      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NETWORK SPEED TEST</Text>
      <Text style={styles.subtitle}>&gt; real measurement, no fake numbers_</Text>

      <View style={styles.resultCard}>
        <View style={styles.resultRow}>
          <Ionicons name="pulse" size={22} color={COLORS.secondary} />
          <Text style={styles.resultLabel}>PING</Text>
          <Text style={styles.resultValue}>
            {status === 'testing' && ping === null ? '...' : ping !== null ? `${ping} ms` : '-'}
          </Text>
        </View>
        <View style={styles.resultRow}>
          <Ionicons name="download" size={22} color={COLORS.primary} />
          <Text style={styles.resultLabel}>DOWNLOAD</Text>
          <Text style={styles.resultValue}>
            {status === 'testing' && download === null && ping !== null
              ? '...'
              : download !== null
              ? `${download} Mbps`
              : '-'}
          </Text>
        </View>
      </View>

      {status === 'testing' && <ActivityIndicator color={COLORS.primary} style={styles.spinner} />}
      {!!error && <Text style={styles.error}>⚠ {error}</Text>}

      <AppButton
        label={status === 'testing' ? 'টেস্ট চলছে...' : 'টেস্ট শুরু করুন'}
        variant="primary"
        icon="rocket"
        onPress={runTest}
        loading={status === 'testing'}
      />

      <Text style={styles.note}>
        নোট: এটি আপনার আসল ইন্টারনেট স্পিড দেখায়, যা মূলত আপনার ISP প্যাকেজ দিয়ে নির্ধারিত। কোনো
        অ্যাপ এই লিমিট বাড়াতে পারে না।
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
  resultCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.neonGlow,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  resultLabel: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  resultValue: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.lg,
    color: COLORS.textPrimary,
  },
  spinner: { marginBottom: SPACING.md },
  error: {
    color: COLORS.danger,
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    marginBottom: SPACING.md,
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
