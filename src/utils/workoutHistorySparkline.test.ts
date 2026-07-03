import { describe, expect, it } from 'vitest'
import {
  buildWorkoutHistorySparkline,
  buildWorkoutHistorySparklineAriaLabel,
  buildWorkoutHistorySparklineData,
  countWorkoutHistorySparklinePrPoints,
} from './workoutHistorySparkline'
import type { Workout } from '../types'

function w(
  id: string,
  volume: number,
  exercises: Workout['exercises'] = [{ name: 'Press banca', sets: [{ reps: 8, weightKg: 60 }] }]
): Workout {
  return {
    id,
    userId: 'me',
    title: 'T',
    type: 'push',
    startedAt: 1,
    endedAt: 2,
    exercises,
    stats: {
      totalSets: exercises.reduce((n, e) => n + e.sets.length, 0),
      totalVolumeKg: volume,
      durationMin: 30,
      exerciseCount: exercises.length,
    },
    source: 'manual',
  }
}

describe('buildWorkoutHistorySparkline', () => {
  it('devuelve volúmenes del más antiguo al más reciente en la ventana', () => {
    const workouts = [w('n', 300), w('m', 200), w('o', 100)]
    expect(buildWorkoutHistorySparkline(workouts, 0, 3)).toEqual([100, 200, 300])
  })

  it('requiere al menos 2 puntos', () => {
    expect(buildWorkoutHistorySparkline([w('a', 50)], 0)).toEqual([])
  })

  it('buildWorkoutHistorySparklineData marca PR en puntos (oleada 396)', () => {
    const workouts = [
      w('new', 800, [{ name: 'Press banca', sets: [{ reps: 10, weightKg: 80 }] }]),
      w('old', 480, [{ name: 'Press banca', sets: [{ reps: 8, weightKg: 60 }] }]),
    ]
    const data = buildWorkoutHistorySparklineData(workouts, 0, 2)
    expect(data.map((p) => p.volumeKg)).toEqual([480, 800])
    expect(data[1]?.isPr).toBe(true)
    expect(countWorkoutHistorySparklinePrPoints(data)).toBeGreaterThan(0)
    expect(buildWorkoutHistorySparklineAriaLabel(data)).toContain('PR')
    expect(buildWorkoutHistorySparklineAriaLabel(data)).toContain('800 kg')
  })

  it('buildWorkoutHistorySparklineAriaLabel sin PR', () => {
    const workouts = [
      w('n', 400, [{ name: 'Press banca', sets: [{ reps: 8, weightKg: 50 }] }]),
      w('m', 480, [{ name: 'Press banca', sets: [{ reps: 8, weightKg: 60 }] }]),
      w('o', 560, [{ name: 'Press banca', sets: [{ reps: 8, weightKg: 70 }] }]),
      w('x', 640, [{ name: 'Press banca', sets: [{ reps: 8, weightKg: 80 }] }]),
    ]
    const data = buildWorkoutHistorySparklineData(workouts, 0, 3)
    expect(countWorkoutHistorySparklinePrPoints(data)).toBe(0)
    expect(buildWorkoutHistorySparklineAriaLabel(data)).toContain('400 kg')
    expect(buildWorkoutHistorySparklineAriaLabel(data)).not.toContain('PR')
  })
})