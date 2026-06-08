/**
 * Phase 80 — Health Connect / Apple Health import stub.
 * Future: Capacitor plugin @capacitor-community/health or custom native bridge.
 */

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
  message: string
}

export async function importHealthCaloriesForDate(
  _dateStr: string
): Promise<HealthImportResult> {
  const isNative =
    typeof window !== 'undefined' &&
    typeof (window as { Capacitor?: unknown }).Capacitor !== 'undefined'

  return {
    available: false,
    samples: [],
    totalBurnKcal: 0,
    message: isNative
      ? 'Health Connect / Apple Health — próximamente en fase 80+. Usa el balance MET por ahora.'
      : 'Importación de wearables disponible solo en la app nativa.',
  }
}

export function mergeHealthBurnWithBalance(
  metBurnKcal: number,
  healthBurnKcal: number
): number {
  if (healthBurnKcal <= 0) return metBurnKcal
  return Math.max(metBurnKcal, healthBurnKcal)
}
