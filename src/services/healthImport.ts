/**
 * W1a — Import active calories from Apple Health / Health Connect into Fuel balance.
 */

import { Capacitor } from '@capacitor/core'
import { ensureHealthPluginReady } from '../utils/capacitorRuntimePlugins'
import { OperationTimeoutError, withTimeout } from '../utils/withTimeout'
import {
  fetchWearableDaySummary,
  quickWearablePermissionCheck,
  type WearablePlatform,
} from './wearableHealth'

const IMPORT_FETCH_TIMEOUT_MS = 40_000

export interface HealthCalorieSample {
  kcal: number
  startTime: number
  endTime: number
  source: 'health_connect' | 'apple_health' | 'manual'
}

export interface HealthImportResult {
  available: boolean
  samples: HealthCalorieSample[]
  totalBurnKcal: number
  exerciseMinutes?: number
  workoutCount?: number
  message: string
  needsConnect?: boolean
}

function buildImportSuccess(
  summary: Awaited<ReturnType<typeof fetchWearableDaySummary>>,
  platform: WearablePlatform,
  dateStr: string
): HealthImportResult {
  const source: HealthCalorieSample['source'] =
    platform === 'ios' ? 'apple_health' : 'health_connect'
  const start = new Date(`${dateStr}T00:00:00`).getTime()
  const end = new Date(`${dateStr}T23:59:59`).getTime()

  return {
    available: true,
    samples: [
      {
        kcal: summary.activeCaloriesKcal,
        startTime: start,
        endTime: end,
        source,
      },
    ],
    totalBurnKcal: summary.activeCaloriesKcal,
    exerciseMinutes: summary.exerciseMinutes,
    workoutCount: summary.workoutCount,
    message:
      summary.sources.length > 0
        ? `Importado desde ${summary.sources.slice(0, 2).join(', ')}.`
        : `Importado desde tu wearable (${summary.activeCaloriesKcal} kcal activas).`,
  }
}

export async function importHealthCaloriesForDate(dateStr: string): Promise<HealthImportResult> {
  if (!Capacitor.isNativePlatform()) {
    return {
      available: false,
      samples: [],
      totalBurnKcal: 0,
      message: 'Conecta tu reloj desde la app en iOS o Android (no en web).',
    }
  }

  await ensureHealthPluginReady()
  const platform = (Capacitor.getPlatform() || 'android') as WearablePlatform

  // Samsung/Android: read calories FIRST — avoids isAvailable() / checkAuthorization stalls.
  let summary: Awaited<ReturnType<typeof fetchWearableDaySummary>>
  try {
    summary = await withTimeout(
      fetchWearableDaySummary(dateStr, {
        assumeConnected: true,
        platform,
        fastImport: true,
      }),
      IMPORT_FETCH_TIMEOUT_MS,
      'health import timeout'
    )
  } catch (e) {
    if (e instanceof OperationTimeoutError) {
      const perm = await quickWearablePermissionCheck(platform).catch(() => ({
        connected: false,
        authorizedTypes: [] as string[],
        reason: undefined as string | undefined,
      }))
      return {
        available: true,
        samples: [],
        totalBurnKcal: 0,
        needsConnect: !perm.connected,
        message: perm.connected
          ? 'Health Connect no respondió a tiempo. Abre la app, espera que cargue y pulsa ↻ en Actividad del reloj.'
          : perm.reason ||
            'Perfil → Conectar wearable → autoriza Calorías activas en Health Connect.',
      }
    }
    throw e
  }

  if (summary.activeCaloriesKcal > 0) {
    return buildImportSuccess(summary, platform, dateStr)
  }

  const perm = await quickWearablePermissionCheck(platform)

  if (!perm.connected) {
    return {
      available: true,
      samples: [],
      totalBurnKcal: 0,
      needsConnect: true,
      message:
        perm.reason ||
        'Perfil → Conectar wearable → autoriza Calorías activas en Health Connect.',
    }
  }

  const hint =
    summary.workoutCount > 0
      ? `${summary.workoutCount} workout(s) hoy, sin kcal activas aún — sincroniza tu reloj.`
      : platform === 'android'
        ? 'Sin calorías activas hoy en Health Connect. Huawei: abre Health Sync y sincroniza calorías → Health Connect.'
        : 'Sin calorías activas hoy. Entrena con el reloj y vuelve a importar.'

  return {
    available: true,
    samples: [],
    totalBurnKcal: 0,
    exerciseMinutes: summary.exerciseMinutes,
    workoutCount: summary.workoutCount,
    message: hint,
  }
}

export function mergeHealthBurnWithBalance(
  metBurnKcal: number,
  healthBurnKcal: number
): number {
  if (healthBurnKcal <= 0) return metBurnKcal
  return Math.max(metBurnKcal, healthBurnKcal)
}
