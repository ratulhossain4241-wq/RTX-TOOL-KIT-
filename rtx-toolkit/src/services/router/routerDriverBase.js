/**
 * routerDriverBase.js
 * ---------------------
 * Every router-brand driver (tplinkDriver.js, dlinkDriver.js, ...) must
 * implement this same shape, so routerService.js and the UI never need to
 * know which brand is actually connected.
 *
 * IMPORTANT HONESTY NOTE: unlike the app's other features, a router driver
 * genuinely CANNOT be guaranteed to work on every firmware version out of
 * the box - TP-Link alone has at least 3 different admin-panel protocols
 * across its product lines (classic cgi-bin routers, newer JNAP/JSON API
 * routers like Archer AX series, and Deco mesh which uses a different
 * encrypted API entirely). This base + the TP-Link driver give you a
 * working starting point for the MOST COMMON classic TP-Link panel, with
 * clear notes on how to adapt it if your specific router responds
 * differently. Test against your own router and adjust field/URL names
 * using your browser's Network tab (F12 -> Network) while manually
 * clicking Block in the router's own web admin page.
 *
 * @typedef {Object} RouterDevice
 * @property {string} mac
 * @property {string} name
 * @property {string} ip
 * @property {boolean} blocked
 *
 * @typedef {Object} RouterDriver
 * @property {(ip: string, username: string, password: string) => Promise<string>} login
 *   Returns a session token/cookie string to reuse in later calls.
 * @property {(ip: string, session: string) => Promise<RouterDevice[]>} getDevices
 * @property {(ip: string, session: string, mac: string) => Promise<void>} blockDevice
 * @property {(ip: string, session: string, mac: string) => Promise<void>} unblockDevice
 */

export const ROUTER_ERROR = {
  LOGIN_FAILED: 'LOGIN_FAILED',
  UNREACHABLE: 'UNREACHABLE',
  UNSUPPORTED_FIRMWARE: 'UNSUPPORTED_FIRMWARE',
};

export class RouterError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
    }
