import { describe, expect, it } from 'vitest'
import { canDuplicateGymLogSet, copyWorkoutSetValues } from './gymLogDuplicateSet'

describe('gymLogDuplicateSet', () => {
  it('canDuplicateGymLogSet', () => {
    expect(canDuplicateGymLogSet(0)).toBe(false)
    expect(canDuplicateGymLogSet(1)).toBe(true)
  })

  it('copyWorkoutSetValues fuerza', () => {
    expect(copyWorkoutSetValues('Press banca', { reps: 8, weightKg: 70 })).toEqual({
      reps: 8,
      weightKg: 70,
      minutesMin: undefined,
      intensity: undefined,
    })
  })

  it('copyWorkoutSetValues cardio', () => {
    expect(
      copyWorkoutSetValues('Cinta / caminadora', {
        reps: 0,
        weightKg: 0,
        minutesMin: 20,
        intensity: 7,
      })
    ).toEqual({
      reps: 0,
      weightKg: 0,
      minutesMin: 20,
      intensity: 7,
    })
  })
})