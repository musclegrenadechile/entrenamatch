/** Hitos E2E entreno guardado → banner Fuel → modal log (oleadas 380, 392). */
export const E2E_WORKOUT_FUEL_FLOW_IDS = [
  'workout-save',
  'banner-visible',
  'banner-session-summary',
  'banner-fuel-balance',
  'fuel-cta',
  'fuel-modal',
  'fuel-prefill',
  'fuel-macro-prefill',
  'fuel-prefill-harness',
] as const

export type E2EWorkoutFuelFlowId = (typeof E2E_WORKOUT_FUEL_FLOW_IDS)[number]

export function isWorkoutFuelFlowComplete(completed: readonly string[]): boolean {
  return E2E_WORKOUT_FUEL_FLOW_IDS.every((id) => completed.includes(id))
}