import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/theme';
import AppButton from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { scanForSuspiciousApps } from '../../services/fakeAppDetectorService';
import { canUseToday, recordUsage } from '../../services/usageService';
import { openAppInfo } from '../../../modules/rtx-app-manager';

/**
 * FakeAppDetectorScreen
 * ------------------------
 * Uses the SAME native module as App Manager - no separate native code
 * needed. Shows real reasons for each flag (see fakeAppDetectorService.js)
 * instead of a scary generic "VIRUS FOUND!" - honest about what was
 * actually checked. Free plan: 1 scan/day.
 */
export default function FakeAppDetectorScreen() {
  const navigation = useNavigation();
  const { user, profile, isPremium } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const { allowed, limit } = canUseToday(profile, isPremium, 'fakeAppDetector');

  const handleScan = async () => {
    if (!allowed) {
      navigation.navigate('Premium', { from: 'fakeAppDetector' });
      return;
    }
    setScanning(true);
    setError('');
    try {
      const flagged = await scanForSuspiciousApps();
      setResults(flagged);
      await recordUsage(user.uid, 'fakeAppDetector');
    } catch (err) {
      setError('Native module পাওয়া যায়নি - dev client build এ রান করুন।');
    } finally {
      setScanning(false);
    }
  };

  if (results === null) {
    return (
      <View style={styles.centered}>
        <Ionicons name="shield-half" size={48} color={COLORS.secondary} />
        <Text style={styles.introText}>
          পরিচিত অ্যাপের নাম নকল করা ক্লোন অ্যাপ এবং অপরিচিত সোর্স থেকে ইনস্টল করা অ্যাপ খুঁজে বের
          করবে।
        </Text>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        {!allowed && (
          <Text style={styles.limitNote}>ফ্রি প্ল্যানে দিনে {limit}বার স্ক্যান করা যায় - আজকের লিমিট শেষ।</Text>
        )}
        <AppButton
          label={allowed ? 'স্ক্যান শুরু করুন' : 'Premium প্রয়োজন'}
          variant={allowed ? 'primary' : 'locked'}
          icon="search"
          onPress={handleScan}
          loading={scanning}
        />
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="checkmark-circle" size={48} color={COLORS.primary} />
        <Text style={styles.introText}>কোনো সন্দেহজনক অ্যাপ পাওয়া যায়নি।</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.packageName}
        contentContainerStyle={{ padding: SPACING.md }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="warning" size={20} color={COLORS.warning} />
              <Text style={styles.appName}>{item.appName}</Text>
            </View>
            <Text style={styles.pkg}>{item.packageName}</Text>
            {item.reasons.map((reason, idx) => (
              <Text key={idx} style={styles.reason}>
                &gt; {reason}
              </Text>
            ))}
            <AppButton
              label="App Info দেখুন"
              variant="secondary"
              fullWidth={false}
              onPress={() => openAppInfo(item.packageName)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  introText: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SPACING.lg,
  },
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  limitNote: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.premiumGold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.warning,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  appName: { fontFamily: FONTS.monoBold, fontSize: FONTS.sizes.sm, color: COLORS.textPrimary, marginLeft: SPACING.xs },
  pkg: { fontFamily: FONTS.mono, fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: SPACING.sm },
  reason: { fontFamily: FONTS.mono, fontSize: FONTS.sizes.xs, color: COLORS.warning, marginBottom: 2 },
});
