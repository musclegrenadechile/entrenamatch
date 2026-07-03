/** Inventario E2E tono PR×training-mega-flow — 1 spec (oleada 452). */

export type E2ETrainingMegaFlowPrCover = 'mega-flow-review-pr' | 'harness' | 'aria'

export type E2ETrainingMegaFlowPrSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2ETrainingMegaFlowPrCover[]
}

export const E2E_TRAINING_MEGA_FLOW_PR_SPECS: readonly E2ETrainingMegaFlowPrSpecEntry[] = [
  {
    id: 'training-mega-flow',
    file: 'e2e/training-mega-flow.spec.ts',
    oleada: 452,
    covers: ['mega-flow-review-pr', 'harness', 'aria'],
  },
] as const

export function countE2ETrainingMegaFlowPrSpecs(): number {
  return E2E_TRAINING_MEGA_FLOW_PR_SPECS.length
}

export function e2eTrainingMegaFlowPrBlockRange(): { from: number; to: number } {
  return { from: 452, to: 452 }
}

export function isTrainingMegaFlowPrCoverageComplete(): boolean {
  return E2E_TRAINING_MEGA_FLOW_PR_SPECS.every((s) =>
    s.covers.includes('mega-flow-review-pr')
  )
}

export function trainingMegaFlowPrSpecFileBasenames(): string[] {
  return E2E_TRAINING_MEGA_FLOW_PR_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}