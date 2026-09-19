import * as MediaLibrary from 'expo-media-library';

/**
 * duplicateFinderService.js
 * ----------------------------
 * HONEST METHOD: groups photos by exact file size as a "likely duplicate"
 * signal (same size almost always means the same file, e.g. saved twice
 * from WhatsApp). This is NOT pixel-by-pixel image comparison - two
 * different photos that happen to be the exact same byte size would be
 * (very rarely) grouped together too. Always shown to the user for
 * confirmation before deleting anything; nothing is auto-deleted.
 */

export async function requestMediaPermission() {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}

export async function findDuplicatePhotos() {
  const albumAssets = await MediaLibrary.getAssetsAsync({
    mediaType: 'photo',
    first: 500, // cap the scan so it stays fast; increase if needed
  });

  const bySize = {};
  for (const asset of albumAssets.assets) {
    const info = await MediaLibrary.getAssetInfoAsync(asset);
    const size = info.fileSize || 0;
    if (!size) continue;
    if (!bySize[size]) bySize[size] = [];
    bySize[size].push({ id: asset.id, uri: asset.uri, filename: asset.filename, size });
  }

  // Only keep groups with more than one photo - those are the "duplicates"
  const groups = Object.values(bySize).filter((group) => group.length > 1);
  return groups;
}

export async function deleteAssets(assetIds) {
  const success = await MediaLibrary.deleteAssetsAsync(assetIds);
  return success;
}
