/** IDs del spec Playwright training-full-flow.spec.ts (oleada 379). */
export const E2E_TRAINING_FULL_FLOW_IDS = [
  'workout-open',
  'workout-save',
  'sync-live',
  'sync-arena',
  'sync-close',
  'review-open',
  'review-submit',
  'shell-stable',
] as const

export type E2ETrainingFullFlowId = (typeof E2E_TRAINING_FULL_FLOW_IDS)[number]

export function isTrainingFullFlowComplete(completed: readonly string[]): boolean {
  return E2E_TRAINING_FULL_FLOW_IDS.every((id) => completed.includes(id))
}