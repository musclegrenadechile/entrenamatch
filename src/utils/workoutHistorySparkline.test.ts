import { describe, expect, it } from 'vitest'
import { buildWorkoutHistorySparkline } from './workoutHistorySparkline'
import type { Workout } from '../types'

function w(id: string, volume: number): Workout {
  return {
    id,
    userId: 'me',
    title: 'T',
    type: 'strength',
    startedAt: 1,
    endedAt: 2,
    exercises: [],
    stats: { totalSets: 1, totalVolumeKg: volume, durationMin: 30 },
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
})