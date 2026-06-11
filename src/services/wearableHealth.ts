/**
 * W1a/W1b — Apple Health / Health Connect via @capgo/capacitor-health (native only).
 */

import { Capacitor } from '@capacitor/core'
import type { WearableSessionSnapshot } from '../types'
import { ensureCapacitorPlugins, getCapacitorHealth } from '../utils/capacitorRuntimePlugins'
import {
  isWearableAuthorizationGranted,
  localDayIsoRange,
  sumAggregatedKcal,
  sumExerciseMinutes,
} from '../utils/wearableDayMetrics'
import {
  heartRateStats,
  sessionIsoRange,
  workoutOverlapsSession,
} from '../utils/wearableSessionMetrics'

export const WEARABLE_READ_TYPES = [
  'calories',
  'exerciseTime',
  'heartRate',
  'workouts',
] as const

export type WearablePlatform = 'ios' | 'android' | 'web'

export type WearableConnectionStatus = {
  platform: WearablePlatform
  available: boolean
  connected: boolean
  reason?: string
  authorizedTypes: string[]
}

export type WearableDaySummary = {
  date: string
  activeCaloriesKcal: number
  exerciseMinutes: number
  workoutCount: number
  sources: string[]
}

async function healthPlugin() {
  if (!Capacitor.isNativePlatform()) return null
  await ensureCapacitorPlugins()
  return getCapacitorHealth()
}

export async function getWearableConnectionStatus(): Promise<WearableConnectionStatus> {
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
      reason: 'Plugin de salud no cargado. Actualiza la app.',
      authorizedTypes: [],
    }
  }

  const availability = await Health.isAvailable()
  if (!availability.available) {
    return {
      platform,
      available: false,
      connected: false,
      reason:
        availability.reason ||
        (platform === 'android'
          ? 'Instala Health Connect desde Play Store.'
          : 'HealthKit no disponible en este dispositivo.'),
      authorizedTypes: [],
    }
  }

  const auth = await Health.checkAuthorization({
    read: [...WEARABLE_READ_TYPES],
  })

  return {
    platform,
    available: true,
    connected: isWearableAuthorizationGranted(auth.readAuthorized),
    authorizedTypes: auth.readAuthorized || [],
    reason: isWearableAuthorizationGranted(auth.readAuthorized)
      ? undefined
      : 'Conecta Apple Health o Health Connect para importar tu gasto.',
  }
}

export async function connectWearableHealth(): Promise<WearableConnectionStatus> {
  const status = await getWearableConnectionStatus()
  if (!status.available) return status

  const Health = await healthPlugin()
  if (!Health) {
    return {
      ...status,
      connected: false,
      reason: 'Plugin de salud no disponible.',
    }
  }

  if (Capacitor.getPlatform() === 'android') {
    try {
      await Health.showPrivacyPolicy()
    } catch {
      /* optional */
    }
  }

  await Health.requestAuthorization({
    read: [...WEARABLE_READ_TYPES],
  })

  return getWearableConnectionStatus()
}

export async function openWearableSettings(): Promise<void> {
  const Health = await healthPlugin()
  if (!Health) return
  if (Capacitor.getPlatform() === 'android') {
    await Health.openHealthConnectSettings()
  }
}

export async function fetchWearableDaySummary(dateStr: string): Promise<WearableDaySummary> {
  const { startDate, endDate } = localDayIsoRange(dateStr)
  const empty: WearableDaySummary = {
    date: dateStr,
    activeCaloriesKcal: 0,
    exerciseMinutes: 0,
    workoutCount: 0,
    sources: [],
  }

  const status = await getWearableConnectionStatus()
  if (!status.connected) return empty

  const Health = await healthPlugin()
  if (!Health) return empty

  const [caloriesAgg, exerciseAgg, workouts] = await Promise.all([
    Health.queryAggregated({
      dataType: 'calories',
      startDate,
      endDate,
      bucket: 'day',
      aggregation: 'sum',
    }).catch(() => ({ samples: [] })),
    Health.queryAggregated({
      dataType: 'exerciseTime',
      startDate,
      endDate,
      bucket: 'day',
      aggregation: 'sum',
    }).catch(() => ({ samples: [] })),
    Health.queryWorkouts({ startDate, endDate, limit: 50 }).catch(() => ({ workouts: [] })),
  ])

  let activeCaloriesKcal = sumAggregatedKcal(caloriesAgg.samples)
  if (activeCaloriesKcal <= 0) {
    const totalAgg = await Health.queryAggregated({
      dataType: 'totalCalories',
      startDate,
      endDate,
      bucket: 'day',
      aggregation: 'sum',
    }).catch(() => ({ samples: [] }))
    activeCaloriesKcal = sumAggregatedKcal(totalAgg.samples)
  }

  const sources = new Set<string>()
  for (const w of workouts.workouts || []) {
    if (w.sourceName) sources.add(w.sourceName)
  }

  return {
    date: dateStr,
    activeCaloriesKcal,
    exerciseMinutes: sumExerciseMinutes(exerciseAgg.samples),
    workoutCount: workouts.workouts?.length || 0,
    sources: Array.from(sources).slice(0, 5),
  }
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

  const [caloriesAgg, exerciseAgg, hrSamples, workouts] = await Promise.all([
    Health.queryAggregated({
      dataType: 'calories',
      startDate,
      endDate,
      bucket: 'hour',
      aggregation: 'sum',
    }).catch(() => ({ samples: [] })),
    Health.queryAggregated({
      dataType: 'exerciseTime',
      startDate,
      endDate,
      bucket: 'hour',
      aggregation: 'sum',
    }).catch(() => ({ samples: [] })),
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
