/**
 * W1a — Import active calories from Apple Health / Health Connect into Fuel balance.
 */

import { Capacitor } from '@capacitor/core'
import {
  connectWearableHealth,
  fetchWearableDaySummary,
  getWearableConnectionStatus,
} from './wearableHealth'

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

export async function importHealthCaloriesForDate(dateStr: string): Promise<HealthImportResult> {
  if (!Capacitor.isNativePlatform()) {
    return {
      available: false,
      samples: [],
      totalBurnKcal: 0,
      message: 'Conecta tu reloj desde la app en iOS o Android (no en web).',
    }
  }

  let status = await getWearableConnectionStatus()
  if (!status.available) {
    return {
      available: false,
      samples: [],
      totalBurnKcal: 0,
      message: status.reason || 'Salud no disponible en este dispositivo.',
    }
  }

  if (!status.connected) {
    status = await connectWearableHealth()
    if (!status.connected) {
      return {
        available: true,
        samples: [],
        totalBurnKcal: 0,
        needsConnect: true,
        message:
          status.reason ||
          'Permite acceso a calorías activas en Apple Health o Health Connect.',
      }
    }
  }

  const summary = await fetchWearableDaySummary(dateStr)
  const source: HealthCalorieSample['source'] =
    status.platform === 'ios' ? 'apple_health' : 'health_connect'

  if (summary.activeCaloriesKcal <= 0) {
    const hint =
      summary.workoutCount > 0
        ? `${summary.workoutCount} workout(s) hoy, sin kcal activas aún — sincroniza tu reloj.`
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

export function mergeHealthBurnWithBalance(
  metBurnKcal: number,
  healthBurnKcal: number
): number {
  if (healthBurnKcal <= 0) return metBurnKcal
  return Math.max(metBurnKcal, healthBurnKcal)
}
