import { describe, expect, it } from 'vitest'
import {
  countE2EWeeklyPlanHistoryFlowSteps,
  E2E_WEEKLY_PLAN_HISTORY_FLOW_STEPS,
} from './e2eWeeklyPlanHistoryFlow'

describe('e2eWeeklyPlanHistoryFlow', () => {
  it('checklist E2E EntrenaPlan × historial', () => {
    expect(countE2EWeeklyPlanHistoryFlowSteps()).toBe(4)
    expect(E2E_WEEKLY_PLAN_HISTORY_FLOW_STEPS.map((s) => s.id)).toEqual([
      'ph-01',
      'ph-02',
      'ph-03',
      'ph-04',
    ])
  })
})