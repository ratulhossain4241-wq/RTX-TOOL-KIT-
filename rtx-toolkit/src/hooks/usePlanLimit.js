import { useAuth } from '../context/AuthContext';

/**
 * FEATURE_LIMITS
 * --------------
 * Single source of truth for what free users can/can't do. Change limits
 * here and the whole app (dashboard locks, in-screen limit checks) updates.
 * `locked: true` means the feature is premium-only, no free access at all.
 */
export const FEATURE_LIMITS = {
  junkCleaner: { locked: false, freeLimitPerDay: 1 },
  networkOptimizer: { locked: false, freeLimitPerDay: null }, // basic mode unlimited
  adBlocker: { locked: false, freeLimitPerDay: null }, // free = small list only
  routerDashboard: { locked: true },
  batteryOptimizer: { locked: false, freeLimitPerDay: null },
  appManager: { locked: false, freeLimitPerDay: null },
  storageAnalyzer: { locked: false, freeLimitPerDay: null },
  systemMonitor: { locked: false, freeLimitPerDay: null },
  appLock: { locked: false, freeMaxApps: 2 },
  clipboardCleaner: { locked: false, freeLimitPerDay: null },
  duplicateFinder: { locked: false, freeLimitPerDay: 1 },
  speedTest: { locked: false, freeLimitPerDay: null },
  wifiScanner: { locked: false, freeLimitPerDay: null },
  qrTool: { locked: false, freeLimitPerDay: null },
  fakeAppDetector: { locked: false, freeLimitPerDay: 1 },
  tvRemote: { locked: false, freeMaxDevices: 1 },
};

/**
 * usePlanLimit(featureKey)
 * ------------------------
 * Returns { isPremium, isLocked, rule } for a given feature key so any
 * screen/card can decide: show normal UI, show a soft limit warning, or
 * show a hard lock that routes to the Premium screen.
 *
 * `isLocked` = true means "premium only, free users cannot open this at all".
 * Per-use limits (like junkCleaner 1x/day) are checked at the point of use
 * inside each feature's own service, using `profile.usage`, not here.
 */
export function usePlanLimit(featureKey) {
  const { isPremium } = useAuth();
  const rule = FEATURE_LIMITS[featureKey];

  if (!rule) {
    return { isPremium, isLocked: false, rule: null };
  }

  const isLocked = !isPremium && rule.locked === true;

  return { isPremium, isLocked, rule };
}
