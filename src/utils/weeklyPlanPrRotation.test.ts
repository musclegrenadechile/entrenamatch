import { describe, expect, it } from 'vitest'
import type { Workout } from '../types'
import {
  applyPrRotationToSuggestedType,
  collectRecentPrMuscleGroups,
  enhanceTrainingLoadWithPrRotation,
  mergeWorkoutsForWeeklyPlan,
} from './weeklyPlanPrRotation'
import type { WeeklyTrainingLoad } from '../domain/weeklyPlan/types'

function workout(
  id: string,
  type: Workout['type'],
  weight: number,
  daysAgo: number
): Workout {
  const now = Date.now()
  const endedAt = now - daysAgo * 86_400_000
  return {
    id,
    userId: 'me',
    title: 'Test',
    type,
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

const baseLoad: WeeklyTrainingLoad = {
  sessionsCount: 2,
  activeDays: 2,
  daysSinceLastSession: 1,
  lastWorkoutType: 'push',
  fatiguedMuscleGroups: ['Pecho'],
  suggestedWorkoutType: 'push',
}

describe('weeklyPlanPrRotation', () => {
  it('collectRecentPrMuscleGroups con PR en press', () => {
    const muscles = collectRecentPrMuscleGroups([
      workout('new', 'push', 70, 1),
      workout('old', 'push', 60, 4),
    ])
    expect(muscles).toContain('Pecho')
  })

  it('applyPrRotationToSuggestedType evita push tras PR pecho', () => {
    expect(applyPrRotationToSuggestedType('push', ['Pecho'], 'push')).toBe('pull')
  })

  it('enhanceTrainingLoadWithPrRotation añade nota y tipo ajustado', () => {
    const enhanced = enhanceTrainingLoadWithPrRotation(baseLoad, [
      workout('new', 'push', 70, 1),
      workout('old', 'push', 60, 4),
    ])
    expect(enhanced.suggestedWorkoutType).not.toBe('push')
    expect(enhanced.recentPrMuscleGroups).toContain('Pecho')
    expect(enhanced.prRotationNote).toMatch(/rotación/i)
  })

  it('mergeWorkoutsForWeeklyPlan prioriza recientes', () => {
    const merged = mergeWorkoutsForWeeklyPlan(
      [workout('a', 'pull', 50, 2)],
      [workout('b', 'push', 80, 0)]
    )
    expect(merged).toHaveLength(2)
    expect(merged[0].id).toBe('b')
  })
})