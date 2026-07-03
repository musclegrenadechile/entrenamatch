import { useCallback, useEffect, useRef, useState } from 'react'
import { parseWorkoutVoiceTextWithAi, parseWorkoutVoiceWithAi } from '../services/workoutVoice'
import {
  acquireMicrophoneStream,
  createAudioMediaRecorder,
  ensureMicrophonePermission,
  mapVoiceCaptureError,
  pollNativeSpeechTranscript,
  releaseNativeMic,
  startNativeSpeechRecognition,
  startNativeVoiceRecording,
  stopNativeVoiceRecording,
  usesNativeAndroidVoiceCapture,
  usesNativeSpeechRecognition,
} from '../utils/microphoneAccess'
import type { WorkoutVoiceParseResult } from '../utils/workoutVoiceApply'
import { parseWorkoutVoiceLocally, shouldUseLocalParse } from '../utils/workoutVoiceLocalParse'
import { startWebSpeechRecognition, usesWebSpeechRecognition, type WebSpeechSession } from '../utils/workoutSpeech'

const MAX_RECORD_SEC = 25
const PROCESSING_HINT_SEC = 6
const PROCESSING_MAX_AUDIO_SEC = 80
const PROCESSING_MAX_TEXT_SEC = 35

export type WorkoutVoiceCaptureMode = 'none' | 'stt' | 'audio'

export type WorkoutVoiceDictationPhase = 'idle' | 'recording' | 'processing' | 'preview' | 'error'
type RecordingMode = 'none' | 'starting' | 'stt-native' | 'stt-web' | 'native' | 'web'

export type UseWorkoutVoiceDictationOptions = {
  recentExerciseNames?: string[]
  onHaptic?: (kind: 'light' | 'medium' | 'success') => void
}

export function useWorkoutVoiceDictation(opts: UseWorkoutVoiceDictationOptions = {}) {
  const [phase, setPhase] = useState<WorkoutVoiceDictationPhase>('idle')
  const [recordingSec, setRecordingSec] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [preview, setPreview] = useState<WorkoutVoiceParseResult | null>(null)
  const [processingSec, setProcessingSec] = useState(0)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [captureMode, setCaptureMode] = useState<WorkoutVoiceCaptureMode>('none')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const webSpeechSessionRef = useRef<WebSpeechSession | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef(0)
  const uploadMimeRef = useRef('audio/webm')
  const busyRef = useRef(false)
  const stoppingRef = useRef(false)
  const stopRequestedRef = useRef(false)
  const recordingModeRef = useRef<RecordingMode>('none')
  const stopRecordingRef = useRef<() => void>(() => {})
  const liveTranscriptRef = useRef('')
  const processingMaxSecRef = useRef(PROCESSING_MAX_TEXT_SEC)

  const processingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sttPollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordingStartedAtRef = useRef(0)
  const captureSessionRef = useRef(0)

  const clearSttPoll = useCallback(() => {
    if (sttPollRef.current) {
      clearInterval(sttPollRef.current)
      sttPollRef.current = null
    }
  }, [])

  const clearProcessingTimer = useCallback(() => {
    if (processingTimerRef.current) {
      clearInterval(processingTimerRef.current)
      processingTimerRef.current = null
    }
    setProcessingSec(0)
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const abortActiveCapture = useCallback(async () => {
    clearTimer()
    clearProcessingTimer()
    clearSttPoll()
    if (webSpeechSessionRef.current) {
      webSpeechSessionRef.current.abort()
      webSpeechSessionRef.current = null
    }
    await releaseNativeMic()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    mediaRecorderRef.current = null
    chunksRef.current = []
    recordingModeRef.current = 'none'
    stoppingRef.current = false
    stopRequestedRef.current = false
    busyRef.current = false
    liveTranscriptRef.current = ''
    setLiveTranscript('')
    setCaptureMode('none')
    setRecordingSec(0)
    recordingStartedAtRef.current = 0
  }, [clearTimer, clearProcessingTimer, clearSttPoll])

  const cleanupStream = useCallback(() => {
    void abortActiveCapture()
  }, [abortActiveCapture])

  const reset = useCallback(() => {
    void abortActiveCapture().then(() => {
      setPhase('idle')
      setErrorMessage(null)
      setPreview(null)
    })
  }, [abortActiveCapture])

  const beginRecordingUi = useCallback(() => {
    startRef.current = Date.now()
    setRecordingSec(0)
    setPhase('recording')
    clearTimer()
    timerRef.current = setInterval(() => {
      const sec = Math.floor((Date.now() - startRef.current) / 1000)
      setRecordingSec(sec)
      if (sec >= MAX_RECORD_SEC) stopRecordingRef.current()
    }, 400)
    try {
      opts.onHaptic?.('medium')
    } catch {
      /* ignore */
    }
  }, [clearTimer, opts.onHaptic])

  const beginProcessingUi = useCallback(() => {
    setPhase('processing')
    clearProcessingTimer()
    const started = Date.now()
    processingTimerRef.current = setInterval(() => {
      setProcessingSec(Math.floor((Date.now() - started) / 1000))
    }, 500)
  }, [clearProcessingTimer])

  const finishPreview = useCallback(
    (result: WorkoutVoiceParseResult) => {
      setPreview(result)
      setPhase('preview')
      try {
        opts.onHaptic?.('success')
      } catch {
        /* ignore */
      }
    },
    [opts.onHaptic]
  )

  const tryInstantLocalPreview = useCallback(
    (transcript: string): boolean => {
      const trimmed = transcript.trim()
      if (trimmed.length < 8) return false
      const local = parseWorkoutVoiceLocally(trimmed, opts.recentExerciseNames)
      if (!shouldUseLocalParse(local)) return false
      clearProcessingTimer()
      finishPreview(local)
      busyRef.current = false
      stoppingRef.current = false
      return true
    },
    [opts.recentExerciseNames, finishPreview, clearProcessingTimer]
  )

  const processTranscript = useCallback(
    async (transcript: string) => {
      const trimmed = transcript.trim()
      if (trimmed.length < 8) {
        clearProcessingTimer()
        setErrorMessage('No te escuchamos bien — habla más claro e intenta de nuevo.')
        setPhase('error')
        busyRef.current = false
        stoppingRef.current = false
        return
      }

      processingMaxSecRef.current = PROCESSING_MAX_TEXT_SEC
      if (tryInstantLocalPreview(trimmed)) return

      beginProcessingUi()
      try {
        const result = await parseWorkoutVoiceTextWithAi({
          transcript: trimmed,
          recentExerciseNames: opts.recentExerciseNames,
        })
        finishPreview(result)
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : 'No pudimos entender el entreno. Intenta de nuevo, más despacio.'
        setErrorMessage(msg)
        setPhase('error')
      } finally {
        clearProcessingTimer()
        busyRef.current = false
        stoppingRef.current = false
      }
    },
    [
      opts.recentExerciseNames,
      beginProcessingUi,
      clearProcessingTimer,
      finishPreview,
      tryInstantLocalPreview,
    ]
  )

  const processAudio = useCallback(
    async (audioBase64: string, mimeType: string) => {
      processingMaxSecRef.current = PROCESSING_MAX_AUDIO_SEC
      beginProcessingUi()
      try {
        const result = await parseWorkoutVoiceWithAi({
          audioBase64,
          mimeType,
          recentExerciseNames: opts.recentExerciseNames,
        })
        finishPreview(result)
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : 'No pudimos entender el audio. Intenta de nuevo, más despacio.'
        setErrorMessage(msg)
        setPhase('error')
      } finally {
        clearProcessingTimer()
        busyRef.current = false
        stoppingRef.current = false
      }
    },
    [opts.recentExerciseNames, beginProcessingUi, clearProcessingTimer, finishPreview]
  )

  const processBlob = useCallback(
    async (blob: Blob, mimeType: string) => {
      const { blobToAudioBase64 } = await import('../services/workoutVoice')
      const audioBase64 = await blobToAudioBase64(blob)
      await processAudio(audioBase64, mimeType)
    },
    [processAudio]
  )

  const finishSttRecordingAfterStop = useCallback(
    async (live: string, session: number) => {
      try {
        await releaseNativeMic()
        if (captureSessionRef.current !== session) return

        liveTranscriptRef.current = ''
        setLiveTranscript('')

        let transcript = live
        if (transcript.length < 8) {
          const polled = await pollNativeSpeechTranscript()
          transcript = (polled.transcript || live).trim()
        }
        if (captureSessionRef.current !== session) return

        if (tryInstantLocalPreview(transcript)) return
        await processTranscript(transcript)
      } catch (e) {
        if (captureSessionRef.current !== session) return
        clearProcessingTimer()
        busyRef.current = false
        setErrorMessage(mapVoiceCaptureError(e))
        setPhase('error')
      } finally {
        if (captureSessionRef.current === session) {
          stoppingRef.current = false
          stopRequestedRef.current = false
        }
      }
    },
    [clearProcessingTimer, tryInstantLocalPreview, processTranscript]
  )

  const finishNativeRecording = useCallback(async () => {
    clearTimer()
    try {
      const captured = await stopNativeVoiceRecording()
      recordingModeRef.current = 'none'
      const elapsedMs = captured.durationMs ?? Math.max(0, Date.now() - startRef.current)
      if (elapsedMs > 0 && elapsedMs < 1200) {
        clearProcessingTimer()
        setErrorMessage('Grabación muy corta — habla al menos 3 segundos.')
        setPhase('error')
        busyRef.current = false
        stoppingRef.current = false
        return
      }
      await processAudio(captured.base64, captured.mimeType)
    } catch (e) {
      recordingModeRef.current = 'none'
      busyRef.current = false
      stoppingRef.current = false
      clearProcessingTimer()
      setErrorMessage(mapVoiceCaptureError(e))
      setPhase('error')
    }
  }, [clearTimer, clearProcessingTimer, processAudio])

  const stopWebRecording = useCallback(() => {
    const rec = mediaRecorderRef.current
    if (!rec || rec.state === 'inactive') {
      recordingModeRef.current = 'none'
      busyRef.current = false
      stoppingRef.current = false
      setErrorMessage('No hay grabación activa. Intenta de nuevo.')
      setPhase('error')
      return
    }
    beginProcessingUi()
    try {
      if (rec.state === 'recording') {
        try {
          rec.requestData()
        } catch {
          /* ignore */
        }
      }
      rec.stop()
    } catch {
      cleanupStream()
      setErrorMessage('Error al detener la grabación.')
      setPhase('error')
    }
  }, [cleanupStream, beginProcessingUi])

  const stopRecording = useCallback(() => {
    const session = captureSessionRef.current + 1
    captureSessionRef.current = session
    stopRequestedRef.current = true

    const mode = recordingModeRef.current
    recordingModeRef.current = 'none'

    clearTimer()
    clearSttPoll()
    setCaptureMode('none')

    if (webSpeechSessionRef.current) {
      try {
        webSpeechSessionRef.current.abort()
      } catch {
        /* ignore */
      }
      webSpeechSessionRef.current = null
    }

    const live = liveTranscriptRef.current.trim()

    if (mode === 'starting' || mode === 'none') {
      busyRef.current = false
      stoppingRef.current = false
      stopRequestedRef.current = false
      setPhase('idle')
      setRecordingSec(0)
      void abortActiveCapture()
      return
    }

    if (stoppingRef.current) {
      busyRef.current = false
      stoppingRef.current = false
      stopRequestedRef.current = false
      setPhase('idle')
      setRecordingSec(0)
      void abortActiveCapture()
      return
    }
    stoppingRef.current = true

    if (tryInstantLocalPreview(live)) {
      void releaseNativeMic()
      return
    }

    beginProcessingUi()

    if (mode === 'stt-native' || mode === 'stt-web') {
      void finishSttRecordingAfterStop(live, session)
      return
    }
    if (mode === 'native') {
      void finishNativeRecording()
      return
    }
    if (mode === 'web') {
      stopWebRecording()
      return
    }

    stoppingRef.current = false
    stopRequestedRef.current = false
    clearProcessingTimer()
    setErrorMessage('No hay grabación activa. Intenta de nuevo.')
    setPhase('error')
  }, [
    abortActiveCapture,
    beginProcessingUi,
    clearProcessingTimer,
    clearSttPoll,
    clearTimer,
    finishNativeRecording,
    finishSttRecordingAfterStop,
    stopWebRecording,
    tryInstantLocalPreview,
  ])

  stopRecordingRef.current = stopRecording

  useEffect(() => {
    if (phase !== 'processing') return
    const maxSec = processingMaxSecRef.current
    const watchdog = setTimeout(() => {
      setErrorMessage('Tiempo agotado procesando. Revisa conexión e intenta de nuevo.')
      setPhase('error')
      busyRef.current = false
      stoppingRef.current = false
      clearProcessingTimer()
    }, maxSec * 1000)
    return () => clearTimeout(watchdog)
  }, [phase, clearProcessingTimer])

  const startWebRecording = useCallback(async () => {
    const stream = await acquireMicrophoneStream()
    streamRef.current = stream
    const { recorder, mimeType } = createAudioMediaRecorder(stream)
    uploadMimeRef.current = mimeType
    mediaRecorderRef.current = recorder
    chunksRef.current = []
    recordingModeRef.current = 'web'

    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) chunksRef.current.push(ev.data)
    }

    recorder.onerror = () => {
      setErrorMessage('Error al grabar audio. Intenta de nuevo.')
      setPhase('error')
      cleanupStream()
    }

    recorder.onstop = () => {
      const blobType = mimeTypeForBlob(recorder.mimeType, uploadMimeRef.current)
      const blob = new Blob(chunksRef.current, { type: blobType })
      recordingModeRef.current = 'none'
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      mediaRecorderRef.current = null
      chunksRef.current = []
      if (blob.size < 400) {
        busyRef.current = false
        stoppingRef.current = false
        setErrorMessage('Grabación muy corta — habla al menos 3 segundos.')
        setPhase('error')
        return
      }
      void processBlob(blob, blobType)
    }

    recorder.start()

    if (stopRequestedRef.current) {
      stopRequestedRef.current = false
      stopWebRecording()
    }
  }, [cleanupStream, processBlob, stopWebRecording])

  const switchToNativeAudio = useCallback(
    async (session: number) => {
      if (captureSessionRef.current !== session) return
      if (stopRequestedRef.current) return
      if (recordingModeRef.current !== 'stt-native') return
      if (liveTranscriptRef.current.trim().length > 0) return

      clearSttPoll()
      await releaseNativeMic()
      if (captureSessionRef.current !== session || stopRequestedRef.current) return

      try {
        setCaptureMode('audio')
        await startNativeVoiceRecording()
        if (captureSessionRef.current !== session) {
          await releaseNativeMic()
          return
        }
        recordingModeRef.current = 'native'
      } catch (e) {
        if (captureSessionRef.current !== session) return
        busyRef.current = false
        setErrorMessage(mapVoiceCaptureError(e))
        setPhase('error')
        clearTimer()
        setCaptureMode('none')
      }
    },
    [clearSttPoll, clearTimer]
  )

  const startSttCapture = useCallback(
    async (session: number): Promise<boolean> => {
      const onPartial = (text: string) => {
        if (!text || captureSessionRef.current !== session) return
        liveTranscriptRef.current = text
        setLiveTranscript(text)
      }

      const attachSttPoll = () => {
        clearSttPoll()
        sttPollRef.current = setInterval(() => {
          void pollNativeSpeechTranscript().then(({ transcript }) => {
            if (captureSessionRef.current !== session) return
            if (transcript) onPartial(transcript)

            const elapsed = Date.now() - recordingStartedAtRef.current
            const noText = !liveTranscriptRef.current.trim()
            if (
              elapsed >= 2000 &&
              noText &&
              recordingModeRef.current === 'stt-native'
            ) {
              void switchToNativeAudio(session)
            }
          })
        }, 400)
      }

      if (usesNativeSpeechRecognition()) {
        for (let attempt = 0; attempt < 2; attempt++) {
          if (captureSessionRef.current !== session || stopRequestedRef.current) return false
          try {
            await releaseNativeMic()
            await new Promise((r) => setTimeout(r, attempt === 0 ? 80 : 300))
            if (captureSessionRef.current !== session || stopRequestedRef.current) return false
            await startNativeSpeechRecognition(onPartial)
            if (captureSessionRef.current !== session || stopRequestedRef.current) {
              await releaseNativeMic()
              return false
            }
            recordingModeRef.current = 'stt-native'
            setCaptureMode('stt')
            attachSttPoll()
            return true
          } catch (nativeSttErr) {
            console.warn(`[voice] native STT failed attempt ${attempt + 1}`, nativeSttErr)
            clearSttPoll()
            await releaseNativeMic()
          }
        }
      }

      if (usesWebSpeechRecognition()) {
        try {
          webSpeechSessionRef.current = startWebSpeechRecognition(onPartial)
          if (captureSessionRef.current !== session || stopRequestedRef.current) return false
          recordingModeRef.current = 'stt-web'
          setCaptureMode('stt')
          return true
        } catch (webSttErr) {
          console.warn('[voice] web STT failed', webSttErr)
          webSpeechSessionRef.current = null
        }
      }

      return false
    },
    [clearSttPoll, switchToNativeAudio]
  )

  const startAudioCapture = useCallback(async () => {
    setCaptureMode('audio')
    if (usesNativeAndroidVoiceCapture()) {
      await startNativeVoiceRecording()
      recordingModeRef.current = 'native'
      if (stopRequestedRef.current) {
        stopRequestedRef.current = false
        void finishNativeRecording()
      }
      return
    }
    await startWebRecording()
  }, [finishNativeRecording, startWebRecording])

  const startRecording = useCallback(async () => {
    if (busyRef.current || phase === 'recording' || phase === 'processing') return

    const session = ++captureSessionRef.current
    busyRef.current = true
    stoppingRef.current = false
    stopRequestedRef.current = false
    recordingModeRef.current = 'starting'
    recordingStartedAtRef.current = Date.now()
    setErrorMessage(null)
    setPreview(null)
    liveTranscriptRef.current = ''
    setLiveTranscript('')
    beginRecordingUi()

    try {
      const micPerm = await ensureMicrophonePermission()
      if (captureSessionRef.current !== session) return
      if (micPerm !== 'granted') {
        busyRef.current = false
        recordingModeRef.current = 'none'
        setErrorMessage(
          micPerm === 'denied'
            ? 'Activa el micrófono para EntrenaMatch en Ajustes → Permisos → Micrófono.'
            : 'Dictado por voz no disponible en este dispositivo.'
        )
        setPhase('error')
        return
      }

      // Android: audio nativo primero — STT inestable en WebView/Samsung; Parar siempre responde.
      if (usesNativeAndroidVoiceCapture()) {
        setCaptureMode('audio')
        await startNativeVoiceRecording()
        if (captureSessionRef.current !== session || stopRequestedRef.current) {
          await releaseNativeMic()
          busyRef.current = false
          return
        }
        recordingModeRef.current = 'native'
        if (stopRequestedRef.current) {
          stopRequestedRef.current = false
          void finishNativeRecording()
        }
        return
      }

      if (usesNativeSpeechRecognition()) {
        setCaptureMode('stt')
      }

      const sttStarted = await startSttCapture(session)
      if (captureSessionRef.current !== session || stopRequestedRef.current) {
        busyRef.current = false
        return
      }

      if (sttStarted) return

      await startAudioCapture()
    } catch (e) {
      if (captureSessionRef.current !== session) return
      busyRef.current = false
      stoppingRef.current = false
      recordingModeRef.current = 'none'
      setErrorMessage(mapVoiceCaptureError(e))
      setPhase('error')
      cleanupStream()
    }
  }, [phase, beginRecordingUi, clearTimer, cleanupStream, startAudioCapture, startSttCapture])

  useEffect(() => () => cleanupStream(), [cleanupStream])

  return {
    phase,
    recordingSec,
    maxRecordSec: MAX_RECORD_SEC,
    processingSec,
    processingHintSec: PROCESSING_HINT_SEC,
    liveTranscript,
    captureMode,
    errorMessage,
    preview,
    startRecording,
    stopRecording,
    reset,
  }
}

function mimeTypeForBlob(recorderMime: string | undefined, fallback: string): string {
  const raw = recorderMime || fallback || 'audio/webm'
  return raw.split(';')[0] || 'audio/webm'
}

