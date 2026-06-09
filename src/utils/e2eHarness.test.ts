import { describe, expect, it } from 'vitest'
import { isE2EHarnessActive } from './e2eHarness'

describe('e2eHarness', () => {
  it('is active only with ?e2e=1', () => {
    expect(isE2EHarnessActive('')).toBe(false)
    expect(isE2EHarnessActive('?foo=1')).toBe(false)
    expect(isE2EHarnessActive('?e2e=1')).toBe(true)
    expect(isE2EHarnessActive('?tab=map&e2e=1')).toBe(true)
  })
})
