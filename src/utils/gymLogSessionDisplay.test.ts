import { describe, expect, it } from 'vitest'
import {
  buildGymLogExerciseProgressLabel,
  buildGymLogSessionChip,
  countGymLogSetsProgress,
  getGymLogExerciseProgressPct,
} from './gymLogSessionDisplay'

describe('gymLogSessionDisplay', () => {
  it('countGymLogSetsProgress', () => {
    expect(
      countGymLogSetsProgress([
        {
          name: 'Press banca',
          sets: [
            { reps: 10, weightKg: 60 },
            { reps: 0, weightKg: 0 },
          ],
        },
      ])
    ).toEqual({ total: 2, complete: 1 })
  })

  it('getGymLogExerciseProgressPct', () => {
    expect(
      getGymLogExerciseProgressPct('Press banca', [
        { reps: 8, weightKg: 50 },
        { reps: 0, weightKg: 0 },
        { reps: 6, weightKg: 50 },
      ])
    ).toBe(67)
    expect(getGymLogExerciseProgressPct('Press banca', [])).toBe(0)
  })

  it('buildGymLogExerciseProgressLabel fuerza', () => {
    expect(
      buildGymLogExerciseProgressLabel('Press banca', [
        { reps: 10, weightKg: 60 },
        { reps: 0, weightKg: 0 },
      ])
    ).toBe('1/2 listas')
    expect(buildGymLogExerciseProgressLabel('Press banca', [{ reps: 5, weightKg: 40 }])).toBe('1/1 lista')
  })

  it('buildGymLogExerciseProgressLabel cardio', () => {
    expect(
      buildGymLogExerciseProgressLabel('Cinta / caminadora', [
        { reps: 0, weightKg: 0, minutesMin: 15, intensity: 6 },
        { reps: 0, weightKg: 0, minutesMin: 0, intensity: 0 },
      ])
    ).toBe('1/2 intervalos')
  })

  it('buildGymLogSessionChip', () => {
    expect(buildGymLogSessionChip([])).toBe('')
    expect(
      buildGymLogSessionChip([
        {
          name: 'Press banca',
          sets: [
            { reps: 10, weightKg: 60 },
            { reps: 8, weightKg: 60 },
          ],
        },
        {
          name: 'Cinta / caminadora',
          sets: [{ reps: 0, weightKg: 0, minutesMin: 20, intensity: 6 }],
        },
      ])
    ).toBe('2 ejercicios · 3 series · 1.1k kg · listo para guardar')
    expect(
      buildGymLogSessionChip([
        {
          name: 'Press banca',
          sets: [
            { reps: 10, weightKg: 60 },
            { reps: 0, weightKg: 0 },
          ],
        },
      ])
    ).toBe('1 ejercicio · 2 series · 600 kg · 1/2 listas')
  })

  it('buildGymLogSessionChip incluye PRs en vivo', () => {
    expect(
      buildGymLogSessionChip(
        [{ name: 'Press banca', sets: [{ reps: 8, weightKg: 80 }] }],
        { history: [] }
      )
    ).toContain('🏆 1 PR')
  })
})