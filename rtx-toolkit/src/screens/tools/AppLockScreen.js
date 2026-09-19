import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/theme';
import AppButton from '../../components/AppButton';
import { hasPinSet, setPin, removePin, verifyPin } from '../../services/appLockService';

/**
 * AppLockScreen
 * ---------------
 * Set / change / remove the PIN that protects sensitive screens inside
 * this app (see appLockService.js for exact scope). Three simple states so
 * there's never ambiguity about what's happening:
 *  - no PIN set   -> "Create PIN" form
 *  - PIN is set   -> status + "Change PIN" / "Remove PIN" buttons
 *  - changing PIN -> must verify current PIN first, then set a new one
 */
export default function AppLockScreen() {
  const [loading, setLoading] = useState(true);
  const [pinExists, setPinExists] = useState(false);
  const [mode, setMode] = useState('view'); // view | create | verify-to-change
  const [pinInput, setPinInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    hasPinSet().then((exists) => {
      setPinExists(exists);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    setError('');
    if (pinInput !== confirmInput) {
      setError('দুটো PIN মিলছে না।');
      return;
    }
    try {
      await setPin(pinInput);
      setPinExists(true);
      setMode('view');
      setPinInput('');
      setConfirmInput('');
      Alert.alert('সফল', 'App Lock PIN সেট করা হয়েছে।');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyThenRemove = async () => {
    const ok = await verifyPin(pinInput);
    if (!ok) {
      setError('ভুল PIN।');
      return;
    }
    await removePin();
    setPinExists(false);
    setPinInput('');
    setMode('view');
    Alert.alert('সফল', 'App Lock বন্ধ করা হয়েছে।');
  };

  if (loading) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>APP LOCK</Text>
      <Text style={styles.scopeNote}>
        এই PIN দিয়ে RTX TOOL KIT এর সেনসিটিভ স্ক্রিন (Router Dashboard, Payment History) লক থাকবে।
      </Text>

      {mode === 'view' && (
        <View style={styles.statusCard}>
          <Ionicons
            name={pinExists ? 'lock-closed' : 'lock-open'}
            size={40}
            color={pinExists ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={styles.statusText}>{pinExists ? 'App Lock চালু আছে' : 'App Lock বন্ধ আছে'}</Text>

          {pinExists ? (
            <AppButton label="PIN রিমুভ করুন" variant="danger" onPress={() => setMode('remove')} />
          ) : (
            <AppButton label="PIN সেট করুন" variant="primary" icon="lock-closed" onPress={() => setMode('create')} />
          )}
        </View>
      )}

      {mode === 'create' && (
        <View style={styles.formCard}>
          <Text style={styles.label}>নতুন PIN (৪-৬ সংখ্যা)</Text>
          <TextInput
            style={styles.input}
            value={pinInput}
            onChangeText={setPinInput}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
          />
          <Text style={styles.label}>PIN কনফার্ম করুন</Text>
          <TextInput
            style={styles.input}
            value={confirmInput}
            onChangeText={setConfirmInput}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
          />
          {!!error && <Text style={styles.error}>⚠ {error}</Text>}
          <AppButton label="সেভ করুন" variant="primary" onPress={handleCreate} />
          <AppButton label="বাতিল" variant="secondary" onPress={() => setMode('view')} />
        </View>
      )}

      {mode === 'remove' && (
        <View style={styles.formCard}>
          <Text style={styles.label}>বর্তমান PIN দিন</Text>
          <TextInput
            style={styles.input}
            value={pinInput}
            onChangeText={setPinInput}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
          />
          {!!error && <Text style={styles.error}>⚠ {error}</Text>}
          <AppButton label="নিশ্চিত করুন" variant="danger" onPress={handleVerifyThenRemove} />
          <AppButton label="বাতিল" variant="secondary" onPress={() => setMode('view')} />
        </View>
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
  },
  scopeNote: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
  },
  statusText: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    marginVertical: SPACING.md,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.md,
    backgroundColor: COLORS.background,
    letterSpacing: 4,
  },
  error: {
    color: COLORS.danger,
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.md,
  },
});
