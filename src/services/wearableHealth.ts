/**

 * W1a/W1b — Apple Health / Health Connect via @capgo/capacitor-health (native only).

 */



import { Capacitor } from '@capacitor/core'

import type { WearableSessionSnapshot } from '../types'

import {
  ensureHealthPluginReady,
  getCapacitorBrowser,
  getCapacitorHealth,
  getEntrenamatchHealth,
} from '../utils/capacitorRuntimePlugins'

import {

  localDayIsoRange,

  sumAggregatedCount,
  sumAggregatedKcal,
  summarizeHealthWorkouts,
  sumExerciseMinutes,

  wearableConnectedFromAuth,

} from '../utils/wearableDayMetrics'

import {

  heartRateStats,

  sessionIsoRange,

  workoutOverlapsSession,

} from '../utils/wearableSessionMetrics'

import { toLocalDateStr } from '../utils/fuelCalculator'
import { withTimeout } from '../utils/withTimeout'

const WEARABLE_READ_BASE = ['calories', 'heartRate', 'workouts', 'steps'] as const

/** Per-call cap — Health Connect on Samsung can stall on large reads. */
const HC_QUERY_TIMEOUT_MS = 10_000
const HC_AUTH_TIMEOUT_MS = 12_000
/** isAvailable() often hangs 30s+ on Samsung — short probe, then continue optimistically. */
const HC_ANDROID_AVAIL_TIMEOUT_MS = 4_000
/** requestAuthorization can stall if HC UI never returns — cap wait during connect. */
const HC_CONNECT_AUTH_TIMEOUT_MS = 25_000

async function healthQuery<T>(promise: Promise<T>, fallback: T, ms = HC_QUERY_TIMEOUT_MS): Promise<T> {
  try {
    return await withTimeout(promise, ms, 'health query timeout')
  } catch {
    return fallback
  }
}

export type WearableStatusOptions = {
  /** Skip slow "any data today?" probe — use during Fuel import. */
  skipTodayProbe?: boolean
}

export type FetchWearableDayOptions = {
  assumeConnected?: boolean
  platform?: WearablePlatform
  workoutLimit?: number
  /** Fuel import: one calories read, skip workouts/samples (Samsung HC is slow). */
  fastImport?: boolean
  /** Background auto-sync: sequential steps+kcal only (Samsung HC hangs on parallel reads). */
  autoSync?: boolean
}

/** Lightweight permission probe — skips isAvailable on Android (Samsung hang). */
export async function quickWearablePermissionCheck(
  platform?: WearablePlatform
): Promise<{ connected: boolean; authorizedTypes: string[]; reason?: string }> {
  const plat = platform || ((Capacitor.getPlatform() || 'android') as WearablePlatform)
  if (plat === 'android' && (await androidRuntimeHealthPermissionsGranted())) {
    return {
      connected: true,
      authorizedTypes: [...ANDROID_HC_PROBE_TYPES],
    }
  }
  const Health = await healthPlugin()
  if (!Health) {
    return { connected: false, authorizedTypes: [], reason: 'Plugin de salud no cargado.' }
  }

  if (plat === 'ios') {
    const availability = await healthQuery(
      Health.isAvailable(),
      { available: false, reason: 'HealthKit no disponible.' },
      5_000
    )
    if (!availability.available) {
      return { connected: false, authorizedTypes: [], reason: availability.reason }
    }
  }

  const auth = await healthQuery(
    Health.checkAuthorization({ read: wearableAuthReadTypes(plat) }),
    {},
    8_000
  )
  const { connected, authorizedTypes } = await resolveWearableConnected(plat, auth)
  const enhanced = await enhanceAndroidConnection(plat, connected, authorizedTypes)
  return {
    connected: enhanced.connected,
    authorizedTypes: enhanced.authorizedTypes,
    reason: enhanced.connected
      ? undefined
      : plat === 'android'
        ? 'Abre Health Connect → Permisos de apps → EntrenaMatch → Calorías activas.'
        : 'Ajustes → Salud → EntrenaMatch → Calorías activas.',
  }
}

const ANDROID_HC_PROBE_TYPES = ['calories', 'heartRate', 'workouts'] as const

/**
 * Samsung: Health Connect SDK returns empty auth while PackageManager shows granted=true.
 * Check OS runtime permissions directly (same as adb dumpsys).
 */
export async function androidRuntimeHealthPermissionsGranted(): Promise<boolean> {
  if (Capacitor.getPlatform() !== 'android') return false
  try {
    await ensureHealthPluginReady()
  } catch {
    return false
  }
  const native = getEntrenamatchHealth()
  if (!native) return false
  try {
    const result = await withTimeout(
      native.hasGrantedHealthPermissions(),
      3_000,
      'android runtime health perm check'
    )
    return !!(result?.canReadActivity ?? result?.granted)
  } catch {
    return false
  }
}

function probeSummaryHasData(
  probe: {
    steps: number
    activeCaloriesKcal: number
    exerciseMinutes: number
    workoutCount: number
  } | null | undefined
): boolean {
  if (!probe) return false
  return (
    probe.steps > 0 ||
    probe.activeCaloriesKcal > 0 ||
    probe.exerciseMinutes > 0 ||
    probe.workoutCount > 0
  )
}

/** Fast native HC read — avoids capacitor-health per-workout aggregation stalls on Samsung. */
async function fetchWearableDaySummaryAndroidNative(
  dateStr: string
): Promise<WearableDaySummary | null> {
  if (Capacitor.getPlatform() !== 'android') return null
  const native = getEntrenamatchHealth()
  if (!native?.probeWearableDay) return null

  const { startDate, endDate } = localDayIsoRange(dateStr)
  try {
    const probe = await withTimeout(
      native.probeWearableDay({ startDate, endDate }),
      20_000,
      'native wearable day probe timeout'
    )
    console.info('[wearable] native probe', {
      date: dateStr,
      steps: probe.steps,
      kcal: probe.activeCaloriesKcal,
      workouts: probe.workoutCount,
      mins: probe.exerciseMinutes,
      exerciseError: probe.exerciseError,
      stepsError: probe.stepsError,
      caloriesError: probe.caloriesError,
    })
    return {
      date: dateStr,
      steps: probe.steps || 0,
      activeCaloriesKcal: probe.activeCaloriesKcal || 0,
      exerciseMinutes: probe.exerciseMinutes || 0,
      workoutCount: probe.workoutCount || 0,
      sources: Array.isArray(probe.sources) ? probe.sources.slice(0, 5) : [],
    }
  } catch (e) {
    console.warn('[wearable] native probe failed', e)
    return null
  }
}

/**
 * Samsung devices often grant HC perms but checkAuthorization() hangs or returns empty.
 * Probe with a real read — if it completes, treat as connected.
 */
async function androidHealthApiReachable(): Promise<boolean> {
  if (Capacitor.getPlatform() !== 'android') return false
  const Health = await healthPlugin()
  if (!Health) return false
  const { startDate, endDate } = localDayIsoRange(toLocalDateStr())
  try {
    await withTimeout(
      Health.queryAggregated({
        dataType: 'calories',
        startDate,
        endDate,
        bucket: 'day',
        aggregation: 'sum',
      }),
      9_000,
      'android health probe timeout'
    )
    return true
  } catch {
    return false
  }
}

async function enhanceAndroidConnection(
  platform: WearablePlatform,
  connected: boolean,
  authorizedTypes: string[]
): Promise<{ connected: boolean; authorizedTypes: string[] }> {
  if (platform !== 'android' || connected) return { connected, authorizedTypes }
  const probeOk = await androidHealthApiReachable()
  if (!probeOk) return { connected, authorizedTypes }
  return {
    connected: true,
    authorizedTypes:
      authorizedTypes.length > 0 ? authorizedTypes : [...ANDROID_HC_PROBE_TYPES],
  }
}

const HEALTH_CONNECT_PLAY_URL =

  'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata'



/** Platform-specific scopes for requestAuthorization / checkAuthorization. */

export function wearableAuthReadTypes(platform: WearablePlatform): string[] {

  if (platform === 'ios') {

    return [...WEARABLE_READ_BASE, 'exerciseTime']

  }

  return [...WEARABLE_READ_BASE]

}



export type WearablePlatform = 'ios' | 'android' | 'web'



export type WearableConnectionStatus = {

  platform: WearablePlatform

  available: boolean

  /** Health Connect / HealthKit read permissions granted for EntrenaMatch. */

  connected: boolean

  reason?: string

  authorizedTypes: string[]

  /** Calorías o workouts detectados hoy en Health Connect (reloj realmente sincronizando). */

  hasTodayWearableData?: boolean

  /** True when Health Connect app must be installed/updated (Android). */

  needsHealthConnectInstall?: boolean

}



export type WearableDaySummary = {

  date: string

  activeCaloriesKcal: number

  steps: number

  exerciseMinutes: number

  workoutCount: number

  sources: string[]

}



type HealthAuthPayload = {

  readAuthorized?: string[]

  readDenied?: string[]

}



async function healthPlugin() {

  if (!Capacitor.isNativePlatform()) return null

  await ensureHealthPluginReady()

  return getCapacitorHealth()

}



/** iOS only — HealthKit may need a read before checkAuthorization reflects grants. */

async function recheckIosAuthAfterProbe(): Promise<HealthAuthPayload | null> {

  const Health = await healthPlugin()

  if (!Health) return null

  const { startDate, endDate } = localDayIsoRange(toLocalDateStr())

  try {

    await Health.queryAggregated({

      dataType: 'calories',

      startDate,

      endDate,

      bucket: 'day',

      aggregation: 'sum',

    })

  } catch {

    return null

  }

  try {

    return await Health.checkAuthorization({ read: wearableAuthReadTypes('ios') })

  } catch {

    return null

  }

}



async function detectTodayWearableData(platform: WearablePlatform): Promise<boolean> {

  const Health = await healthPlugin()

  if (!Health) return false

  const { startDate, endDate } = localDayIsoRange(toLocalDateStr())

  try {

    const [caloriesAgg, workouts] = await Promise.all([
      healthQuery(
        Health.queryAggregated({
          dataType: 'calories',
          startDate,
          endDate,
          bucket: 'day',
          aggregation: 'sum',
        }),
        { samples: [] }
      ),
      healthQuery(
        Health.queryWorkouts({ startDate, endDate, limit: 5 }),
        { workouts: [] }
      ),
    ])

    if (sumAggregatedKcal(caloriesAgg.samples) > 0) return true

    return (workouts.workouts?.length || 0) > 0

  } catch {

    return false

  }

}



function authDelayMs(platform: WearablePlatform): number {

  return platform === 'android' ? 600 : 400

}



async function resolveWearableConnected(

  platform: WearablePlatform,

  auth: HealthAuthPayload | null | undefined

): Promise<{ connected: boolean; authorizedTypes: string[] }> {

  const authorizedTypes = auth?.readAuthorized || []

  if (wearableConnectedFromAuth(auth, platform)) {

    return { connected: true, authorizedTypes }

  }

  // Android: only explicit HC permissions count — empty queries used to false-positive "connected".

  if (platform === 'android') {

    return { connected: false, authorizedTypes }

  }

  const recheck = await recheckIosAuthAfterProbe()

  const iosOk = wearableConnectedFromAuth(recheck, 'ios')

  return {

    connected: iosOk,

    authorizedTypes: recheck?.readAuthorized || authorizedTypes,

  }

}



export async function getWearableConnectionStatus(
  options?: WearableStatusOptions
): Promise<WearableConnectionStatus> {

  const platform = (Capacitor.getPlatform() || 'web') as WearablePlatform

  if (!Capacitor.isNativePlatform()) {

    return {

      platform: 'web',

      available: false,

      connected: false,

      reason: 'Solo en la app nativa (iOS / Android).',

      authorizedTypes: [],

    }

  }

  // Samsung: OS perms granted but HC SDK checkAuthorization returns empty — trust PackageManager.
  if (platform === 'android' && (await androidRuntimeHealthPermissionsGranted())) {
    const hasTodayWearableData =
      !options?.skipTodayProbe
        ? await healthQuery(detectTodayWearableData('android'), false, HC_QUERY_TIMEOUT_MS)
        : false
    return {
      platform: 'android',
      available: true,
      connected: true,
      authorizedTypes: [...ANDROID_HC_PROBE_TYPES],
      hasTodayWearableData,
      reason: hasTodayWearableData
        ? undefined
        : 'Permisos OK, pero sin calorías del reloj hoy. Revisa Health Sync (Huawei) o Samsung Health → Health Connect.',
    }
  }

  const Health = await healthPlugin()

  if (!Health) {

    return {

      platform,

      available: false,

      connected: false,

      reason: 'Plugin de salud no cargado. Cierra y abre la app o reinstala el APK.',

      authorizedTypes: [],

    }

  }



  let availability: { available: boolean; reason?: string }

  try {

    availability =
      platform === 'android'
        ? await healthQuery(
            Health.isAvailable(),
            { available: true },
            HC_ANDROID_AVAIL_TIMEOUT_MS
          )
        : await healthQuery(
            Health.isAvailable(),
            { available: false, reason: 'HealthKit no disponible.' },
            HC_AUTH_TIMEOUT_MS
          )

  } catch (e) {

    const msg = e && typeof e === 'object' && 'message' in e ? String((e as Error).message) : ''

    return {

      platform,

      available: false,

      connected: false,

      reason: msg || 'Salud no disponible en este dispositivo.',

      authorizedTypes: [],

      needsHealthConnectInstall: platform === 'android',

    }

  }



  if (!availability.available) {

    const reason =

      availability.reason ||

      (platform === 'android'

        ? 'Instala o actualiza Health Connect desde Play Store.'

        : 'HealthKit no disponible en este dispositivo.')

    return {

      platform,

      available: false,

      connected: false,

      reason,

      authorizedTypes: [],

      needsHealthConnectInstall: platform === 'android',

    }

  }



  let auth: HealthAuthPayload = {}

  try {

    auth = await healthQuery(
      Health.checkAuthorization({
        read: wearableAuthReadTypes(platform),
      }),
      {},
      HC_AUTH_TIMEOUT_MS
    )

  } catch (e) {

    const msg = e && typeof e === 'object' && 'message' in e ? String((e as Error).message) : ''

    return {

      platform,

      available: true,

      connected: false,

      reason: msg || 'No se pudo comprobar permisos de salud.',

      authorizedTypes: [],

    }

  }



  let { connected, authorizedTypes } = await resolveWearableConnected(platform, auth)
  const enhanced = await enhanceAndroidConnection(platform, connected, authorizedTypes)
  connected = enhanced.connected
  authorizedTypes = enhanced.authorizedTypes

  const hasTodayWearableData =
    connected && !options?.skipTodayProbe
      ? await healthQuery(detectTodayWearableData(platform), false, HC_QUERY_TIMEOUT_MS)
      : false

  return {

    platform,

    available: true,

    connected,

    authorizedTypes,

    hasTodayWearableData,

    reason: connected

      ? hasTodayWearableData

        ? undefined

        : platform === 'android'

          ? 'Permisos OK, pero sin calorías del reloj hoy. Revisa Health Sync (Huawei) o Samsung Health → Health Connect.'

          : 'Permisos OK, pero sin datos del reloj hoy. Entrena y espera 1–2 min.'

      : platform === 'ios'

        ? 'Abre Ajustes → Salud → EntrenaMatch y activa Calorías activas y Frecuencia cardíaca.'

        : 'Abre Health Connect → Permisos de apps → EntrenaMatch → activa Calorías activas.',

  }

}



function androidConnectedStatus(
  authorizedTypes: string[],
  reason?: string
): WearableConnectionStatus {
  return {
    platform: 'android',
    available: true,
    connected: true,
    authorizedTypes:
      authorizedTypes.length > 0 ? authorizedTypes : [...ANDROID_HC_PROBE_TYPES],
    hasTodayWearableData: false,
    reason:
      reason ||
      'Permisos OK en Health Connect. Si no ves calorías, revisa Health Sync (Huawei) o Samsung Health.',
  }
}

async function resolveAndroidWearableConnect(
  Health: NonNullable<Awaited<ReturnType<typeof healthPlugin>>>
): Promise<WearableConnectionStatus | null> {
  const auth = await healthQuery(
    Health.requestAuthorization({ read: wearableAuthReadTypes('android') }),
    { readAuthorized: [], readDenied: [] },
    12_000
  )
  let { connected, authorizedTypes } = await resolveWearableConnected('android', auth)
  const enhanced = await enhanceAndroidConnection('android', connected, authorizedTypes)
  if (enhanced.connected) {
    return androidConnectedStatus(enhanced.authorizedTypes)
  }
  if (await androidHealthApiReachable()) {
    return androidConnectedStatus(enhanced.authorizedTypes)
  }
  return null
}

export async function connectWearableHealth(): Promise<WearableConnectionStatus> {
  const platform = (Capacitor.getPlatform() || 'web') as WearablePlatform

  if (!Capacitor.isNativePlatform()) {
    return {
      platform: 'web',
      available: false,
      connected: false,
      reason: 'Solo en la app nativa (iOS / Android).',
      authorizedTypes: [],
    }
  }

  const Health = await healthPlugin()
  if (!Health) {
    return {
      platform,
      available: false,
      connected: false,
      reason: 'Plugin de salud no cargado. Cierra y abre EntrenaMatch.',
      authorizedTypes: [],
    }
  }

  // Android: OS runtime perms are the source of truth on Samsung (HC SDK often lies).
  if (platform === 'android') {
    if (await androidRuntimeHealthPermissionsGranted()) {
      return androidConnectedStatus([...ANDROID_HC_PROBE_TYPES])
    }
    const androidStatus = await resolveAndroidWearableConnect(Health)
    if (androidStatus) return androidStatus
  }

  const status = await getWearableConnectionStatus({ skipTodayProbe: true })
  if (!status.available) return status
  if (status.connected) return status

  let auth: HealthAuthPayload = {}
  try {
    auth = await healthQuery(
      Health.requestAuthorization({
        read: wearableAuthReadTypes(status.platform),
      }),
      { readAuthorized: [], readDenied: [] },
      HC_CONNECT_AUTH_TIMEOUT_MS
    )
  } catch (e) {
    const msg = e && typeof e === 'object' && 'message' in e ? String((e as Error).message) : ''
    return {
      ...status,
      connected: false,
      reason:
        msg ||
        (status.platform === 'android'
          ? 'No se abrió Health Connect. Instálalo desde Play Store e inténtalo de nuevo.'
          : 'No se pudo pedir acceso a Salud.'),
      needsHealthConnectInstall: status.platform === 'android' && /health connect/i.test(msg),
    }
  }

  await new Promise((r) => setTimeout(r, authDelayMs(status.platform)))

  let { connected, authorizedTypes } = await resolveWearableConnected(status.platform, auth)
  if (!connected) {
    const recheck = await healthQuery(
      Health.checkAuthorization({ read: wearableAuthReadTypes(status.platform) }),
      {},
      8_000
    )
    const resolved = await resolveWearableConnected(status.platform, recheck)
    connected = resolved.connected
    authorizedTypes = resolved.authorizedTypes
  }

  const enhanced = await enhanceAndroidConnection(status.platform, connected, authorizedTypes)
  connected = enhanced.connected
  authorizedTypes = enhanced.authorizedTypes

  return {
    platform: status.platform,
    available: true,
    connected,
    authorizedTypes,
    hasTodayWearableData: false,
    reason: connected
      ? status.platform === 'android'
        ? 'Permisos OK en Health Connect. Si no ves calorías, revisa Health Sync (Huawei) o Samsung Health.'
        : undefined
      : status.platform === 'ios'
        ? 'Si ya autorizaste, activa Calorías activas en Ajustes → Salud → EntrenaMatch.'
        : 'En Health Connect: permisos de EntrenaMatch + que tu app del reloj sincronice datos.',
  }
}



/** Opens EntrenaMatch permissions in Health Connect (Android). */
export async function openWearableAppPermissions(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return
  await ensureHealthPluginReady()
  const native = getEntrenamatchHealth()
  if (native) {
    await withTimeout(native.openAppHealthPermissions(), 8_000, 'open app health permissions timeout')
    return
  }
  throw new Error('Plugin de navegación de salud no cargado')
}

export async function openWearableSettings(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return
  await ensureHealthPluginReady()

  const native = getEntrenamatchHealth()
  if (native) {
    try {
      await withTimeout(native.openAppHealthPermissions(), 8_000, 'open app health permissions timeout')
      return
    } catch {
      /* fall through */
    }
    await withTimeout(native.openHealthConnectSettings(), 8_000, 'open health connect settings timeout')
    return
  }

  const Health = getCapacitorHealth()
  if (!Health) throw new Error('Plugin de salud no cargado')
  await withTimeout(Health.openHealthConnectSettings(), 8_000, 'open health connect settings timeout')
}



export async function openHealthConnectInstall(): Promise<void> {

  if (Capacitor.getPlatform() !== 'android') return

  const Browser = getCapacitorBrowser()

  if (Browser) {

    await Browser.open({ url: HEALTH_CONNECT_PLAY_URL })

    return

  }

  window.open(HEALTH_CONNECT_PLAY_URL, '_blank', 'noopener,noreferrer')

}



export async function fetchWearableDaySummary(
  dateStr: string,
  options?: FetchWearableDayOptions
): Promise<WearableDaySummary> {

  const { startDate, endDate } = localDayIsoRange(dateStr)

  const empty: WearableDaySummary = {

    date: dateStr,

    activeCaloriesKcal: 0,

    steps: 0,

    exerciseMinutes: 0,

    workoutCount: 0,

    sources: [],

  }

  let androidNativeSummary: WearableDaySummary | null = null
  if (Capacitor.getPlatform() === 'android') {
    androidNativeSummary = await fetchWearableDaySummaryAndroidNative(dateStr)
    if (androidNativeSummary && probeSummaryHasData(androidNativeSummary)) {
      return androidNativeSummary
    }
  }

  const finalize = (summary: WearableDaySummary): WearableDaySummary => {
    if (probeSummaryHasData(summary)) return summary
    if (androidNativeSummary && probeSummaryHasData(androidNativeSummary)) return androidNativeSummary
    return summary
  }

  let platform: WearablePlatform
  if (options?.assumeConnected) {
    platform =
      options.platform || ((Capacitor.getPlatform() || 'android') as WearablePlatform)
  } else {
    const status = await getWearableConnectionStatus({ skipTodayProbe: true })
    if (!status.connected) return finalize(empty)
    platform = status.platform
  }

  const Health = await healthPlugin()

  if (!Health) return finalize(empty)

  const workoutLimit = options?.workoutLimit ?? 15
  const queryMs = options?.fastImport ? 8_000 : HC_QUERY_TIMEOUT_MS

  // Auto-sync fallback (native probe already tried on Android).
  if (options?.fastImport && options?.autoSync) {
    const queryMs = 8_000
    const limit = Math.min(options.workoutLimit ?? 5, 5)

    const workouts = await healthQuery(
      Health.queryWorkouts({ startDate, endDate, limit }),
      { workouts: [] },
      10_000
    )
    const wSummary = summarizeHealthWorkouts(workouts.workouts || [])

    const stepsAgg = await healthQuery(
      Health.queryAggregated({
        dataType: 'steps',
        startDate,
        endDate,
        bucket: 'day',
        aggregation: 'sum',
      }),
      { samples: [] },
      queryMs
    )

    let activeCaloriesKcal = wSummary.activeCaloriesKcal
    if (activeCaloriesKcal <= 0) {
      const caloriesAgg = await healthQuery(
        Health.queryAggregated({
          dataType: 'calories',
          startDate,
          endDate,
          bucket: 'day',
          aggregation: 'sum',
        }),
        { samples: [] },
        queryMs
      )
      activeCaloriesKcal = sumAggregatedKcal(caloriesAgg.samples)
    }

    return finalize({
      ...empty,
      steps: sumAggregatedCount(stepsAgg.samples),
      activeCaloriesKcal,
      exerciseMinutes: wSummary.exerciseMinutes,
      workoutCount: wSummary.workoutCount,
      sources: wSummary.sources,
    })
  }

  // Manual import: sequential reads (still faster than hanging parallel batch on Samsung).
  if (options?.fastImport) {
    const limit = options.workoutLimit ?? 5
    const calMs = platform === 'android' ? 18_000 : 12_000
    const caloriesAgg = await healthQuery(
      Health.queryAggregated({
        dataType: 'calories',
        startDate,
        endDate,
        bucket: 'day',
        aggregation: 'sum',
      }),
      { samples: [] },
      calMs
    )
    let activeCaloriesKcal = sumAggregatedKcal(caloriesAgg.samples)
    const stepsAgg = await healthQuery(
      Health.queryAggregated({
        dataType: 'steps',
        startDate,
        endDate,
        bucket: 'day',
        aggregation: 'sum',
      }),
      { samples: [] },
      12_000
    )
    const workouts = await healthQuery(
      Health.queryWorkouts({ startDate, endDate, limit }),
      { workouts: [] },
      10_000
    )
    if (activeCaloriesKcal <= 0) {
      const totalAgg = await healthQuery(
        Health.queryAggregated({
          dataType: 'totalCalories',
          startDate,
          endDate,
          bucket: 'day',
          aggregation: 'sum',
        }),
        { samples: [] },
        8_000
      )
      activeCaloriesKcal = sumAggregatedKcal(totalAgg.samples)
    }
    const steps = sumAggregatedCount(stepsAgg.samples)
    const wSummary = summarizeHealthWorkouts(workouts.workouts || [])
    if (activeCaloriesKcal <= 0 && wSummary.activeCaloriesKcal > 0) {
      activeCaloriesKcal = wSummary.activeCaloriesKcal
    }
    return finalize({
      ...empty,
      activeCaloriesKcal,
      steps,
      exerciseMinutes: wSummary.exerciseMinutes,
      workoutCount: wSummary.workoutCount,
      sources: wSummary.sources,
    })
  }

  const caloriesAgg = await healthQuery(
    Health.queryAggregated({
      dataType: 'calories',
      startDate,
      endDate,
      bucket: 'day',
      aggregation: 'sum',
    }),
    { samples: [] },
    queryMs
  )

  let activeCaloriesKcal = sumAggregatedKcal(caloriesAgg.samples)

  if (activeCaloriesKcal <= 0) {
    const totalAgg = await healthQuery(
      Health.queryAggregated({
        dataType: 'totalCalories',
        startDate,
        endDate,
        bucket: 'day',
        aggregation: 'sum',
      }),
      { samples: [] },
      queryMs
    )
    activeCaloriesKcal = sumAggregatedKcal(totalAgg.samples)
  }

  const [exerciseAgg, stepsAgg, workouts] = await Promise.all([
    platform === 'ios'
      ? healthQuery(
          Health.queryAggregated({
            dataType: 'exerciseTime',
            startDate,
            endDate,
            bucket: 'day',
            aggregation: 'sum',
          }),
          { samples: [] }
        )
      : Promise.resolve({ samples: [] }),
    healthQuery(
      Health.queryAggregated({
        dataType: 'steps',
        startDate,
        endDate,
        bucket: 'day',
        aggregation: 'sum',
      }),
      { samples: [] },
      queryMs
    ),
    healthQuery(
      Health.queryWorkouts({ startDate, endDate, limit: workoutLimit }),
      { workouts: [] },
      queryMs
    ),
  ])

  if (activeCaloriesKcal <= 0) {
    const sampleRead = await healthQuery(
      Health.readSamples({
        dataType: 'calories',
        startDate,
        endDate,
        limit: 40,
      }),
      { samples: [] },
      queryMs
    )
    activeCaloriesKcal = Math.round(
      (sampleRead.samples || []).reduce((sum, s) => sum + (Number(s.value) || 0), 0)
    )
  }



  const wSummary = summarizeHealthWorkouts(workouts.workouts || [])
  let exerciseMinutes = sumExerciseMinutes(exerciseAgg.samples)
  if (exerciseMinutes <= 0) exerciseMinutes = wSummary.exerciseMinutes
  if (activeCaloriesKcal <= 0 && wSummary.activeCaloriesKcal > 0) {
    activeCaloriesKcal = wSummary.activeCaloriesKcal
  }

  return finalize({

    date: dateStr,

    activeCaloriesKcal,

    steps: sumAggregatedCount(stepsAgg.samples),

    exerciseMinutes,

    workoutCount: wSummary.workoutCount,

    sources: wSummary.sources,

  })

}



const EMPTY_SESSION: WearableSessionSnapshot = {

  activeCaloriesKcal: 0,

  exerciseMinutes: 0,

  workoutDetected: false,

  source: 'none',

  capturedAt: Date.now(),

}



/** W1b — metrics from wearable for an EntrenaSync time window. */

export async function fetchWearableSessionSummary(

  startMs: number,

  endMs: number

): Promise<WearableSessionSnapshot> {

  const end = endMs > 0 ? endMs : Date.now()

  const start = startMs > 0 ? startMs : end - 15 * 60 * 1000

  if (end <= start) return { ...EMPTY_SESSION, capturedAt: end }



  const status = await getWearableConnectionStatus()

  if (!status.connected) return { ...EMPTY_SESSION, capturedAt: end }



  const Health = await healthPlugin()

  if (!Health) return { ...EMPTY_SESSION, capturedAt: end }



  const { startDate, endDate } = sessionIsoRange(start, end)

  const source: WearableSessionSnapshot['source'] =

    status.platform === 'ios' ? 'apple_health' : 'health_connect'



  const exerciseQuery =

    status.platform === 'ios'

      ? Health.queryAggregated({

          dataType: 'exerciseTime',

          startDate,

          endDate,

          bucket: 'hour',

          aggregation: 'sum',

        }).catch(() => ({ samples: [] }))

      : Promise.resolve({ samples: [] })



  const [caloriesAgg, exerciseAgg, hrSamples, workouts] = await Promise.all([

    Health.queryAggregated({

      dataType: 'calories',

      startDate,

      endDate,

      bucket: 'hour',

      aggregation: 'sum',

    }).catch(() => ({ samples: [] })),

    exerciseQuery,

    Health.readSamples({

      dataType: 'heartRate',

      startDate,

      endDate,

      limit: 200,

    }).catch(() => ({ samples: [] })),

    Health.queryWorkouts({ startDate, endDate, limit: 20 }).catch(() => ({ workouts: [] })),

  ])



  let activeCaloriesKcal = sumAggregatedKcal(caloriesAgg.samples)

  if (activeCaloriesKcal <= 0) {

    const totalAgg = await Health.queryAggregated({

      dataType: 'totalCalories',

      startDate,

      endDate,

      bucket: 'hour',

      aggregation: 'sum',

    }).catch(() => ({ samples: [] }))

    activeCaloriesKcal = sumAggregatedKcal(totalAgg.samples)

  }



  const { avg, max } = heartRateStats(hrSamples.samples)

  const workoutDetected = workoutOverlapsSession(workouts.workouts, start, end)



  return {

    activeCaloriesKcal,

    exerciseMinutes: sumExerciseMinutes(exerciseAgg.samples),

    heartRateAvg: avg > 0 ? avg : undefined,

    heartRateMax: max > 0 ? max : undefined,

    workoutDetected,

    source,

    capturedAt: end,

  }

}



/** W1b — latest heart rate BPM during an active sync (for Arena live strip). */

export async function fetchWearableLiveHeartRate(

  sinceMs: number

): Promise<number | null> {

  const status = await getWearableConnectionStatus()

  if (!status.connected) return null

  const Health = await healthPlugin()

  if (!Health) return null



  const { startDate, endDate } = sessionIsoRange(sinceMs, Date.now())

  const { samples } = await Health.readSamples({

    dataType: 'heartRate',

    startDate,

    endDate,

    limit: 5,

  }).catch(() => ({ samples: [] }))



  if (!samples?.length) return null

  const latest = [...samples].sort(

    (a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime()

  )[0]

  const bpm = Math.round(Number(latest?.value) || 0)

  return bpm > 30 && bpm < 250 ? bpm : null

}


