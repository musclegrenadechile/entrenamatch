import { describe, expect, it } from 'vitest'
import { emptyCardioSet, formatSetDisplay, normalizeWorkoutSet } from './workoutSetFields'
import { isTimedCardioExercise } from '../data/exerciseLibrary'

describe('timed cardio sets', () => {
  it('detects machine cardio exercises', () => {
    expect(isTimedCardioExercise('Elíptica')).toBe(true)
    expect(isTimedCardioExercise('Cinta / caminadora')).toBe(true)
    expect(isTimedCardioExercise('Burpees')).toBe(false)
  })

  it('migrates legacy reps into minutes', () => {
    const normalized = normalizeWorkoutSet('Elíptica', { reps: 20, weightKg: 0 })
    expect(normalized.minutesMin).toBe(20)
    expect(normalized.reps).toBe(0)
  })

  it('formats cardio blocks with minutes and intensity', () => {
    expect(formatSetDisplay('Bicicleta estática', emptyCardioSet())).toBe('15 min · 6/10')
  })
})
