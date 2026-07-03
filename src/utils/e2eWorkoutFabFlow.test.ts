import { describe, expect, it } from 'vitest'
import { countWorkoutFabFlowSteps, E2E_WORKOUT_FAB_FLOW_STEPS } from './e2eWorkoutFabFlow'

describe('e2eWorkoutFabFlow', () => {
  it('define 4 pasos FAB minimizado', () => {
    expect(countWorkoutFabFlowSteps()).toBe(4)
    expect(E2E_WORKOUT_FAB_FLOW_STEPS.map((s) => s.id)).toEqual([
      'fab-01',
      'fab-02',
      'fab-03',
      'fab-04',
    ])
  })
})