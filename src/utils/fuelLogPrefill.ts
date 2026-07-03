export interface FuelLogPrefill {
  mealLabel?: string
  description?: string
  contextHint?: string
}

export interface WorkoutSaveFuelContext {
  title: string
  burnKcal?: number
  fuelTip?: string
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
  }
}