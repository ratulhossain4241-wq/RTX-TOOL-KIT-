import { requireNativeModule } from 'expo-modules-core';

const RtxWifiScanner = requireNativeModule('RtxWifiScanner');

export type WifiNetwork = {
  ssid: string;
  bssid: string;
  rssi: number;
  frequency: number;
  capabilities: string;
};

export function scanWifiNetworks(): Promise<WifiNetwork[]> {
  return RtxWifiScanner.scan();
}

export default RtxWifiScanner;
