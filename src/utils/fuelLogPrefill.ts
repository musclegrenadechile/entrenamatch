export interface FuelLogPrefill {
  mealLabel?: string
  description?: string
  contextHint?: string
  suggestedKcal?: number
  suggestedProteinG?: number
  suggestedCarbsG?: number
  suggestedFatG?: number
}

export interface WorkoutSaveFuelContext {
  title: string
  burnKcal?: number
  fuelTip?: string
  sessionSummary?: string
  fuelBalanceHint?: string
}

export type FuelLogPrefillMacros = {
  kcal: number | null
  proteinG: number | null
  carbsG: number | null
  fatG: number | null
}

export function hasWorkoutFuelMacroPrefill(prefill?: FuelLogPrefill | null): boolean {
  return !!(prefill?.suggestedKcal && prefill.suggestedKcal > 0)
}

export function extractFuelLogPrefillMacros(
  prefill?: FuelLogPrefill | null
): FuelLogPrefillMacros | null {
  if (!hasWorkoutFuelMacroPrefill(prefill)) return null
  return {
    kcal: prefill!.suggestedKcal ?? null,
    proteinG: prefill!.suggestedProteinG ?? null,
    carbsG: prefill!.suggestedCarbsG ?? null,
    fatG: prefill!.suggestedFatG ?? null,
  }
}

/** Chip «Sugerido del entreno» en Fuel log (oleada 393–394). */
export function buildWorkoutFuelPrefillChipLabel(prefill?: FuelLogPrefill | null): string | null {
  if (!hasWorkoutFuelMacroPrefill(prefill)) return null
  const parts = [`~${prefill!.suggestedKcal} kcal`]
  if (prefill!.suggestedProteinG && prefill!.suggestedProteinG > 0) {
    parts.push(`${prefill!.suggestedProteinG}g proteína`)
  }
  return `Sugerido del entreno · ${parts.join(' · ')}`
}

/** Heuristic post-workout meal macros from session burn. */
export function suggestPostWorkoutMacros(burnKcal?: number): Pick<
  FuelLogPrefill,
  'suggestedKcal' | 'suggestedProteinG' | 'suggestedCarbsG' | 'suggestedFatG'
> {
  if (!burnKcal || burnKcal <= 0) return {}
  const kcal = Math.min(650, Math.max(320, Math.round(burnKcal * 0.5)))
  const proteinG = Math.round((kcal * 0.3) / 4)
  const fatG = Math.round((kcal * 0.2) / 9)
  const carbsG = Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4))
  return { suggestedKcal: kcal, suggestedProteinG: proteinG, suggestedCarbsG: carbsG, suggestedFatG: fatG }
}

/** Deep link desde banner post-guardar → Fuel log modal. */
export function buildFuelLogPrefillFromWorkoutSave(
  ctx: WorkoutSaveFuelContext
): FuelLogPrefill {
  const parts = [
    ctx.sessionSummary,
    ctx.fuelBalanceHint,
    ctx.fuelTip,
    ctx.burnKcal && ctx.burnKcal > 0
      ? `~${ctx.burnKcal} kcal en «${ctx.title}»`
      : `Entreno «${ctx.title}»`,
  ].filter(Boolean)

  const macros = suggestPostWorkoutMacros(ctx.burnKcal)

  return {
    mealLabel: 'Post-entreno',
    description: parts.join(' · '),
    contextHint: ctx.fuelBalanceHint || ctx.fuelTip,
    ...macros,
  }
}