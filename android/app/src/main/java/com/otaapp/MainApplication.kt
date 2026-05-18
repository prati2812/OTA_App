package com.otaapp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    val bundleFile = java.io.File(applicationContext.filesDir, "latest.bundle")
    val validFile = java.io.File(applicationContext.filesDir, "latest.bundle.valid")
    
    val jsBundleFilePath = if (bundleFile.exists() && validFile.exists()) {
        android.util.Log.d("OTA", "Loading OTA bundle: ${bundleFile.absolutePath}")
        bundleFile.absolutePath
    } else {
        android.util.Log.d("OTA", "OTA bundle not found or invalid, falling back to APK bundle")
        null
    }

    getDefaultReactHost(
      applicationContext,
      PackageList(this).packages,
      jsBundleFilePath = jsBundleFilePath
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
