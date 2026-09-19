import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, ANIMATION } from '../../theme/theme';
import AppButton from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { getAppStorageBreakdown, clearAppCache, formatBytes } from '../../services/storageService';
import { canUseToday, recordUsage } from '../../services/usageService';

const SCAN_LINES = [
  '[SCAN] checking cache directory...',
  '[SCAN] checking temp files...',
  '[SCAN] checking app documents...',
  '[DONE] scan complete',
];

/**
 * JunkCleanerScreen
 * -------------------
 * Hacker-style scan animation (purely visual, matches the app theme), then
 * shows real cache size and a "clean" action. Free users are limited to
 * once/day (usageService) - when the limit is hit, the button is replaced
 * by a clear message + Premium CTA instead of a silent failure.
 */
export default function JunkCleanerScreen() {
  const navigation = useNavigation();
  const { user, profile, isPremium } = useAuth();

  const [scanning, setScanning] = useState(true);
  const [scanLines, setScanLines] = useState([]);
  const [bytesFound, setBytesFound] = useState(0);
  const [cleaning, setCleaning] = useState(false);
  const [cleaned, setCleaned] = useState(false);
  const pulse = useRef(new Animated.Value(0.4)).current;

  const { allowed, remaining, limit } = canUseToday(profile, isPremium, 'junkCleaner');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setScanLines((prev) => [...prev, SCAN_LINES[i]]);
      i += 1;
      if (i >= SCAN_LINES.length) {
        clearInterval(interval);
        finishScan();
      }
    }, ANIMATION.consoleLineDelay);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 500, useNativeDriver: true }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  const finishScan = async () => {
    const breakdown = await getAppStorageBreakdown();
    setBytesFound(breakdown.cacheBytes);
    setScanning(false);
  };

  const handleClean = async () => {
    if (!allowed) {
      navigation.navigate('Premium', { from: 'junkCleaner' });
      return;
    }
    setCleaning(true);
    try {
      const freed = await clearAppCache();
      await recordUsage(user.uid, 'junkCleaner');
      setCleaned(true);
      setBytesFound(0);
      Alert.alert('সফল', `${formatBytes(freed)} ক্লিন করা হয়েছে।`);
    } catch (err) {
      Alert.alert('সমস্যা', 'ক্লিন করা যায়নি, আবার চেষ্টা করুন।');
    } finally {
      setCleaning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JUNK CLEANER</Text>

      {scanning ? (
        <View style={styles.scanBox}>
          <Animated.View style={{ opacity: pulse }}>
            <Ionicons name="scan-circle" size={48} color={COLORS.primary} />
          </Animated.View>
          <View style={styles.console}>
            {scanLines.map((line, idx) => (
              <Text key={idx} style={styles.consoleLine}>
                {line}
              </Text>
            ))}
          </View>
        </View>
      ) : (
        <>
          <View style={styles.resultCard}>
            <Ionicons
              name={cleaned ? 'checkmark-circle' : 'trash-bin'}
              size={40}
              color={cleaned ? COLORS.primary : COLORS.warning}
            />
            <Text style={styles.resultText}>
              {cleaned ? 'ক্লিন করা হয়েছে!' : `${formatBytes(bytesFound)} জাংক পাওয়া গেছে`}
            </Text>
          </View>

          {!allowed && !cleaned && (
            <Text style={styles.limitNote}>
              ফ্রি প্ল্যানে দিনে {limit}বার ক্লিন করা যায় - আজকের লিমিট শেষ। Premium নিলে আনলিমিটেড।
            </Text>
          )}

          <AppButton
            label={cleaned ? 'সম্পন্ন' : allowed ? 'এখনই ক্লিন করুন' : 'Premium প্রয়োজন'}
            variant={allowed ? 'primary' : 'locked'}
            icon={allowed ? 'trash-bin' : undefined}
            onPress={handleClean}
            loading={cleaning}
            disabled={cleaned}
          />
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
  scanBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  console: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    minHeight: 120,
  },
  consoleLine: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  resultCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.neonGlow,
  },
  resultText: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  limitNote: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.premiumGold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
});
