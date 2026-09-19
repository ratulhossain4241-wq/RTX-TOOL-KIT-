import * as FileSystem from 'expo-file-system';

/**
 * storageService.js
 * ------------------
 * HONEST SCOPE: Expo's managed workflow can only see storage inside this
 * app's own sandbox (cacheDirectory + documentDirectory) - it cannot read
 * total phone storage, other apps' data, or the photo gallery. That needs
 * a native module (a future "eject to bare workflow" step). This service
 * is real and useful for what it covers: the app's own cache/junk data.
 */

async function getDirSize(uri) {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) return 0;
  if (!info.isDirectory) return info.size || 0;

  const items = await FileSystem.readDirectoryAsync(uri);
  let total = 0;
  for (const item of items) {
    total += await getDirSize(`${uri}${item}`.endsWith('/') ? `${uri}${item}` : `${uri}/${item}`);
  }
  return total;
}

export async function getAppStorageBreakdown() {
  const cacheBytes = await getDirSize(FileSystem.cacheDirectory);
  const docBytes = await getDirSize(FileSystem.documentDirectory);

  return {
    cacheBytes,
    docBytes,
    totalBytes: cacheBytes + docBytes,
  };
}

export async function clearAppCache() {
  const cacheDir = FileSystem.cacheDirectory;
  const info = await FileSystem.getInfoAsync(cacheDir);
  if (!info.exists) return 0;

  const before = await getDirSize(cacheDir);
  const items = await FileSystem.readDirectoryAsync(cacheDir);
  for (const item of items) {
    await FileSystem.deleteAsync(`${cacheDir}${item}`, { idempotent: true });
  }
  return before; // bytes freed
}

export function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
