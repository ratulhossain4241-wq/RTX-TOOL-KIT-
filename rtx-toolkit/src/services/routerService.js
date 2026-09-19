import tplinkDriver from './router/tplinkDriver';
import { RouterError, ROUTER_ERROR } from './router/routerDriverBase';

/**
 * routerService.js
 * ------------------
 * Picks the right brand driver and exposes one clean API to the UI.
 * Only TP-Link is wired up right now - see BRAND_DRIVERS below to add
 * D-Link/Tenda/etc. later (each needs its own driver file, following
 * routerDriverBase.js's contract).
 */
const BRAND_DRIVERS = {
  tplink: tplinkDriver,
  // dlink: dlinkDriver,   // add when built
  // tenda: tendaDriver,   // add when built
};

export const SUPPORTED_BRANDS = [{ key: 'tplink', label: 'TP-Link' }];

export function isBrandSupported(brandKey) {
  return !!BRAND_DRIVERS[brandKey];
}

export async function loginToRouter(brandKey, ip, username, password) {
  const driver = BRAND_DRIVERS[brandKey];
  if (!driver) throw new RouterError(ROUTER_ERROR.UNSUPPORTED_FIRMWARE, 'এই ব্র্যান্ড এখনো সাপোর্টেড না।');
  return driver.login(ip, username, password);
}

export async function getRouterDevices(brandKey, ip, session) {
  const driver = BRAND_DRIVERS[brandKey];
  return driver.getDevices(ip, session);
}

export async function toggleDeviceBlock(brandKey, ip, session, mac, currentlyBlocked) {
  const driver = BRAND_DRIVERS[brandKey];
  if (currentlyBlocked) {
    await driver.unblockDevice(ip, session, mac);
  } else {
    await driver.blockDevice(ip, session, mac);
  }
}

export { RouterError, ROUTER_ERROR };
