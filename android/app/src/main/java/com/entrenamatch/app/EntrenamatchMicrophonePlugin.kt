package com.entrenamatch.app

import android.Manifest
import android.content.Intent
import android.media.MediaRecorder
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Base64
import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.PermissionState
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import java.io.File

/** Runtime RECORD_AUDIO + native AAC capture for workout voice dictation on Android WebView. */
@CapacitorPlugin(
    name = "EntrenamatchMicrophone",
    permissions = [
        Permission(
            strings = [Manifest.permission.RECORD_AUDIO],
            alias = "microphone",
        ),
    ],
)
class EntrenamatchMicrophonePlugin : Plugin() {

    private var recorder: MediaRecorder? = null
    private var outputFile: File? = null
    private var recordingStartedAt: Long = 0L
    private var outputMimeType: String = "audio/mp4"

    private val mainHandler = Handler(Looper.getMainLooper())
    private var speechRecognizer: SpeechRecognizer? = null
    private var speechTranscriptParts = mutableListOf<String>()
    private var speechPartialText = ""
    private var speechListening = false
    private var stopSpeechCall: PluginCall? = null
    private var pendingSpeechStartCall: PluginCall? = null
    private var speechLanguageIndex = 0
    private val speechLanguages = listOf("es", "es-CL", "es-ES")

    @PluginMethod
    fun startSpeechRecognition(call: PluginCall) {
        if (speechListening) {
            if (speechRecognizer != null) {
                call.reject("Speech recognition already active")
                return
            }
            // Stale flag from a crashed/cancelled session — allow a fresh start.
            speechListening = false
            stopSpeechCall = null
        }
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            pendingSpeechStartCall = call
            requestPermissionForAlias("microphone", call, "startSpeechAfterPerm")
            return
        }
        startSpeechInternal(call)
    }

    @PermissionCallback
    private fun startSpeechAfterPerm(call: PluginCall) {
        val pending = pendingSpeechStartCall ?: call
        pendingSpeechStartCall = null
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            pending.reject("Microphone permission denied")
            return
        }
        startSpeechInternal(pending)
    }

    @PluginMethod
    fun stopSpeechRecognition(call: PluginCall) {
        if (!speechListening && speechRecognizer == null) {
            call.reject("No active speech recognition")
            return
        }
        stopSpeechCall = call
        mainHandler.post {
            try {
                speechRecognizer?.stopListening()
            } catch (e: Exception) {
                Log.w(TAG, "stopSpeechRecognition", e)
                resolveStopSpeechCall()
            }
        }
        mainHandler.postDelayed({ resolveStopSpeechCallIfPending() }, 2500)
    }

    @PluginMethod
    fun releaseMic(call: PluginCall) {
        releaseMicInternal()
        call.resolve()
    }

    @PluginMethod
    fun cancelSpeechRecognition(call: PluginCall) {
        releaseMicInternal(keepTranscript = true)
        call.resolve()
    }

    @PluginMethod
    fun getSpeechTranscript(call: PluginCall) {
        val ret = JSObject()
        ret.put("transcript", buildDisplayTranscript())
        ret.put("listening", speechListening)
        call.resolve(ret)
    }

    @PluginMethod
    fun checkPermission(call: PluginCall) {
        call.resolve(permissionResult())
    }

    @PluginMethod
    fun requestPermission(call: PluginCall) {
        if (getPermissionState("microphone") == PermissionState.GRANTED) {
            call.resolve(permissionResult())
            return
        }
        requestPermissionForAlias("microphone", call, "permCallback")
    }

    @PermissionCallback
    private fun permCallback(call: PluginCall) {
        call.resolve(permissionResult())
    }

    @PluginMethod
    fun openAppSettings(call: PluginCall) {
        val activity = activity
        if (activity == null) {
            call.reject("No activity available")
            return
        }
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
            intent.data = Uri.parse("package:${context.packageName}")
            activity.startActivity(intent)
            call.resolve()
        } catch (e: Exception) {
            call.reject("Failed to open settings: ${e.message}", e)
        }
    }

    @PluginMethod
    fun startRecording(call: PluginCall) {
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            requestPermissionForAlias("microphone", call, "startRecordingAfterPerm")
            return
        }
        startRecordingInternal(call)
    }

    @PermissionCallback
    private fun startRecordingAfterPerm(call: PluginCall) {
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            call.reject("Microphone permission denied")
            return
        }
        startRecordingInternal(call)
    }

    @PluginMethod
    fun stopRecording(call: PluginCall) {
        if (recorder == null) {
            call.reject("No active recording")
            return
        }
        stopRecordingInternal(call)
    }

    @PluginMethod
    fun isRecording(call: PluginCall) {
        val active = recorder != null
        call.resolve(JSObject().put("recording", active))
    }

    override fun handleOnDestroy() {
        releaseSpeechRecognizer()
        releaseRecorder(deleteFile = true)
        super.handleOnDestroy()
    }

    private fun startSpeechInternal(call: PluginCall) {
        if (!SpeechRecognizer.isRecognitionAvailable(context)) {
            call.reject("Speech recognition not available on this device")
            return
        }
        releaseMicInternal(keepTranscript = true)
        speechTranscriptParts.clear()
        speechPartialText = ""
        speechLanguageIndex = 0
        speechListening = true

        mainHandler.post {
            try {
                val appContext = context.applicationContext
                val recognizer = SpeechRecognizer.createSpeechRecognizer(appContext)
                recognizer.setRecognitionListener(speechListener)
                speechRecognizer = recognizer
                recognizer.startListening(buildSpeechIntent())
                call.resolve(JSObject().put("listening", true))
            } catch (e: Exception) {
                speechListening = false
                releaseSpeechRecognizer()
                call.reject("startSpeechRecognition failed: ${e.message}", e)
            }
        }
    }

    private fun buildSpeechIntent(): Intent {
        val lang = speechLanguages.getOrElse(speechLanguageIndex) { "es" }
        return Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, lang)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
            putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, context.packageName)
            // Longer end-of-speech window — gym phrases often have pauses between exercises.
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 2500L)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 1800L)
        }
    }

    private fun bumpSpeechLanguageOrStay(): Boolean {
        if (speechLanguageIndex >= speechLanguages.lastIndex) return false
        speechLanguageIndex += 1
        return true
    }

    private fun restartSpeechListening() {
        if (!speechListening || stopSpeechCall != null) return
        mainHandler.postDelayed({
            if (speechListening && stopSpeechCall == null) {
                try {
                    speechRecognizer?.startListening(buildSpeechIntent())
                } catch (e: Exception) {
                    Log.w(TAG, "restartSpeechListening failed", e)
                }
            }
        }, 120)
    }

    private fun buildDisplayTranscript(): String {
        val finals = speechTranscriptParts.joinToString(" ").trim()
        val partial = speechPartialText.trim()
        return when {
            finals.isNotEmpty() && partial.isNotEmpty() -> "$finals $partial"
            finals.isNotEmpty() -> finals
            else -> partial
        }.trim()
    }

    private fun notifySpeechPartial() {
        val text = buildDisplayTranscript()
        if (text.isEmpty()) return
        val payload = JSObject()
        payload.put("text", text)
        notifyListeners("speechPartial", payload)
    }

    private fun resolveStopSpeechCall() {
        val call = stopSpeechCall ?: return
        stopSpeechCall = null
        val transcript = buildDisplayTranscript()
        speechListening = false
        releaseSpeechRecognizer()
        val ret = JSObject()
        ret.put("transcript", transcript)
        call.resolve(ret)
    }

    private fun resolveStopSpeechCallIfPending() {
        if (stopSpeechCall != null) resolveStopSpeechCall()
    }

    private fun releaseMicInternal(keepTranscript: Boolean = false) {
        val pendingStop = stopSpeechCall
        if (pendingStop != null) {
            stopSpeechCall = null
            val ret = JSObject()
            ret.put("transcript", buildDisplayTranscript())
            pendingStop.resolve(ret)
        }
        speechListening = false
        if (!keepTranscript) {
            speechPartialText = ""
            speechTranscriptParts.clear()
        }
        val recognizer = speechRecognizer
        speechRecognizer = null
        try {
            recognizer?.destroy()
        } catch (_: Exception) {
            /* ignore */
        }
        releaseRecorder(deleteFile = true)
    }

    private fun releaseSpeechRecognizer() {
        releaseMicInternal(keepTranscript = true)
    }

    private val speechListener = object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) {
            notifyListeners("speechReady", JSObject())
        }

        override fun onBeginningOfSpeech() {
            notifySpeechPartial()
        }

        override fun onRmsChanged(rmsdB: Float) {}

        override fun onBufferReceived(buffer: ByteArray?) {}

        override fun onEndOfSpeech() {}

        override fun onError(error: Int) {
            Log.w(TAG, "speech onError code=$error lang=${speechLanguages.getOrElse(speechLanguageIndex) { "es" }}")
            if (stopSpeechCall != null) {
                resolveStopSpeechCall()
                return
            }
            when (error) {
                SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS,
                SpeechRecognizer.ERROR_CLIENT -> {
                    speechListening = false
                    releaseSpeechRecognizer()
                }
                SpeechRecognizer.ERROR_NO_MATCH,
                SpeechRecognizer.ERROR_SPEECH_TIMEOUT,
                SpeechRecognizer.ERROR_RECOGNIZER_BUSY,
                SpeechRecognizer.ERROR_AUDIO,
                SpeechRecognizer.ERROR_NETWORK,
                SpeechRecognizer.ERROR_SERVER -> {
                    if (!speechListening) return
                    if (
                        (error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) &&
                        bumpSpeechLanguageOrStay()
                    ) {
                        Log.d(TAG, "speech retry with lang=${speechLanguages[speechLanguageIndex]}")
                    }
                    restartSpeechListening()
                }
                else -> restartSpeechListening()
            }
        }

        override fun onResults(results: Bundle?) {
            val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val text = matches?.firstOrNull()?.trim().orEmpty()
            if (text.isNotEmpty()) {
                speechTranscriptParts.add(text)
                speechPartialText = ""
                notifySpeechPartial()
            }
            if (stopSpeechCall != null) {
                resolveStopSpeechCall()
            } else if (speechListening) {
                restartSpeechListening()
            }
        }

        override fun onPartialResults(partialResults: Bundle?) {
            val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            speechPartialText = matches?.firstOrNull()?.trim().orEmpty()
            notifySpeechPartial()
        }

        override fun onEvent(eventType: Int, params: Bundle?) {}
    }

    private fun startRecordingInternal(call: PluginCall) {
        releaseMicInternal()
        val errors = mutableListOf<String>()
        for (config in RECORDING_CONFIGS) {
            try {
                val file = File(context.cacheDir, "workout_voice_${System.currentTimeMillis()}${config.extension}")
                outputFile = file
                outputMimeType = config.mimeType
                val mr = createMediaRecorder()
                mr.setAudioSource(MediaRecorder.AudioSource.MIC)
                mr.setOutputFormat(config.outputFormat)
                mr.setAudioEncoder(config.audioEncoder)
                if (config.bitRate > 0) mr.setAudioEncodingBitRate(config.bitRate)
                if (config.sampleRate > 0) mr.setAudioSamplingRate(config.sampleRate)
                mr.setOutputFile(file.absolutePath)
                mr.prepare()
                mr.start()
                recorder = mr
                recordingStartedAt = System.currentTimeMillis()
                Log.d(TAG, "startRecording ok format=${config.label}")
                call.resolve(JSObject().put("recording", true))
                return
            } catch (e: Exception) {
                errors.add("${config.label}: ${e.message}")
                Log.w(TAG, "startRecording failed ${config.label}", e)
                releaseRecorder(deleteFile = true)
            }
        }
        call.reject("startRecording failed: ${errors.joinToString(" | ")}")
    }

    private fun stopRecordingInternal(call: PluginCall?) {
        val file = outputFile
        val startedAt = recordingStartedAt
        val mimeType = outputMimeType
        try {
            recorder?.apply {
                try {
                    stop()
                } catch (_: Exception) {
                    /* stop can throw on very short clips */
                }
                release()
            }
        } catch (e: Exception) {
            call?.reject("stopRecording failed: ${e.message}", e)
            releaseRecorder(deleteFile = true)
            return
        } finally {
            recorder = null
            recordingStartedAt = 0L
        }

        outputFile = null
        if (file == null || !waitForFileReady(file)) {
            file?.delete()
            call?.reject("Recording too short or empty")
            return
        }

        try {
            val bytes = file.readBytes()
            file.delete()
            if (bytes.size > 1_500_000) {
                call?.reject("Recording too large — keep under 25 seconds")
                return
            }
            val ret = JSObject()
            ret.put("base64", Base64.encodeToString(bytes, Base64.NO_WRAP))
            ret.put("mimeType", mimeType)
            ret.put(
                "durationMs",
                if (startedAt > 0) System.currentTimeMillis() - startedAt else 0,
            )
            ret.put("sizeBytes", bytes.size)
            call?.resolve(ret)
        } catch (e: Exception) {
            file.delete()
            call?.reject("stopRecording read failed: ${e.message}", e)
        }
    }

    @Suppress("DEPRECATION")
    private fun createMediaRecorder(): MediaRecorder {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            MediaRecorder(context)
        } else {
            MediaRecorder()
        }
    }

    private fun releaseRecorder(deleteFile: Boolean) {
        try {
            recorder?.apply {
                try {
                    stop()
                } catch (_: Exception) {
                    /* ignore */
                }
                release()
            }
        } catch (_: Exception) {
            /* ignore */
        }
        recorder = null
        recordingStartedAt = 0L
        if (deleteFile) {
            outputFile?.delete()
        }
        outputFile = null
    }

    private fun waitForFileReady(file: File, minBytes: Long = 400, maxWaitMs: Long = 1200): Boolean {
        val deadline = System.currentTimeMillis() + maxWaitMs
        while (System.currentTimeMillis() < deadline) {
            if (file.exists() && file.length() >= minBytes) return true
            try {
                Thread.sleep(60)
            } catch (_: InterruptedException) {
                break
            }
        }
        return file.exists() && file.length() >= minBytes
    }

    private fun permissionResult(): JSObject {
        val granted = getPermissionState("microphone") == PermissionState.GRANTED
        return JSObject().put("granted", granted)
    }

    private data class RecordingConfig(
        val label: String,
        val extension: String,
        val mimeType: String,
        val outputFormat: Int,
        val audioEncoder: Int,
        val bitRate: Int = 0,
        val sampleRate: Int = 0,
    )

    companion object {
        private const val TAG = "EntrenaMatchMic"

        private val RECORDING_CONFIGS = listOf(
            RecordingConfig(
                label = "3gp_amr",
                extension = ".3gp",
                mimeType = "audio/3gpp",
                outputFormat = MediaRecorder.OutputFormat.THREE_GPP,
                audioEncoder = MediaRecorder.AudioEncoder.AMR_NB,
            ),
            RecordingConfig(
                label = "m4a_aac",
                extension = ".m4a",
                mimeType = "audio/mp4",
                outputFormat = MediaRecorder.OutputFormat.MPEG_4,
                audioEncoder = MediaRecorder.AudioEncoder.AAC,
                bitRate = 48_000,
                sampleRate = 16_000,
            ),
        )
    }
}
