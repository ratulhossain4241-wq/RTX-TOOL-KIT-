import * as Device from 'expo-device';
import * as Application from 'expo-application';

/**
 * deviceService.js
 * ------------------
 * HONEST SCOPE: live per-app CPU% and RAM usage (like a real task manager)
 * needs Android's ActivityManager/UsageStatsManager via a native module -
 * not available in managed workflow. This shows real, useful STATIC device
 * info instead: total RAM, device model, OS version, app version - clearly
 * labeled as device info, not a live performance monitor.
 */
export async function getDeviceInfo() {
  return {
    modelName: Device.modelName,
    brand: Device.brand,
    osName: Device.osName,
    osVersion: Device.osVersion,
    totalMemoryBytes: Device.totalMemory, // may be null on some platforms
    appVersion: Application.nativeApplicationVersion,
    buildVersion: Application.nativeBuildVersion,
  };
}
