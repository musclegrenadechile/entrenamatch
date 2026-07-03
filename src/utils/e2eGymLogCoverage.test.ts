import { describe, expect, it } from 'vitest'
import {
  countE2EGymLogSpecs,
  E2E_GYM_LOG_SPECS,
  gymLogSpecFileBasenames,
  unionGymLogCovers,
} from './e2eGymLogCoverage'

describe('e2eGymLogCoverage', () => {
  it('union gym-log v2 specs oleadas 436–437', () => {
    expect(countE2EGymLogSpecs()).toBe(2)
    expect(E2E_GYM_LOG_SPECS.map((s) => s.id)).toEqual(['workout-flow', 'workout-fab-flow'])
    expect(unionGymLogCovers().sort()).toEqual(
      ['aria', 'fab-session-pr-tone', 'harness', 'session-pr-tone'].sort()
    )
    expect(gymLogSpecFileBasenames()).toEqual([
      'workout-flow.spec.ts',
      'workout-fab-flow.spec.ts',
    ])
  })
})