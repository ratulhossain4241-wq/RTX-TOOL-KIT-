/**
 * speedTestService.js
 * --------------------
 * Honest, real network measurement - no fake "1000 Mbps boost" claims.
 * Measures:
 *  - Ping: round-trip time to a small endpoint
 *  - Download: throughput while downloading a known-size test file
 *
 * IMPORTANT: replace TEST_FILE_URL with a file you control (e.g. a ~5MB
 * file hosted on your own server/Render/Firebase Storage) for reliable,
 * repeatable results. Third-party URLs can be slow/blocked/rate-limited.
 */
const PING_URL = 'https://www.google.com/generate_204'; // tiny, no-body response
const TEST_FILE_URL = 'https://speed.cloudflare.com/__down?bytes=5000000'; // ~5MB, replace if unreliable

export async function measurePing() {
  const start = Date.now();
  try {
    await fetch(PING_URL, { method: 'GET' });
    return Date.now() - start; // ms
  } catch (err) {
    throw new Error('Ping test ব্যর্থ হয়েছে - ইন্টারনেট চেক করুন।');
  }
}

export async function measureDownloadSpeed(onProgress) {
  const start = Date.now();
  try {
    const response = await fetch(TEST_FILE_URL);
    if (!response.ok) throw new Error('bad response');

    const reader = response.body?.getReader ? response.body.getReader() : null;
    let receivedBytes = 0;

    if (reader) {
      // Stream-read so we can report progress (works on web/newer RN)
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        receivedBytes += value.length;
        if (onProgress) onProgress(receivedBytes);
      }
    } else {
      // Fallback: no streaming support, just await the full blob
      const blob = await response.blob();
      receivedBytes = blob.size;
    }

    const durationSec = (Date.now() - start) / 1000;
    const mbps = (receivedBytes * 8) / durationSec / 1_000_000; // bytes -> bits -> Mbps
    return { mbps: Math.round(mbps * 10) / 10, bytes: receivedBytes, durationSec };
  } catch (err) {
    throw new Error('Download speed test ব্যর্থ হয়েছে - ইন্টারনেট চেক করুন।');
  }
}
