import { describe, expect, it } from 'vitest'
import { buildExerciseSetSummary, isGymLogSetComplete } from './gymLogSetDisplay'

describe('gymLogSetDisplay', () => {
  it('buildExerciseSetSummary fuerza', () => {
    expect(buildExerciseSetSummary('Press banca', [])).toBe('Sin series')
    expect(buildExerciseSetSummary('Press banca', [{ reps: 10, weightKg: 60 }])).toBe('1 serie · 600 kg vol')
    expect(
      buildExerciseSetSummary('Press banca', [
        { reps: 10, weightKg: 60 },
        { reps: 8, weightKg: 65 },
      ])
    ).toBe('2 series · 1.1k kg vol')
    expect(buildExerciseSetSummary('Press banca', [{ reps: 0, weightKg: 0 }])).toBe('1 serie')
  })

  it('buildExerciseSetSummary cardio', () => {
    expect(
      buildExerciseSetSummary('Cinta / caminadora', [{ reps: 0, weightKg: 0, minutesMin: 20, intensity: 6 }])
    ).toBe('1 intervalo · 20 min')
    expect(
      buildExerciseSetSummary('Cinta / caminadora', [
        { reps: 0, weightKg: 0, minutesMin: 15, intensity: 5 },
        { reps: 0, weightKg: 0, minutesMin: 10, intensity: 7 },
      ])
    ).toBe('2 intervalos · 25 min')
  })

  it('isGymLogSetComplete', () => {
    expect(isGymLogSetComplete('Press banca', { reps: 8, weightKg: 50 })).toBe(true)
    expect(isGymLogSetComplete('Press banca', { reps: 0, weightKg: 50 })).toBe(false)
    expect(
      isGymLogSetComplete('Cinta / caminadora', { reps: 0, weightKg: 0, minutesMin: 12, intensity: 5 })
    ).toBe(true)
    expect(
      isGymLogSetComplete('Cinta / caminadora', { reps: 0, weightKg: 0, minutesMin: 0, intensity: 5 })
    ).toBe(false)
  })
})