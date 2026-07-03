import { Capacitor, CapacitorHttp } from '@capacitor/core'
import type { WorkoutVoiceParseResult } from '../utils/workoutVoiceApply'
import { OperationTimeoutError, withTimeout } from '../utils/withTimeout'

/** Upload + Gemini on slow mobile can exceed 40s — allow headroom for 3G uploads. */
const VOICE_AI_TIMEOUT_MS = 75_000
const VOICE_TEXT_TIMEOUT_MS = 25_000
const PARSE_WORKOUT_VOICE_URL =
  'https://us-central1-entrenamatch.cloudfunctions.net/parseWorkoutVoice'
const PARSE_WORKOUT_VOICE_TEXT_URL =
  'https://us-central1-entrenamatch.cloudfunctions.net/parseWorkoutVoiceText'

function mapCallableError(e: unknown): string {
  if (e instanceof OperationTimeoutError) {
    return 'La IA tardó demasiado — intenta de nuevo con un audio más corto.'
  }
  if (e instanceof Error && e.name === 'AbortError') {
    return 'La IA tardó demasiado — revisa tu conexión e intenta de nuevo.'
  }

  const err = e as { code?: string; message?: string; details?: unknown }
  const code = err?.code || ''
  const message = err?.message || ''

  if (code === 'functions/unauthenticated') {
    return 'Inicia sesión para usar dictado por voz.'
  }
  if (code === 'functions/invalid-argument') {
    return message || 'Audio inválido — graba al menos 3 segundos.'
  }
  if (code === 'functions/failed-precondition') {
    return message || 'Servicio de voz no configurado. Intenta más tarde.'
  }
  if (code === 'functions/deadline-exceeded') {
    return 'La IA tardó demasiado — intenta de nuevo con un audio más corto.'
  }
  if (code === 'functions/unavailable') {
    return message || 'No pudimos entender el audio. Habla más claro e intenta de nuevo.'
  }
  if (code === 'functions/internal') {
    return message || 'Error del servidor de voz. Intenta en unos minutos.'
  }
  if (message) return message
  return 'No pudimos procesar el audio. Intenta de nuevo.'
}

function parseCallableHttpJson(raw: unknown): {
  result?: WorkoutVoiceParseResult
  error?: { message?: string; status?: string }
} {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as {
        result?: WorkoutVoiceParseResult
        error?: { message?: string; status?: string }
      }
    } catch {
      throw new Error('Respuesta inválida del servidor de voz.')
    }
  }
  return (raw || {}) as {
    result?: WorkoutVoiceParseResult
    error?: { message?: string; status?: string }
  }
}

function throwFromCallableJson(
  json: { error?: { message?: string; status?: string } },
  httpStatus: number
): never {
  const msg = json.error?.message || `Error de red (${httpStatus})`
  const err = new Error(msg) as Error & { code?: string }
  const status = json.error?.status || ''
  if (status === 'UNAUTHENTICATED') err.code = 'functions/unauthenticated'
  if (status === 'INVALID_ARGUMENT') err.code = 'functions/invalid-argument'
  if (status === 'UNAVAILABLE') err.code = 'functions/unavailable'
  if (status === 'DEADLINE_EXCEEDED') err.code = 'functions/deadline-exceeded'
  throw err
}

async function callCallableNativeHttp<TPayload extends Record<string, unknown>>(
  url: string,
  token: string,
  payload: TPayload,
  timeoutMs: number
): Promise<WorkoutVoiceParseResult> {
  const response = await CapacitorHttp.post({
    url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: { data: payload },
    connectTimeout: timeoutMs,
    readTimeout: timeoutMs,
  })

  const json = parseCallableHttpJson(response.data)
  if (response.status < 200 || response.status >= 300 || json.error) {
    throwFromCallableJson(json, response.status)
  }
  if (!json.result) {
    throw new Error('Respuesta vacía del servidor de voz.')
  }
  return json.result
}

async function callCallableWebFetch<TPayload extends Record<string, unknown>>(
  url: string,
  token: string,
  payload: TPayload,
  timeoutMs: number
): Promise<WorkoutVoiceParseResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: payload }),
      signal: controller.signal,
    })

    const json = parseCallableHttpJson(await res.json())
    if (!res.ok || json.error) {
      throwFromCallableJson(json, res.status)
    }
    if (!json.result) {
      throw new Error('Respuesta vacía del servidor de voz.')
    }
    return json.result
  } finally {
    clearTimeout(timer)
  }
}

async function callVoiceCallable<TPayload extends Record<string, unknown>>(
  url: string,
  payload: TPayload,
  timeoutMs: number
): Promise<WorkoutVoiceParseResult> {
  const { app: firebaseApp } = await import('./firebase')
  if (!firebaseApp) throw new Error('Firebase not initialized')

  const { getAuth } = await import('firebase/auth')
  const user = getAuth(firebaseApp).currentUser
  if (!user) throw new Error('Inicia sesión para usar dictado por voz.')

  const token = await withTimeout(user.getIdToken(), 12_000, 'No pudimos verificar tu sesión.')
  const call = Capacitor.isNativePlatform() ? callCallableNativeHttp : callCallableWebFetch
  return await withTimeout(
    call(url, token, payload, timeoutMs),
    timeoutMs + 3_000,
    'La IA tardó demasiado — revisa tu conexión e intenta de nuevo.'
  )
}

async function callParseWorkoutVoiceNativeHttp(
  token: string,
  payload: {
    audioBase64: string
    mimeType: string
    recentExerciseNames?: string[]
  }
): Promise<WorkoutVoiceParseResult> {
  return callCallableNativeHttp(PARSE_WORKOUT_VOICE_URL, token, payload, VOICE_AI_TIMEOUT_MS)
}

async function callParseWorkoutVoiceWebFetch(
  token: string,
  payload: {
    audioBase64: string
    mimeType: string
    recentExerciseNames?: string[]
  }
): Promise<WorkoutVoiceParseResult> {
  return callCallableWebFetch(PARSE_WORKOUT_VOICE_URL, token, payload, VOICE_AI_TIMEOUT_MS)
}

export async function parseWorkoutVoiceWithAi(input: {
  audioBase64: string
  mimeType?: string
  recentExerciseNames?: string[]
}): Promise<WorkoutVoiceParseResult> {
  const { app: firebaseApp } = await import('./firebase')
  if (!firebaseApp) throw new Error('Firebase not initialized')

  const { getAuth } = await import('firebase/auth')
  const user = getAuth(firebaseApp).currentUser
  if (!user) throw new Error('Inicia sesión para usar dictado por voz.')

  const audioBase64 = input.audioBase64
  if (!audioBase64 || audioBase64.length < 100) {
    throw new Error('Audio inválido — graba al menos 3 segundos.')
  }
  if (audioBase64.length > 2_000_000) {
    throw new Error('Audio demasiado largo — graba menos de 25 segundos.')
  }

  const payload = {
    audioBase64,
    mimeType: input.mimeType || 'audio/webm',
    recentExerciseNames: input.recentExerciseNames?.slice(0, 12),
  }

  try {
    const token = await withTimeout(user.getIdToken(), 12_000, 'No pudimos verificar tu sesión.')
    const call = Capacitor.isNativePlatform()
      ? callParseWorkoutVoiceNativeHttp
      : callParseWorkoutVoiceWebFetch
    return await withTimeout(
      call(token, payload),
      VOICE_AI_TIMEOUT_MS + 5_000,
      'La IA tardó demasiado — revisa tu conexión e intenta de nuevo.'
    )
  } catch (e) {
    throw new Error(mapCallableError(e))
  }
}

export async function parseWorkoutVoiceTextWithAi(input: {
  transcript: string
  recentExerciseNames?: string[]
}): Promise<WorkoutVoiceParseResult> {
  const transcript = input.transcript.trim()
  if (transcript.length < 8) {
    throw new Error('Transcripción muy corta — habla al menos 3 segundos.')
  }
  if (transcript.length > 2000) {
    throw new Error('Transcripción demasiado larga — resume tu entreno.')
  }

  try {
    return await callVoiceCallable(
      PARSE_WORKOUT_VOICE_TEXT_URL,
      {
        transcript,
        recentExerciseNames: input.recentExerciseNames?.slice(0, 12),
      },
      VOICE_TEXT_TIMEOUT_MS
    )
  } catch (e) {
    throw new Error(mapCallableError(e))
  }
}

export function blobToAudioBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('No se pudo leer el audio'))
        return
      }
      const base64 = result.includes(',') ? result.split(',')[1]! : result
      resolve(base64)
    }
    reader.onerror = () => reject(reader.error || new Error('Error leyendo audio'))
    reader.readAsDataURL(blob)
  })
}
