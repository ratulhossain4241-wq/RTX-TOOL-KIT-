import { RouterError, ROUTER_ERROR } from './routerDriverBase';

/**
 * tplinkDriver.js
 * -----------------
 * Best-effort driver for CLASSIC TP-Link routers (the older cgi-bin /
 * userRpm style admin panel - common on budget Archer/TL-WR models).
 *
 * ⚠️ ADJUST BEFORE RELYING ON THIS: the exact URL paths and HTML structure
 * below are TP-Link's traditional pattern, but firmware versions differ.
 * To confirm/fix the paths for YOUR router:
 *   1. Open the router's admin panel in a desktop browser
 *   2. Open DevTools (F12) -> Network tab
 *   3. Log in normally, then click "Block" on a device manually
 *   4. Look at the request that fires - copy its exact URL + form fields
 *      and update BLOCK_PATH / the body below to match
 * Newer TP-Link routers (Archer AX series, Deco mesh) use a JSON API
 * called JNAP instead of this HTML style - those need a separate driver.
 */

const LOGIN_PATH = '/userRpm/LoginRpm.htm';
const DEVICE_LIST_PATH = '/userRpm/AssignedIpAddrListRpm.htm';
const ACCESS_CONTROL_PATH = '/userRpm/MacFilterListRpm.htm'; // ADJUST if different on your model

async function login(ip, username, password) {
  try {
    // Classic TP-Link panels commonly use HTTP Basic Auth on top of a
    // simple login form. We build the Basic Auth header and verify it
    // works by requesting a page that requires auth.
    const token = btoa(`${username}:${password}`);
    const response = await fetch(`http://${ip}${LOGIN_PATH}`, {
      headers: { Authorization: `Basic ${token}` },
    });

    if (response.status === 401) {
      throw new RouterError(ROUTER_ERROR.LOGIN_FAILED, 'ভুল ইউজারনেম/পাসওয়ার্ড।');
    }
    if (!response.ok) {
      throw new RouterError(ROUTER_ERROR.UNSUPPORTED_FIRMWARE, 'এই রাউটারের ফার্মওয়্যার সাপোর্টেড না।');
    }

    // Session = the Basic Auth header itself, reused on every later call
    return token;
  } catch (err) {
    if (err instanceof RouterError) throw err;
    throw new RouterError(ROUTER_ERROR.UNREACHABLE, 'রাউটারে কানেক্ট করা যায়নি - IP/নেটওয়ার্ক চেক করুন।');
  }
}

async function authedFetch(ip, session, path, options = {}) {
  return fetch(`http://${ip}${path}`, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Basic ${session}` },
  });
}

async function getDevices(ip, session) {
  const response = await authedFetch(ip, session, DEVICE_LIST_PATH);
  const html = await response.text();

  // Classic TP-Link pages embed device data in a JS array like:
  // var DHCPDynList = new Array(
  //   new DHCPDynItem("Phone-123", "AA:BB:CC:DD:EE:FF", "192.168.1.5", ...),
  // );
  // This regex extracts name/mac/ip triples - ADJUST the pattern if your
  // router's page source looks different (view-source: the page to check).
  const deviceRegex = /new DHCPDynItem\("([^"]*)",\s*"([0-9A-Fa-f:]{17})",\s*"([\d.]+)"/g;
  const devices = [];
  let match;
  while ((match = deviceRegex.exec(html)) !== null) {
    devices.push({
      name: match[1] || 'Unknown Device',
      mac: match[2],
      ip: match[3],
      blocked: false, // block status usually needs a second page - see getBlockedMacs below
    });
  }

  const blockedMacs = await getBlockedMacs(ip, session);
  return devices.map((d) => ({ ...d, blocked: blockedMacs.includes(d.mac.toUpperCase()) }));
}

async function getBlockedMacs(ip, session) {
  try {
    const response = await authedFetch(ip, session, ACCESS_CONTROL_PATH);
    const html = await response.text();
    const macRegex = /([0-9A-Fa-f]{2}(:[0-9A-Fa-f]{2}){5})/g;
    return (html.match(macRegex) || []).map((m) => m.toUpperCase());
  } catch {
    return []; // if this page differs on your model, block-status just won't show - device list still works
  }
}

async function blockDevice(ip, session, mac) {
  // ADJUST: exact field names TP-Link expects for adding a MAC filter rule.
  // Captured from DevTools as described in the file header comment.
  const body = new URLSearchParams({
    mac: mac,
    enable: '1',
    action: 'add',
  }).toString();

  const response = await authedFetch(ip, session, ACCESS_CONTROL_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new RouterError(ROUTER_ERROR.UNSUPPORTED_FIRMWARE, 'ব্লক করা যায়নি - এই মডেলের জন্য endpoint আলাদা হতে পারে।');
  }
}

async function unblockDevice(ip, session, mac) {
  const body = new URLSearchParams({
    mac: mac,
    action: 'remove',
  }).toString();

  const response = await authedFetch(ip, session, ACCESS_CONTROL_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new RouterError(ROUTER_ERROR.UNSUPPORTED_FIRMWARE, 'আনব্লক করা যায়নি - এই মডেলের জন্য endpoint আলাদা হতে পারে।');
  }
}

export default { login, getDevices, blockDevice, unblockDevice };
