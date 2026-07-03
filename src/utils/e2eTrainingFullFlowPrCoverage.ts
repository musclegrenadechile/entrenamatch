/** Inventario E2E tono PR×training-full-flow — 1 spec (oleada 450). */

export type E2ETrainingFullFlowPrCover = 'full-flow-review-pr' | 'harness' | 'aria'

export type E2ETrainingFullFlowPrSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2ETrainingFullFlowPrCover[]
}

export const E2E_TRAINING_FULL_FLOW_PR_SPECS: readonly E2ETrainingFullFlowPrSpecEntry[] = [
  {
    id: 'training-full-flow',
    file: 'e2e/training-full-flow.spec.ts',
    oleada: 450,
    covers: ['full-flow-review-pr', 'harness', 'aria'],
  },
] as const

export function countE2ETrainingFullFlowPrSpecs(): number {
  return E2E_TRAINING_FULL_FLOW_PR_SPECS.length
}

export function e2eTrainingFullFlowPrBlockRange(): { from: number; to: number } {
  return { from: 450, to: 450 }
}

export function isTrainingFullFlowPrCoverageComplete(): boolean {
  return E2E_TRAINING_FULL_FLOW_PR_SPECS.every((s) =>
    s.covers.includes('full-flow-review-pr')
  )
}

export function trainingFullFlowPrSpecFileBasenames(): string[] {
  return E2E_TRAINING_FULL_FLOW_PR_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}