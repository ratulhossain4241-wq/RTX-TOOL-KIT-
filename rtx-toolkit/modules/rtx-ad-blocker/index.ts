import { requireNativeModule } from 'expo-modules-core';

const RtxAdBlocker = requireNativeModule('RtxAdBlocker');

/**
 * start(domains) resolves true on success, or REJECTS with
 * code 'PERMISSION_NEEDED' the first time (Android shows its VPN consent
 * dialog) - call start() again after the user approves it.
 */
export function startAdBlocking(domains: string[]): Promise<boolean> {
  return RtxAdBlocker.start(domains);
}

export function stopAdBlocking(): void {
  RtxAdBlocker.stop();
}

export function isAdBlockingActive(): boolean {
  return RtxAdBlocker.isActive();
}

export function updateBlockedDomains(domains: string[]): void {
  RtxAdBlocker.updateBlockedDomains(domains);
}

export default RtxAdBlocker;
