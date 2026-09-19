import * as SecureStore from 'expo-secure-store';

/**
 * appLockService.js
 * -------------------
 * HONEST SCOPE: locking OTHER apps (WhatsApp, Facebook, etc.) requires
 * Android's Accessibility Service, which needs a native module (bare
 * workflow) - not available yet in this managed-workflow build. What this
 * DOES do right now: protects sensitive screens INSIDE RTX Tool Kit itself
 * (e.g. Router Dashboard, Payment history) behind a PIN, stored securely
 * on-device via the OS keychain/keystore (expo-secure-store) - never sent
 * to Firebase, never leaves the device.
 */

const PIN_KEY = 'rtx_app_lock_pin';

export async function hasPinSet() {
  const pin = await SecureStore.getItemAsync(PIN_KEY);
  return !!pin;
}

export async function setPin(pin) {
  if (!/^\d{4,6}$/.test(pin)) {
    throw new Error('PIN অবশ্যই ৪-৬ ডিজিটের সংখ্যা হতে হবে।');
  }
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

export async function verifyPin(pin) {
  const stored = await SecureStore.getItemAsync(PIN_KEY);
  return stored === pin;
}

export async function removePin() {
  await SecureStore.deleteItemAsync(PIN_KEY);
}
