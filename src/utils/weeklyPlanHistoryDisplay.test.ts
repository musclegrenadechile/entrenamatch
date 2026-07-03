import { describe, expect, it } from 'vitest'
import {
  buildWeeklyPlanHistoryAriaLabel,
  buildWeeklyPlanHistoryHint,
  shouldShowWeeklyPlanHistoryHint,
  WEEKLY_PLAN_HISTORY_HINT_CLASS,
} from './weeklyPlanHistoryDisplay'
import type { Workout } from '../types'

function workout(id: string, weight: number, daysAgo: number): Workout {
  const now = Date.now()
  const endedAt = now - daysAgo * 86_400_000
  return {
    id,
    userId: 'me',
    title: 'Test',
    type: 'push',
    startedAt: endedAt - 45 * 60_000,
    endedAt,
    exercises: [{ name: 'Press banca', sets: [{ reps: 10, weightKg: weight }] }],
    stats: {
      totalSets: 1,
      totalVolumeKg: weight * 10,
      durationMin: 45,
      exerciseCount: 1,
    },
    source: 'manual',
  }
}

describe('weeklyPlanHistoryDisplay', () => {
  it('WEEKLY_PLAN_HISTORY_HINT_CLASS', () => {
    expect(WEEKLY_PLAN_HISTORY_HINT_CLASS).toBe('em-v2-plan__history-hint')
  })

  it('buildWeeklyPlanHistoryHint con PR reciente', () => {
    const hint = buildWeeklyPlanHistoryHint([
      workout('new', 60, 1),
      workout('old', 50, 3),
    ])
    expect(hint).toContain('PR en Press banca')
    expect(hint).toContain('10×60 kg')
  })

  it('sin hint si el entreno es antiguo', () => {
    expect(buildWeeklyPlanHistoryHint([workout('old', 60, 10)])).toBeNull()
  })

  it('aria y visibilidad por tipo de actividad', () => {
    const hint = '🏆 PR en Press banca (10×60 kg) — sigue progresando'
    expect(buildWeeklyPlanHistoryAriaLabel(hint)).toContain('Press banca')
    expect(shouldShowWeeklyPlanHistoryHint('strength', hint)).toBe(true)
    expect(shouldShowWeeklyPlanHistoryHint('rest', hint)).toBe(false)
  })
})