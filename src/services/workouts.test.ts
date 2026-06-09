import { describe, expect, it } from 'vitest'
import { buildWorkoutPreview, stripUndefinedDeep } from './workouts'

describe('workouts Firestore payload', () => {
  it('buildWorkoutPreview omits prCount and topWeightKg when unset', () => {
    const preview = buildWorkoutPreview(
      'Push',
      'push',
      [{ name: 'Press inclinado', sets: [{ reps: 10, weightKg: 16 }] }],
      { totalSets: 1, totalVolumeKg: 160, durationMin: 50, exerciseCount: 1 }
    )
    expect(preview.prCount).toBeUndefined()
    expect(preview.exercises[0].topWeightKg).toBe(16)
    expect(JSON.stringify(preview)).not.toContain('undefined')
  })

  it('stripUndefinedDeep removes nested undefined', () => {
    const cleaned = stripUndefinedDeep({
      a: 1,
      b: undefined,
      nested: { c: undefined, d: 2 },
    })
    expect(cleaned).toEqual({ a: 1, nested: { d: 2 } })
  })
})
