import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { FEATURE_LIMITS } from '../hooks/usePlanLimit';

/**
 * usageService.js
 * ----------------
 * Tracks per-day usage counts for free-plan limited features (junkCleaner,
 * duplicateFinder, fakeAppDetector, etc. - see FEATURE_LIMITS). Counts live
 * in Firestore (users/{uid}.usage), so limits survive app reinstalls and
 * can't be reset by clearing local app storage.
 */

function todayKey() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

/**
 * Checks whether the user can use a feature right now, WITHOUT recording
 * usage yet. Premium users always pass. Free users pass if under today's
 * limit for that feature (or if the feature has no daily limit at all).
 */
export function canUseToday(profile, isPremium, featureKey) {
  if (isPremium) return { allowed: true, remaining: null };

  const rule = FEATURE_LIMITS[featureKey];
  if (!rule || rule.freeLimitPerDay == null) return { allowed: true, remaining: null };

  const usage = profile?.usage || {};
  const usedToday = usage.date === todayKey() ? usage.counts?.[featureKey] || 0 : 0;
  const remaining = Math.max(0, rule.freeLimitPerDay - usedToday);

  return { allowed: remaining > 0, remaining, limit: rule.freeLimitPerDay };
}

/**
 * Records one use of a feature for today. Call this AFTER the action
 * actually succeeds (e.g. after cache is cleared), not before - so a
 * failed action doesn't burn the user's daily limit.
 */
export async function recordUsage(userId, featureKey) {
  const userRef = doc(db, 'users', userId);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userRef);
    const data = snap.exists() ? snap.data() : {};
    const usage = data.usage || {};
    const isNewDay = usage.date !== todayKey();

    const counts = isNewDay ? {} : { ...(usage.counts || {}) };
    counts[featureKey] = (counts[featureKey] || 0) + 1;

    transaction.set(
      userRef,
      { usage: { date: todayKey(), counts } },
      { merge: true }
    );
  });
}
