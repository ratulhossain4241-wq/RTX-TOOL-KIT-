import { requireNativeModule } from 'expo-modules-core';

const RtxTvRemote = requireNativeModule('RtxTvRemote');

export type TvDevice = {
  name: string;
  host: string;
  port: number;
};

export function discoverTvDevices(timeoutMs: number = 5000): Promise<TvDevice[]> {
  return RtxTvRemote.discoverDevices(timeoutMs);
}

// NOT YET FUNCTIONAL - see RtxTvRemoteModule.kt for why. Calling this will
// reject with code 'NOT_IMPLEMENTED' until the pairing protocol is built.
export function pairWithDevice(host: string, port: number): Promise<boolean> {
  return RtxTvRemote.pairWithDevice(host, port);
}

// NOT YET FUNCTIONAL - depends on pairWithDevice() above being implemented.
export function sendKeyEvent(keyCode: string): void {
  RtxTvRemote.sendKeyEvent(keyCode);
}

export default RtxTvRemote;
