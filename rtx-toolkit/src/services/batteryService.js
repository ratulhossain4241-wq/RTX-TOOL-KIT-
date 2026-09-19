import * as Battery from 'expo-battery';

/**
 * batteryService.js
 * -------------------
 * HONEST SCOPE: reads real battery level/state (expo-battery). It CANNOT
 * force-close background apps or restrict their battery usage - that
 * needs Android's UsageStatsManager / battery-optimization APIs via a
 * native module, not available in managed workflow. What's shown here is
 * accurate device state + generic, genuinely useful battery-saving tips.
 */

export async function getBatteryInfo() {
  const level = await Battery.getBatteryLevelAsync(); // 0..1
  const state = await Battery.getBatteryStateAsync(); // UNKNOWN, UNPLUGGED, CHARGING, FULL
  const lowPowerMode = await Battery.isLowPowerModeEnabledAsync().catch(() => false);

  return {
    percent: Math.round(level * 100),
    state,
    lowPowerMode,
  };
}

export function getBatteryTips(info) {
  const tips = [];
  if (info.percent <= 20 && info.state !== Battery.BatteryState.CHARGING) {
    tips.push('ব্যাটারি কম - স্ক্রিন ব্রাইটনেস কমান এবং অপ্রয়োজনীয় অ্যাপ বন্ধ করুন।');
  }
  if (!info.lowPowerMode) {
    tips.push('ফোনের সেটিংস থেকে Battery Saver / Low Power Mode চালু করলে চার্জ বেশি সময় থাকবে।');
  }
  tips.push('স্ক্রিন টাইমআউট কম রাখুন (যেমন ১৫-৩০ সেকেন্ড)।');
  tips.push('ব্যবহার না করা সময় WiFi/Bluetooth/Location বন্ধ রাখুন।');
  tips.push('ব্যাকগ্রাউন্ড App Refresh বন্ধ রাখলে ব্যাটারি বাঁচে।');
  return tips;
}
