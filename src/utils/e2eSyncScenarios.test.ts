import { describe, expect, it } from 'vitest'
import { countStepsByDevice, E2E_SYNC_TWO_DEVICE_STEPS } from './e2eSyncScenarios'

describe('e2eSyncScenarios', () => {
  it('defines 5 two-device sync QA steps', () => {
    expect(E2E_SYNC_TWO_DEVICE_STEPS.length).toBe(5)
    const counts = countStepsByDevice(E2E_SYNC_TWO_DEVICE_STEPS)
    expect(counts.A).toBeGreaterThan(0)
    expect(counts.B).toBeGreaterThan(0)
    expect(counts.both).toBeGreaterThan(0)
  })
})
