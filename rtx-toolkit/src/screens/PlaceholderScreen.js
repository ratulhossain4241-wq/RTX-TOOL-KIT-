import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../theme/theme';
import AppButton from '../components/AppButton';

/**
 * PlaceholderScreen
 * -----------------
 * Temporary screen used for every feature that hasn't been built yet
 * (Junk Cleaner, Ad Blocker, TV Remote, etc.). This is what stops the app
 * from crashing with "screen not found" while we build features one batch
 * at a time - the Dashboard can safely link to every tool right now, and
 * each placeholder gets swapped for the real screen in a later batch.
 */
export default function PlaceholderScreen({ route, navigation }) {
  const title = route?.params?.title || route?.name || 'Feature';

  return (
    <View style={styles.container}>
      <Ionicons name="construct" size={48} color={COLORS.secondary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>&gt; module not yet deployed_</Text>
      <Text style={styles.sub}>এই ফিচারটি পরের ব্যাচে যোগ করা হবে।</Text>
      <AppButton label="ফিরে যান" variant="secondary" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.lg,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  text: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  sub: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
});
