import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS, FONTS, SPACING, ANIMATION } from '../../theme/theme';

/**
 * SplashScreen - "boot sequence" console animation.
 * Lines type out one by one like a terminal booting up, then fades into
 * the Login screen. This is purely visual (no real system checks) - it
 * exists to give the "hacker" feel the user asked for.
 */
const BOOT_LINES = [
  '[BOOT] initializing rtx-toolkit core...',
  '[OK]   loading modules...',
  '[OK]   secure channel established',
  '[OK]   auth service ready',
  '> welcome, operator',
];

export default function SplashScreen() {
  const [visibleLines, setVisibleLines] = useState([]);
  const glow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Reveal one console line at a time
    let i = 0;
    const interval = setInterval(() => {
      setVisibleLines((prev) => [...prev, BOOT_LINES[i]]);
      i += 1;
      if (i >= BOOT_LINES.length) clearInterval(interval);
    }, ANIMATION.consoleLineDelay);

    // Pulsing glow on the logo/title
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: ANIMATION.glowDuration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.4,
          duration: ANIMATION.glowDuration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.logo, { opacity: glow }]}>RTX TOOL KIT</Animated.Text>
      <View style={styles.console}>
        {visibleLines.map((line, idx) => (
          <Text key={idx} style={styles.line}>
            {line}
          </Text>
        ))}
      </View>
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
  logo: {
    fontFamily: FONTS.monoBold,
    fontSize: FONTS.sizes.xxl,
    color: COLORS.primary,
    letterSpacing: 4,
    marginBottom: SPACING.xl,
  },
  console: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    minHeight: 140,
  },
  line: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
});
