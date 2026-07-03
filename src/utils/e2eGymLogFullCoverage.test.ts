import { describe, expect, it } from 'vitest'
import {
  countGymLogCoverageSuites,
  e2eGymLogFullBlockRange,
  GYM_LOG_FULL_COVERAGE_MODULES,
  isGymLogFullE2ECoverageComplete,
} from './e2eGymLogFullCoverage'

describe('e2eGymLogFullCoverage', () => {
  it('unifica 3 suites gym-log v2 oleadas 436–438', () => {
    expect(countGymLogCoverageSuites()).toBe(3)
    expect(e2eGymLogFullBlockRange()).toEqual({ from: 436, to: 438 })
    expect([...GYM_LOG_FULL_COVERAGE_MODULES]).toEqual([
      'e2eGymLogSessionPrCoverage',
      'e2eGymLogFabSessionPrCoverage',
      'e2eGymLogPostV2Coverage',
    ])
    expect(isGymLogFullE2ECoverageComplete()).toBe(true)
  })
})