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
    ctx.fuelTip,
    ctx.burnKcal && ctx.burnKcal > 0
      ? `~${ctx.burnKcal} kcal en «${ctx.title}»`
      : `Entreno «${ctx.title}»`,
  ].filter(Boolean)

  return {
    mealLabel: 'Post-entreno',
    description: parts.join(' · '),
    contextHint: ctx.fuelTip,
    ...suggestPostWorkoutMacros(ctx.burnKcal),
  }
}