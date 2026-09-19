/**
 * RTX TOOL KIT - Hacking Style Theme
 * ----------------------------------
 * Dark "terminal" aesthetic: near-black background, neon green/cyan accents,
 * monospace font, subtle scanline/glow feel. Used by every screen so the
 * whole app looks consistent.
 */

export const COLORS = {
  background: '#05080a',      // near-black
  surface: '#0b1210',         // card / panel background
  surfaceAlt: '#0f1a17',      // slightly lighter panel
  border: '#1c2b26',

  primary: '#00ff9c',         // neon green (main accent)
  primaryDim: '#00b36f',
  secondary: '#00e5ff',       // neon cyan (secondary accent)
  danger: '#ff2e63',          // alerts / free-limit warnings
  warning: '#ffb800',

  textPrimary: '#e6fff5',
  textSecondary: '#7fa89b',
  textMuted: '#3f5750',

  premiumGold: '#ffd166',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const FONTS = {
  // Load a real monospace font (e.g. 'ShareTechMono-Regular' or
  // 'JetBrainsMono-Regular') via expo-font in a later batch. Falls back to
  // the platform monospace font until then.
  mono: 'monospace',
  monoBold: 'monospace',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 14,
};

// Timing used by glow / typewriter / matrix-rain style animations
export const ANIMATION = {
  glowDuration: 1400,
  typewriterCharDelay: 18,
  consoleLineDelay: 220,
  bootSequenceDuration: 2200,
};

export const SHADOWS = {
  neonGlow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  cyanGlow: {
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
};

export default { COLORS, FONTS, SPACING, RADIUS, ANIMATION, SHADOWS };
