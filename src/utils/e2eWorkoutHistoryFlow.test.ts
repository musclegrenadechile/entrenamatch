import { describe, expect, it } from 'vitest'
import {
  countE2EWorkoutHistoryFlowSteps,
  E2E_WORKOUT_HISTORY_FLOW_STEPS,
} from './e2eWorkoutHistoryFlow'

describe('e2eWorkoutHistoryFlow', () => {
  it('checklist historial Perfil', () => {
    expect(countE2EWorkoutHistoryFlowSteps()).toBe(5)
    expect(E2E_WORKOUT_HISTORY_FLOW_STEPS.map((s) => s.id)).toEqual([
      'wh-01',
      'wh-02',
      'wh-03',
      'wh-04',
      'wh-05',
    ])
  })
})