import * as Clipboard from 'expo-clipboard';

/**
 * clipboardService.js
 * --------------------
 * HONEST SCOPE: a mobile app (with no special OS-level clipboard-history
 * permission, which Android/iOS do not grant to third-party apps) can only
 * see the CURRENT clipboard content, not a history of everything ever
 * copied. This clears the current clipboard entry only.
 */

export async function getClipboardPreview() {
  const hasContent = await Clipboard.hasStringAsync();
  if (!hasContent) return null;
  const text = await Clipboard.getStringAsync();
  return text;
}

export async function clearClipboard() {
  await Clipboard.setStringAsync('');
  }
