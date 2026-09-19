import { getInstalledApps } from '../../modules/rtx-app-manager';
import { KNOWN_APP_PACKAGES } from '../data/knownFakeApps';

/**
 * fakeAppDetectorService.js
 * ---------------------------
 * HONEST METHOD - two simple, real checks, clearly explained to the user
 * in the UI (not marketed as a full antivirus/malware scanner):
 *
 * 1. NAME/PACKAGE MISMATCH: app is labeled like a famous app (e.g.
 *    "WhatsApp") but its actual package name doesn't match the real
 *    official package - a common trick used by clone/fake apps.
 * 2. UNKNOWN INSTALL SOURCE: app was sideloaded (not installed through
 *    Google Play or another known app store) - not proof of anything
 *    malicious by itself (many legitimate apps are sideloaded too,
 *    including this one before Play Store release), but worth a look.
 */
export async function scanForSuspiciousApps() {
  const apps = await getInstalledApps();
  const flagged = [];

  for (const app of apps) {
    const reasons = [];
    const nameLower = app.appName.toLowerCase().trim();

    const expectedPackage = KNOWN_APP_PACKAGES[nameLower];
    if (expectedPackage && app.packageName !== expectedPackage) {
      reasons.push('নাম পরিচিত অ্যাপের মতো, কিন্তু আসল প্যাকেজের সাথে মিলছে না');
    }

    const knownInstallers = [
      'com.android.vending', // Google Play
      'com.sec.android.app.samsungapps',
      'com.amazon.venezia',
    ];
    if (!app.isSystemApp && app.installerPackageName && !knownInstallers.includes(app.installerPackageName)) {
      reasons.push(`অপরিচিত সোর্স থেকে ইনস্টল করা (${app.installerPackageName})`);
    }
    if (!app.isSystemApp && !app.installerPackageName) {
      reasons.push('সরাসরি APK ফাইল দিয়ে ইনস্টল করা (sideloaded)');
    }

    if (reasons.length > 0) {
      flagged.push({ ...app, reasons });
    }
  }

  return flagged;
}
