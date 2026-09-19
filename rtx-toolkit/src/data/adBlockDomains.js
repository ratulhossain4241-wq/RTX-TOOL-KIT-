/**
 * adBlockDomains.js
 * -------------------
 * HONEST SCOPE: a small, illustrative starter list of well-known ad/
 * tracker domains - NOT a comprehensive, constantly-updated blocklist
 * (real projects like StevenBlack/hosts maintain those full-time). Good
 * enough to demonstrate and meaningfully reduce ads/trackers; expand this
 * list over time, or fetch a bigger list from a URL you control for
 * premium users.
 *
 * Free plan: FREE_BLOCKLIST only (a small sample).
 * Premium: FULL_BLOCKLIST (this whole file).
 */
export const FREE_BLOCKLIST = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'adservice.google.com',
];

export const FULL_BLOCKLIST = [
  ...FREE_BLOCKLIST,
  'ads.yahoo.com',
  'adnxs.com',
  'adsrvr.org',
  'amazon-adsystem.com',
  'bing.com/ads',
  'criteo.com',
  'facebook.com/tr',
  'graph.facebook.com/adnw_sync2',
  'moatads.com',
  'mopub.com',
  'outbrain.com',
  'pagead2.googlesyndication.com',
  'pubmatic.com',
  'rubiconproject.com',
  'scorecardresearch.com',
  'taboola.com',
  'unityads.unity3d.com',
  'vungle.com',
];

export function getBlocklistForPlan(isPremium) {
  return isPremium ? FULL_BLOCKLIST : FREE_BLOCKLIST;
}
