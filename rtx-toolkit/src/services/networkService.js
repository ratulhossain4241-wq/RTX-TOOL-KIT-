import * as Network from 'expo-network';

/**
 * networkService.js
 * -------------------
 * HONEST SCOPE: reads current network status (type, IP, connectivity).
 * It cannot change system DNS, toggle airplane mode, or bypass carrier
 * speed limits - no app on a non-rooted phone can do that. What this
 * *can* do: tell the user useful, accurate facts about their connection
 * and point them to real fixes (switch to WiFi, move closer to router).
 */

export async function getNetworkInfo() {
  const state = await Network.getNetworkStateAsync();
  const ip = await Network.getIpAddressAsync().catch(() => null);

  return {
    type: state.type, // 'WIFI' | 'CELLULAR' | 'NONE' | ...
    isConnected: state.isConnected,
    isInternetReachable: state.isInternetReachable,
    ip,
  };
}

// Simple, honest tips based on connection type - not fake "boost" claims
export function getOptimizationTips(networkInfo) {
  const tips = [];

  if (!networkInfo.isConnected) {
    tips.push('আপনার ডিভাইস কোনো নেটওয়ার্কে কানেক্টেড নেই।');
    return tips;
  }

  if (networkInfo.type === 'CELLULAR') {
    tips.push('সম্ভব হলে WiFi এ কানেক্ট করুন - সাধারণত বেশি স্ট্যাবল ও দ্রুত।');
  }
  if (networkInfo.type === 'WIFI') {
    tips.push('রাউটারের কাছাকাছি থাকলে সিগন্যাল ও স্পিড দুটোই ভালো থাকে।');
  }
  tips.push('ব্যাকগ্রাউন্ডে চলা ভারী অ্যাপ (ভিডিও/ডাউনলোড) বন্ধ রাখলে বাকি অ্যাপগুলো দ্রুত চলবে।');
  tips.push('একসাথে অনেক ডিভাইস একই WiFi ব্যবহার করলে প্রতিটা ডিভাইসের ভাগে স্পিড কমে যায়।');

  return tips;
}
