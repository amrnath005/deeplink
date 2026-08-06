package com.deeplinkpro.sdk

import android.content.Context
import android.os.Build
import android.util.DisplayMetrics
import android.util.Log
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale
import java.util.TimeZone
import kotlin.concurrent.thread

/**
 * DeepLink Pro Native Android SDK for Deferred Deep Linking & Mobile Measurement (MMP)
 */
class DeepLinkSDK private constructor() {

    private var apiKey: String? = null
    private var serverUrl: String = "http://localhost:8000"

    companion object {
        val instance = DeepLinkSDK()
        private const val TAG = "DeepLinkSDK"
    }

    fun configure(apiKey: String, serverUrl: String = "http://localhost:8000") {
        this.apiKey = apiKey
        this.serverUrl = serverUrl
    }

    fun checkDeferredDeepLink(context: Context, callback: (JSONObject?) -> Unit) {
        thread {
            try {
                val fingerprint = collectDeviceFingerprint(context)
                val url = URL("$serverUrl/api/v1/r/deferred-match")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.setRequestProperty("Authorization", "Bearer $apiKey")
                conn.doOutput = true

                conn.outputStream.use { os ->
                    os.write(fingerprint.toString().toByteArray())
                }

                if (conn.responseCode == 200) {
                    val responseText = conn.inputStream.bufferedReader().use { it.readText() }
                    val json = JSONObject(responseText)
                    Log.d(TAG, "Deferred Deep Link Match: $json")
                    callback(json)
                } else {
                    callback(null)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Deferred link check failed", e)
                callback(null)
            }
        }
    }

    private fun collectDeviceFingerprint(context: Context): JSONObject {
        val dm: DisplayMetrics = context.resources.displayMetrics
        val json = JSONObject()
        json.put("os", "Android")
        json.put("os_version", Build.VERSION.RELEASE)
        json.put("device_brand", Build.BRAND)
        json.put("device_model", Build.MODEL)
        json.put("screen_size", "${dm.widthPixels}x${dm.heightPixels}")
        json.put("timezone", TimeZone.getDefault().id)
        json.put("language", Locale.getDefault().toString())
        json.put("timestamp", System.currentTimeMillis() / 1000)
        return json
    }
}
