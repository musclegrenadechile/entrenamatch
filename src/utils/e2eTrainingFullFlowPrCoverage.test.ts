import { describe, expect, it } from 'vitest'
import {
  countE2ETrainingFullFlowPrSpecs,
  e2eTrainingFullFlowPrBlockRange,
  E2E_TRAINING_FULL_FLOW_PR_SPECS,
  isTrainingFullFlowPrCoverageComplete,
  trainingFullFlowPrSpecFileBasenames,
} from './e2eTrainingFullFlowPrCoverage'

describe('e2eTrainingFullFlowPrCoverage', () => {
  it('inventario 1 spec training-full-flow oleada 450', () => {
    expect(countE2ETrainingFullFlowPrSpecs()).toBe(1)
    expect(E2E_TRAINING_FULL_FLOW_PR_SPECS.map((s) => s.id)).toEqual(['training-full-flow'])
    expect(trainingFullFlowPrSpecFileBasenames()).toEqual(['training-full-flow.spec.ts'])
  })

  it('bloque oleada 450 y cobertura completa', () => {
    expect(e2eTrainingFullFlowPrBlockRange()).toEqual({ from: 450, to: 450 })
    expect(isTrainingFullFlowPrCoverageComplete()).toBe(true)
  })
})