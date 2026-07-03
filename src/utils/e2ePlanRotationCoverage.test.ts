import { describe, expect, it } from 'vitest'
import {
  countE2EPlanRotationSpecs,
  E2E_PLAN_ROTATION_SPECS,
  e2ePlanRotationBlockRange,
  e2ePlanRotationSpecIds,
  isPlanRotationE2ECoverageComplete,
  unionPlanRotationCovers,
} from './e2ePlanRotationCoverage'

describe('e2ePlanRotationCoverage', () => {
  it('consolida 3 specs E2E rotación EntrenaPlan (oleada 409)', () => {
    expect(countE2EPlanRotationSpecs()).toBe(3)
    expect(e2ePlanRotationBlockRange()).toEqual({ from: 407, to: 408 })
    expect(e2ePlanRotationSpecIds()).toEqual([
      'workout-plan-history-flow',
      'training-mega-flow',
      'workout-history-flow',
    ])
  })

  it('unionPlanRotationCovers y cobertura mínima', () => {
    expect(unionPlanRotationCovers()).toEqual([
      'history-hint',
      'rotation-detail',
      'rotation-chip',
      'rotation-aria',
    ])
    const mega = E2E_PLAN_ROTATION_SPECS.find((s) => s.id === 'training-mega-flow')
    expect(isPlanRotationE2ECoverageComplete(mega?.covers ?? [])).toBe(true)
    const profile = E2E_PLAN_ROTATION_SPECS.find((s) => s.id === 'workout-history-flow')
    expect(isPlanRotationE2ECoverageComplete(profile?.covers ?? [])).toBe(true)
  })
})