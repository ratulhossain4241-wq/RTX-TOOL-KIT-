package expo.modules.rtxadblocker

import android.content.Intent
import android.net.VpnService
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * RtxAdBlockerModule
 * ---------------------
 * Bridges the JS side to RtxAdBlockVpnService (see that file for the full
 * honest scope/limitations of what this ad blocker actually does).
 *
 * PERMISSION FLOW NOTE: Android requires explicit, per-install user
 * consent for any app to start a local VPN (a system dialog: "RTX TOOL
 * KIT wants to set up a VPN connection..."). This module triggers that
 * system dialog via VpnService.prepare(), but does NOT capture its result
 * automatically (that needs deeper Activity Result API wiring). Practical
 * flow for the JS side: call start() - if it rejects with code
 * "PERMISSION_NEEDED", the system dialog has been shown; after the user
 * taps "OK" there, call start() again and it will succeed.
 */
class RtxAdBlockerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("RtxAdBlocker")

    AsyncFunction("start") { domains: List<String>, promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.reject("NO_CONTEXT", "React context not available", null)
        return@AsyncFunction
      }

      val prepareIntent = VpnService.prepare(context)
      if (prepareIntent != null) {
        // User has not yet granted VPN permission - show the system dialog
        prepareIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(prepareIntent)
        promise.reject(
          "PERMISSION_NEEDED",
          "VPN পারমিশন দরকার - সিস্টেম ডায়ালগে অনুমতি দিয়ে আবার Start চাপুন।",
          null
        )
        return@AsyncFunction
      }

      RtxAdBlockVpnService.blockedDomains = domains.toSet()
      val serviceIntent = Intent(context, RtxAdBlockVpnService::class.java)
      context.startService(serviceIntent)
      promise.resolve(true)
    }

    Function("stop") {
      val context = appContext.reactContext ?: return@Function
      context.stopService(Intent(context, RtxAdBlockVpnService::class.java))
      Unit
    }

    Function("isActive") {
      RtxAdBlockVpnService.isRunning
    }

    Function("updateBlockedDomains") { domains: List<String> ->
      RtxAdBlockVpnService.blockedDomains = domains.toSet()
    }
  }
}
