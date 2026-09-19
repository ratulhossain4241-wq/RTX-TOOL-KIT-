/**
 * knownFakeApps.js
 * ------------------
 * HONEST SCOPE: this is a small, illustrative reference list mapping
 * well-known app NAMES to their real official Android package name.
 * It is NOT a comprehensive malware database (building/maintaining a
 * real one is a full-time security research job, not something a side
 * project can claim to do). It only catches ONE specific, common trick:
 * a clone app labeling itself "WhatsApp" or "Facebook" etc. while using
 * a completely different package name than the real app.
 *
 * Add more entries as needed - key = app display name (lowercase),
 * value = the real official package name.
 */
export const KNOWN_APP_PACKAGES = {
  whatsapp: 'com.whatsapp',
  facebook: 'com.facebook.katana',
  instagram: 'com.instagram.android',
  messenger: 'com.facebook.orca',
  telegram: 'org.telegram.messenger',
  'google chrome': 'com.android.chrome',
  chrome: 'com.android.chrome',
  youtube: 'com.google.android.youtube',
  gmail: 'com.google.android.gm',
  tiktok: 'com.zhiliaoapp.musically',
  bkash: 'com.bkash.customerapp',
  nagad: 'com.konasl.nagad',
};
