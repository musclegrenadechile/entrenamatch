import { describe, expect, it } from 'vitest'
import { LIVE_PILOT_SATURDAY_STEPS } from './livePilotChecklist'

describe('livePilotChecklist', () => {
  it('defines 5 LIVE pilot steps for Saturday', () => {
    expect(LIVE_PILOT_SATURDAY_STEPS.length).toBe(5)
    expect(LIVE_PILOT_SATURDAY_STEPS.some((s) => s.actor === 'both')).toBe(true)
  })
})
