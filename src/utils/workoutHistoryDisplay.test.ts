import { describe, expect, it } from 'vitest'
import {
  buildWorkoutHistoryRowSummary,
  buildWorkoutHistorySectionKicker,
  countWorkoutHistoryRowsWithPr,
  formatWorkoutHistoryBadgeDisplay,
  getWorkoutHistoryBadgeAriaLabel,
  WORKOUT_HISTORY_SUMMARY_CLASS,
} from './workoutHistoryDisplay'
import type { Workout } from '../types'

function workout(
  id: string,
  source: Workout['source'],
  exercises: Workout['exercises'],
  volume = 600
): Workout {
  return {
    id,
    userId: 'me',
    title: 'Test',
    type: 'push',
    startedAt: 1,
    endedAt: 2,
    exercises,
    stats: {
      totalSets: exercises.reduce((n, e) => n + e.sets.length, 0),
      totalVolumeKg: volume,
      durationMin: 45,
      exerciseCount: exercises.length,
    },
    source,
  }
}

describe('workoutHistoryDisplay', () => {
  it('WORKOUT_HISTORY_SUMMARY_CLASS', () => {
    expect(WORKOUT_HISTORY_SUMMARY_CLASS).toBe('em-v2-training-history__summary')
  })

  it('buildWorkoutHistoryRowSummary', () => {
    expect(
      buildWorkoutHistoryRowSummary(
        workout('a', 'manual', [{ name: 'Press banca', sets: [{ reps: 10, weightKg: 60 }] }])
      )
    ).toContain('600 kg')
  })

  it('badge display y aria', () => {
    expect(formatWorkoutHistoryBadgeDisplay({ kind: 'pr', label: '2 PRs' })).toBe('🏆 2 PRs')
    expect(getWorkoutHistoryBadgeAriaLabel({ kind: 'sync', label: 'Sync' })).toContain('EntrenaSync')
  })

  it('countWorkoutHistoryRowsWithPr y kicker', () => {
    const list = [
      workout('new', 'manual', [{ name: 'Press banca', sets: [{ reps: 10, weightKg: 80 }] }]),
      workout('old', 'manual', [{ name: 'Press banca', sets: [{ reps: 8, weightKg: 60 }] }]),
    ]
    expect(countWorkoutHistoryRowsWithPr(list)).toBe(2)
    expect(buildWorkoutHistorySectionKicker(list)).toBe('Últimos 2 · 2 con PR')
  })
})