import { requireNativeModule } from 'expo-modules-core';

/**
 * index.ts - JS bridge for the RtxAppManager native module.
 * Import this from src/services/appManagerService.js instead of calling
 * requireNativeModule directly anywhere else in the app.
 */
const RtxAppManager = requireNativeModule('RtxAppManager');

export type AppInfo = {
  packageName: string;
  appName: string;
  isSystemApp: boolean;
  versionName: string | null;
  installerPackageName: string | null;
};

export function getInstalledApps(): Promise<AppInfo[]> {
  return RtxAppManager.getInstalledApps();
}

export function openAppInfo(packageName: string): void {
  RtxAppManager.openAppInfo(packageName);
}

export default RtxAppManager;
