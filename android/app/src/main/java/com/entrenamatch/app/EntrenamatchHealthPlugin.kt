package com.entrenamatch.app

import android.content.Intent
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import androidx.health.connect.client.HealthConnectClient
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

/** Opens Health Connect UI and probes day activity without slow per-workout JS reads. */
@CapacitorPlugin(name = "EntrenamatchHealth")
class EntrenamatchHealthPlugin : Plugin() {

    private val pluginScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        pluginScope.cancel()
    }

    @PluginMethod
    fun hasGrantedHealthPermissions(call: PluginCall) {
        val steps = isGranted(PERM_STEPS)
        val exercise = isGranted(PERM_EXERCISE)
        val calories = isGranted(PERM_ACTIVE_CALORIES)
        val totalCalories = isGranted(PERM_TOTAL_CALORIES)
        val heartRate = isGranted(PERM_HEART_RATE)
        val canReadActivity = exercise || steps || calories || totalCalories

        val ret = JSObject()
        ret.put("granted", canReadActivity)
        ret.put("canReadActivity", canReadActivity)
        ret.put("steps", steps)
        ret.put("exercise", exercise)
        ret.put("calories", calories)
        ret.put("totalCalories", totalCalories)
        ret.put("heartRate", heartRate)
        call.resolve(ret)
    }

    @PluginMethod
    fun probeWearableDay(call: PluginCall) {
        val startDate = call.getString("startDate")
        val endDate = call.getString("endDate")
        if (startDate.isNullOrBlank() || endDate.isNullOrBlank()) {
            call.reject("startDate and endDate are required")
            return
        }

        pluginScope.launch {
            val status = HealthConnectClient.getSdkStatus(context)
            if (status != HealthConnectClient.SDK_AVAILABLE) {
                call.reject(healthConnectUnavailableReason(status))
                return@launch
            }

            try {
                val client = HealthConnectClient.getOrCreate(context)
                val result = WearableDayProbe.probe(client, startDate, endDate)
                call.resolve(result)
            } catch (e: Exception) {
                call.reject("probeWearableDay failed: ${e.message}", e)
            }
        }
    }

    @PluginMethod
    fun openHealthConnectSettings(call: PluginCall) {
        launch(call, Intent("androidx.health.ACTION_HEALTH_CONNECT_SETTINGS"))
    }

    @PluginMethod
    fun openAppHealthPermissions(call: PluginCall) {
        val intent = Intent("android.intent.action.VIEW_PERMISSION_USAGE")
        intent.addCategory("android.intent.category.HEALTH_PERMISSIONS")
        intent.putExtra(Intent.EXTRA_PACKAGE_NAME, context.packageName)
        launch(call, intent)
    }

    private fun launch(call: PluginCall, intent: Intent) {
        val activity = activity
        if (activity == null) {
            call.reject("No activity available")
            return
        }
        try {
            activity.startActivity(intent)
            call.resolve()
        } catch (e: Exception) {
            call.reject("Failed to open Health Connect: ${e.message}", e)
        }
    }

    private fun isGranted(permission: String): Boolean {
        return ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
    }

    private fun healthConnectUnavailableReason(status: Int): String {
        return when (status) {
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED ->
                "Health Connect needs an update."
            HealthConnectClient.SDK_UNAVAILABLE ->
                "Health Connect is unavailable on this device."
            else -> "Health Connect status: $status"
        }
    }

    companion object {
        private const val PERM_STEPS = "android.permission.health.READ_STEPS"
        private const val PERM_EXERCISE = "android.permission.health.READ_EXERCISE"
        private const val PERM_ACTIVE_CALORIES = "android.permission.health.READ_ACTIVE_CALORIES_BURNED"
        private const val PERM_TOTAL_CALORIES = "android.permission.health.READ_TOTAL_CALORIES_BURNED"
        private const val PERM_HEART_RATE = "android.permission.health.READ_HEART_RATE"
    }
}
