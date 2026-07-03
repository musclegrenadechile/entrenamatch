/** Hitos E2E entreno guardado → banner Fuel → modal log (oleada 380). */
export const E2E_WORKOUT_FUEL_FLOW_IDS = [
  'workout-save',
  'banner-visible',
  'fuel-cta',
  'fuel-modal',
  'fuel-prefill',
] as const

export type E2EWorkoutFuelFlowId = (typeof E2E_WORKOUT_FUEL_FLOW_IDS)[number]

export function isWorkoutFuelFlowComplete(completed: readonly string[]): boolean {
  return E2E_WORKOUT_FUEL_FLOW_IDS.every((id) => completed.includes(id))
}