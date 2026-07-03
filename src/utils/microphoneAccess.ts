import { Capacitor, registerPlugin } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'
import { ensureCapacitorPlugins } from './capacitorRuntimePlugins'
import { OperationTimeoutError, withTimeout } from './withTimeout'

export type MicrophoneAccessErrorCode = 'DENIED' | 'NO_DEVICE' | 'UNSUPPORTED' | 'NO_RECORDER'

export type NativeVoiceRecordingResult = {
  base64: string
  mimeType: string
  durationMs?: number
}

type NativeStopPayload = {
  base64?: string
  mimeType?: string
  durationMs?: number
  sizeBytes?: number
}

type MicPlugin = {
  checkPermission: () => Promise<{ granted: boolean }>
  requestPermission: () => Promise<{ granted: boolean }>
  openAppSettings: () => Promise<void>
  startRecording?: () => Promise<{ recording: boolean }>
  stopRecording?: () => Promise<NativeStopPayload>
  isRecording?: () => Promise<{ recording: boolean }>
  startSpeechRecognition?: () => Promise<{ listening: boolean }>
  stopSpeechRecognition?: () => Promise<{ transcript: string }>
  cancelSpeechRecognition?: () => Promise<void>
  releaseMic?: () => Promise<void>
  getSpeechTranscript?: () => Promise<{ transcript: string; listening?: boolean }>
  addListener?: (
    eventName: 'speechPartial',
    listenerFunc: (data: { text?: string }) => void
  ) => Promise<PluginListenerHandle>
}

const EntrenamatchMicrophone = registerPlugin<MicPlugin>('EntrenamatchMicrophone')
const NATIVE_STOP_TIMEOUT_MS = 15_000
const NATIVE_STT_STOP_FAST_MS = 4_000
let speechPartialListener: PluginListenerHandle | null = null

export function usesNativeAndroidVoiceCapture(): boolean {
  return Capacitor.getPlatform() === 'android'
}

export function usesNativeSpeechRecognition(): boolean {
  return Capacitor.getPlatform() === 'android'
}

function extractErrorMessage(e: unknown): string {
  if (e instanceof OperationTimeoutError) return e.message
  if (e instanceof Error) return e.message
  if (typeof e === 'object' && e !== null && 'message' in e) {
    return String((e as { message: unknown }).message)
  }
  return String(e ?? '')
}

async function getMicrophonePlugin(): Promise<MicPlugin> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('UNSUPPORTED')
  }
  try {
    await ensureCapacitorPlugins()
  } catch {
    /* registerPlugin proxy still works */
  }
  return EntrenamatchMicrophone
}

export function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ]
  for (const mimeType of candidates) {
    if (MediaRecorder.isTypeSupported(mimeType)) return mimeType
  }
  return undefined
}

export function mimeTypeForUpload(recorderMime?: string): string {
  if (!recorderMime) return 'audio/webm'
  const base = recorderMime.split(';')[0] || recorderMime
  if (base === 'audio/3gpp' || base === 'audio/amr') return 'audio/aac'
  return base
}

export function workoutVoiceMicErrorMessage(code: MicrophoneAccessErrorCode | 'unknown'): string {
  switch (code) {
    case 'DENIED':
      return 'Activa el micrófono para EntrenaMatch en Ajustes → Permisos → Micrófono.'
    case 'NO_DEVICE':
      return 'No detectamos micrófono en este dispositivo.'
    case 'UNSUPPORTED':
      return 'Dictado por voz no disponible en este dispositivo.'
    case 'NO_RECORDER':
      return 'Grabación de audio no soportada en este dispositivo.'
    default:
      return 'No pudimos acceder al micrófono. Revisa permisos e intenta de nuevo.'
  }
}

export async function ensureMicrophonePermission(): Promise<'granted' | 'denied' | 'unsupported'> {
  if (typeof navigator === 'undefined') return 'unsupported'

  if (Capacitor.isNativePlatform()) {
    try {
      const plugin = await getMicrophonePlugin()
      const check = await plugin.checkPermission()
      if (check.granted) return 'granted'
      const req = await plugin.requestPermission()
      return req.granted ? 'granted' : 'denied'
    } catch (e) {
      console.warn('[voice] native permission failed', extractErrorMessage(e))
      return 'denied'
    }
  }

  if (!navigator.mediaDevices?.getUserMedia) return 'unsupported'
  return 'granted'
}

export async function openMicrophoneAppSettings(): Promise<void> {
  try {
    const plugin = await getMicrophonePlugin()
    await plugin.openAppSettings()
  } catch {
    if (typeof window !== 'undefined') window.open('app-settings:', '_system')
  }
}

export async function startNativeVoiceRecording(): Promise<void> {
  const plugin = await getMicrophonePlugin()
  await withTimeout(plugin.startRecording!(), 10_000, 'No pudimos iniciar la grabación a tiempo.')
}

export async function startNativeSpeechRecognition(onPartial: (text: string) => void): Promise<void> {
  const plugin = await getMicrophonePlugin()
  await attachSpeechPartialListener(plugin, onPartial)
  await withTimeout(
    plugin.startSpeechRecognition!(),
    8_000,
    'No pudimos iniciar el reconocimiento de voz.'
  )
}

async function attachSpeechPartialListener(
  plugin: MicPlugin,
  onPartial: (text: string) => void
): Promise<void> {
  try {
    if (speechPartialListener) {
      await speechPartialListener.remove()
      speechPartialListener = null
    }
    if (!plugin.addListener) return
    speechPartialListener = await withTimeout(
      plugin.addListener('speechPartial', (data) => {
        if (data.text) onPartial(data.text)
      }),
      2_500,
      'speech listener timeout'
    )
  } catch {
    /* polling fallback in hook */
  }
}

export async function pollNativeSpeechTranscript(): Promise<{
  transcript: string
  listening: boolean
}> {
  try {
    const plugin = await getMicrophonePlugin()
    if (!plugin.getSpeechTranscript) return { transcript: '', listening: false }
    const result = await plugin.getSpeechTranscript()
    return {
      transcript: (result.transcript || '').trim(),
      listening: result.listening === true,
    }
  } catch {
    return { transcript: '', listening: false }
  }
}

export async function restartNativeSpeechRecognitionIfIdle(
  onPartial: (text: string) => void
): Promise<boolean> {
  const status = await pollNativeSpeechTranscript()
  if (status.listening) return true
  try {
    await cancelNativeSpeechRecognition()
    await startNativeSpeechRecognition(onPartial)
    return true
  } catch {
    return false
  }
}

export async function stopNativeSpeechRecognitionFast(): Promise<{ transcript: string }> {
  const plugin = await getMicrophonePlugin()
  try {
    const result = await withTimeout(
      plugin.stopSpeechRecognition!(),
      NATIVE_STT_STOP_FAST_MS,
      'STT stop timeout'
    )
    return { transcript: (result.transcript || '').trim() }
  } catch {
    const fallback = await pollNativeSpeechTranscript()
    await cancelNativeSpeechRecognition()
    return { transcript: fallback.transcript }
  } finally {
    if (speechPartialListener) {
      await speechPartialListener.remove()
      speechPartialListener = null
    }
  }
}

export async function stopNativeSpeechRecognition(): Promise<{ transcript: string }> {
  const plugin = await getMicrophonePlugin()
  try {
    const result = await withTimeout(
      plugin.stopSpeechRecognition!(),
      10_000,
      'Detener el dictado tardó demasiado.'
    )
    return { transcript: (result.transcript || '').trim() }
  } finally {
    if (speechPartialListener) {
      await speechPartialListener.remove()
      speechPartialListener = null
    }
  }
}

export async function releaseNativeMic(): Promise<void> {
  try {
    const plugin = await getMicrophonePlugin()
    if (plugin.releaseMic) {
      await withTimeout(plugin.releaseMic(), 3_000, 'releaseMic timeout')
    } else {
      await plugin.cancelSpeechRecognition?.()
      try {
        await plugin.stopRecording?.()
      } catch {
        /* no active recording */
      }
    }
  } catch {
    /* ignore */
  }
  if (speechPartialListener) {
    await speechPartialListener.remove()
    speechPartialListener = null
  }
}

export async function cancelNativeSpeechRecognition(): Promise<void> {
  try {
    const plugin = await getMicrophonePlugin()
    await plugin.cancelSpeechRecognition?.()
  } catch {
    /* ignore */
  }
  if (speechPartialListener) {
    await speechPartialListener.remove()
    speechPartialListener = null
  }
}

export async function stopNativeVoiceRecording(): Promise<NativeVoiceRecordingResult> {
  const plugin = await getMicrophonePlugin()
  try {
    const result = await withTimeout(
      plugin.stopRecording!(),
      NATIVE_STOP_TIMEOUT_MS,
      'Detener la grabación tardó demasiado.'
    )

    const base64 = result.base64 || ''
    if (!base64 || base64.length < 100) {
      throw new Error('SHORT')
    }

    return {
      base64,
      mimeType: mimeTypeForUpload(result.mimeType || 'audio/mp4'),
      durationMs: result.durationMs,
    }
  } catch (e) {
    const msg = extractErrorMessage(e)
    if (msg.includes('too short') || msg.includes('empty') || msg === 'SHORT') {
      throw new Error('SHORT')
    }
    if (msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('permission')) {
      throw new Error('DENIED')
    }
    if (msg.toLowerCase().includes('too large')) {
      throw new Error('Grabación muy larga — habla menos de 25 segundos.')
    }
    throw new Error(msg || 'RECORD_FAILED')
  }
}

export async function acquireMicrophoneStream(): Promise<MediaStream> {
  const perm = await ensureMicrophonePermission()
  if (perm === 'unsupported') throw new Error('UNSUPPORTED')
  if (perm === 'denied') throw new Error('DENIED')

  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch (e) {
    const name = e instanceof DOMException ? e.name : ''
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      throw new Error('DENIED')
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      throw new Error('NO_DEVICE')
    }
    throw e
  }
}

export function createAudioMediaRecorder(stream: MediaStream): { recorder: MediaRecorder; mimeType: string } {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('NO_RECORDER')
  }
  const preferred = pickRecorderMimeType()
  try {
    const recorder = preferred ? new MediaRecorder(stream, { mimeType: preferred }) : new MediaRecorder(stream)
    const actual = recorder.mimeType || preferred
    return { recorder, mimeType: mimeTypeForUpload(actual) }
  } catch {
    const recorder = new MediaRecorder(stream)
    return { recorder, mimeType: mimeTypeForUpload(recorder.mimeType) }
  }
}

export function mapVoiceCaptureError(e: unknown): string {
  const msg = extractErrorMessage(e)
  if (msg === 'SHORT') return 'Grabación muy corta — habla al menos 3 segundos.'
  if (['DENIED', 'NO_DEVICE', 'UNSUPPORTED', 'NO_RECORDER'].includes(msg)) {
    return workoutVoiceMicErrorMessage(msg as MicrophoneAccessErrorCode)
  }
  if (msg.includes('startRecording failed')) {
    return `No pudimos iniciar la grabación: ${msg.replace('startRecording failed: ', '')}`
  }
  if (msg.includes('No active recording')) {
    return 'La grabación aún no estaba lista. Espera 1 segundo y vuelve a intentar.'
  }
  if (msg.includes('Speech recognition not available')) {
    return 'Reconocimiento de voz no disponible en este dispositivo.'
  }
  if (msg.includes('Speech recognition already active')) {
    return 'El dictado quedó bloqueado — cierra y vuelve a abrir el modal, o reinicia la app.'
  }
  if (msg.includes('No active speech recognition')) {
    return 'El dictado aún no estaba listo. Espera 1 segundo y vuelve a intentar.'
  }
  if (msg) return msg
  return workoutVoiceMicErrorMessage('unknown')
}
