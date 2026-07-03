import { describe, expect, it } from 'vitest'
import { E2E_TRAINING_FULL_FLOW_IDS, isTrainingFullFlowComplete } from './e2eTrainingFullFlow'

describe('e2eTrainingFullFlow', () => {
  it('define 10 hitos del spec unificado (PR oleada 450)', () => {
    expect(E2E_TRAINING_FULL_FLOW_IDS.length).toBe(10)
    expect(E2E_TRAINING_FULL_FLOW_IDS[0]).toBe('workout-open')
    expect(E2E_TRAINING_FULL_FLOW_IDS).toContain('review-pr-tone')
    expect(E2E_TRAINING_FULL_FLOW_IDS.at(-1)).toBe('shell-stable')
  })

  it('isTrainingFullFlowComplete', () => {
    expect(isTrainingFullFlowComplete([])).toBe(false)
    expect(isTrainingFullFlowComplete([...E2E_TRAINING_FULL_FLOW_IDS])).toBe(true)
  })
})