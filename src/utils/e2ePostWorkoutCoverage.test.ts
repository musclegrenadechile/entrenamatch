import { describe, expect, it } from 'vitest'
import {
  countE2EPostWorkoutSpecs,
  E2E_POST_WORKOUT_SPECS,
  postWorkoutSpecFileBasenames,
  unionPostWorkoutCovers,
} from './e2ePostWorkoutCoverage'

describe('e2ePostWorkoutCoverage', () => {
  it('union post-entreno v2 specs oleadas 439–441', () => {
    expect(countE2EPostWorkoutSpecs()).toBe(2)
    expect(E2E_POST_WORKOUT_SPECS.map((s) => s.id)).toEqual([
      'workout-flow',
      'workout-fuel-flow',
    ])
    expect(unionPostWorkoutCovers().sort()).toEqual(
      ['aria', 'banner-pr-tone', 'fuel-prefill-pr-tone', 'harness'].sort()
    )
    expect(postWorkoutSpecFileBasenames()).toEqual([
      'workout-flow.spec.ts',
      'workout-fuel-flow.spec.ts',
    ])
  })
})