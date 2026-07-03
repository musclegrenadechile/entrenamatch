/** Contrato UI del banner post-guardar (oleadas 362, 390–392). */

import { suggestPostWorkoutMacros } from './fuelLogPrefill'

export const WORKOUT_SAVE_BANNER_SESSION_CLASS = 'em-v2-training-save-banner__session'
export const WORKOUT_SAVE_BANNER_FUEL_CLASS = 'em-v2-training-save-banner__fuel'

export function hasWorkoutSaveBannerSessionSummary(
  summary?: string | null
): summary is string {
  return typeof summary === 'string' && summary.trim().length > 0
}

/** Línea compacta Fuel sugerido + proteína restante hoy (oleada 392). */
export function buildWorkoutSaveBannerFuelHint(opts: {
  burnKcal?: number
  proteinRemainingG?: number
}): string | undefined {
  const { suggestedKcal, suggestedProteinG } = suggestPostWorkoutMacros(opts.burnKcal)
  const parts: string[] = []
  if (suggestedKcal && suggestedKcal > 0) parts.push(`~${suggestedKcal} kcal`)
  if (suggestedProteinG && suggestedProteinG > 0) parts.push(`${suggestedProteinG}g proteína`)

  const proteinLeft =
    opts.proteinRemainingG != null && opts.proteinRemainingG > 5
      ? Math.round(opts.proteinRemainingG)
      : null

  if (parts.length === 0 && proteinLeft == null) return undefined

  const suggested = parts.length > 0 ? `Fuel sugerido: ${parts.join(' · ')}` : undefined
  if (proteinLeft != null) {
    const suffix = `Faltan ~${proteinLeft}g P hoy`
    return suggested ? `${suggested} · ${suffix}` : suffix
  }
  return suggested
}