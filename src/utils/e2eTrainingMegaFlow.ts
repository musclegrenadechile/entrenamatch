/** Mega E2E: entreno → Fuel → sync → reseña (oleada 381, PR oleada 452 / training-mega-flow.spec.ts). */
export const E2E_TRAINING_MEGA_FLOW_IDS = [
  'workout-open',
  'workout-save',
  'banner-visible',
  'banner-fuel-hint',
  'plan-history-hint',
  'plan-rotation-note',
  'plan-rotation-chip',
  'plan-fuel-week-hint',
  'plan-fuel-headline',
  'plan-fuel-nutrition',
  'fuel-prefill',
  'fuel-macro-prefill',
  'fuel-close',
  'sync-live',
  'sync-arena',
  'sync-close',
  'review-open',
  'review-pr-tone',
  'review-pr-aria',
  'review-submit',
  'shell-stable',
] as const

export type E2ETrainingMegaFlowId = (typeof E2E_TRAINING_MEGA_FLOW_IDS)[number]

export function isTrainingMegaFlowComplete(completed: readonly string[]): boolean {
  return E2E_TRAINING_MEGA_FLOW_IDS.every((id) => completed.includes(id))
}