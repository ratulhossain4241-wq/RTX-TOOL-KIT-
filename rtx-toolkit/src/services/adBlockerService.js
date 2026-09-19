import { startAdBlocking, stopAdBlocking, isAdBlockingActive } from '../../modules/rtx-ad-blocker';
import { getBlocklistForPlan } from '../data/adBlockDomains';

/**
 * adBlockerService.js
 * ----------------------
 * Thin wrapper so the screen doesn't need to know about the
 * 'PERMISSION_NEEDED' retry dance directly - toggleAdBlocking() handles
 * calling start() twice if needed (once to trigger the system VPN consent
 * dialog, once after the user approves it) and returns a simple result
 * object instead of throwing raw native errors.
 */
export async function enableAdBlocking(isPremium) {
  const domains = getBlocklistForPlan(isPremium);
  try {
    await startAdBlocking(domains);
    return { success: true };
  } catch (err) {
    if (err.code === 'PERMISSION_NEEDED') {
      return { success: false, needsPermission: true };
    }
    return { success: false, error: err.message || 'শুরু করা যায়নি।' };
  }
}

export function disableAdBlocking() {
  stopAdBlocking();
}

export function getAdBlockingStatus() {
  try {
    return isAdBlockingActive();
  } catch {
    return false;
  }
}
