package expo.modules.rtxappmanager

import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

/**
 * RtxAppManagerModule
 * ---------------------
 * HONEST SCOPE:
 *  - getInstalledApps(): reads real installed-app data via PackageManager.
 *    Needs the QUERY_ALL_PACKAGES permission (declared in app.json) - Play
 *    Store restricts this permission, see docs/BARE_WORKFLOW_SETUP.md.
 *  - openAppInfo(packageName): opens Android's own "App Info" settings
 *    screen for that app, where the user can uninstall/force-stop/manage
 *    permissions themselves. No app on a non-rooted phone can silently
 *    uninstall another app or force-stop it in the background - that
 *    would be a serious security hole, so Android blocks it by design.
 */
class AppInfo : Record {
  @Field val packageName: String = ""
  @Field val appName: String = ""
  @Field val isSystemApp: Boolean = false
  @Field val versionName: String? = null
}

class RtxAppManagerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("RtxAppManager")

    Function("getInstalledApps") {
      val pm = appContext.reactContext?.packageManager
        ?: return@Function emptyList<Map<String, Any?>>()

      val packages = pm.getInstalledApplications(PackageManager.GET_META_DATA)

      packages.map { appInfo: ApplicationInfo ->
        val isSystem = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
        val versionName = try {
          pm.getPackageInfo(appInfo.packageName, 0).versionName
        } catch (e: Exception) {
          null
        }
        val installerPackageName = try {
          @Suppress("DEPRECATION")
          pm.getInstallerPackageName(appInfo.packageName)
        } catch (e: Exception) {
          null
        }

        mapOf(
          "packageName" to appInfo.packageName,
          "appName" to pm.getApplicationLabel(appInfo).toString(),
          "isSystemApp" to isSystem,
          "versionName" to versionName,
          "installerPackageName" to installerPackageName
        )
      }
    }

    Function("openAppInfo") { packageName: String ->
      val context = appContext.reactContext ?: return@Function
      val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
        data = Uri.fromParts("package", packageName, null)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
    }
  }
}
