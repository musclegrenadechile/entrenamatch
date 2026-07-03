import { describe, expect, it } from 'vitest'
import { E2E_TRAINING_MEGA_FLOW_IDS, isTrainingMegaFlowComplete } from './e2eTrainingMegaFlow'

describe('e2eTrainingMegaFlow', () => {
  it('define 11 hitos del mega flujo entreno', () => {
    expect(E2E_TRAINING_MEGA_FLOW_IDS.length).toBe(11)
    expect(E2E_TRAINING_MEGA_FLOW_IDS).toContain('fuel-prefill')
    expect(E2E_TRAINING_MEGA_FLOW_IDS.at(-1)).toBe('shell-stable')
  })

  it('isTrainingMegaFlowComplete', () => {
    expect(isTrainingMegaFlowComplete([])).toBe(false)
    expect(isTrainingMegaFlowComplete([...E2E_TRAINING_MEGA_FLOW_IDS])).toBe(true)
  })
})