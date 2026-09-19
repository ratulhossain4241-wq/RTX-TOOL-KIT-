package expo.modules.rtxwifiscanner

import android.content.Context
import android.net.wifi.WifiManager
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * RtxWifiScannerModule
 * -----------------------
 * HONEST SCOPE / LIMITATIONS (real Android platform rules, not a bug):
 *  - Android REQUIRES a granted location permission (ACCESS_FINE_LOCATION)
 *    before any app can see nearby WiFi scan results - this is an Android
 *    OS privacy rule for every app, not specific to this one. The JS side
 *    must request that permission first (see wifiService.js).
 *  - Since Android 9 (API 28), the OS THROTTLES how often an app can
 *    trigger a new scan (about 4 scans per 2 minutes, foreground apps).
 *    Calling scan too often just returns the previous cached results.
 *  - This reads real signal strength (RSSI) and channel/frequency data -
 *    no fake numbers.
 */
class RtxWifiScannerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("RtxWifiScanner")

    AsyncFunction("scan") { promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.reject("NO_CONTEXT", "React context not available", null)
        return@AsyncFunction
      }

      val wifiManager = context.applicationContext
        .getSystemService(Context.WIFI_SERVICE) as WifiManager

      if (!wifiManager.isWifiEnabled) {
        promise.reject("WIFI_DISABLED", "WiFi বন্ধ আছে - প্রথমে WiFi চালু করুন।", null)
        return@AsyncFunction
      }

      // Trigger a scan (subject to Android's throttling, see class doc)
      wifiManager.startScan()

      val results = wifiManager.scanResults.map { result ->
        mapOf(
          "ssid" to (if (result.SSID.isNullOrEmpty()) "(Hidden Network)" else result.SSID),
          "bssid" to result.BSSID,
          "rssi" to result.level, // signal strength in dBm, real value
          "frequency" to result.frequency, // MHz
          "capabilities" to result.capabilities // e.g. security type info
        )
      }

      promise.resolve(results)
    }
  }
}
