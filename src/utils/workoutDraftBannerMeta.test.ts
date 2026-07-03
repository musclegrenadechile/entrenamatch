import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildWorkoutDraftBannerMeta } from './workoutDraftBannerMeta'
import type { WorkoutDraft } from './workoutDraft'

function makeDraft(patch: Partial<WorkoutDraft> = {}): WorkoutDraft {
  return {
    title: 'Push',
    type: 'strength',
    durationMin: 45,
    exercises: [
      { name: 'Press banca', sets: [{ reps: 10, weightKg: 60 }] },
      { name: 'Sentadilla', sets: [{ reps: 8, weightKg: 80 }, { reps: 8, weightKg: 80 }] },
    ],
    startedAt: null,
    updatedAt: Date.now() - 5 * 60_000,
    ...patch,
  }
}

describe('buildWorkoutDraftBannerMeta', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-03T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resume ejercicios, bloques y antigüedad', () => {
    expect(buildWorkoutDraftBannerMeta(makeDraft())).toBe('2 ejercicios · 3 bloques · hace 5 min')
  })

  it('añade cronómetro cuando hay startedAt', () => {
    const draft = makeDraft({ startedAt: Date.parse('2026-07-03T11:52:30Z') })
    expect(buildWorkoutDraftBannerMeta(draft)).toBe('2 ejercicios · 3 bloques · hace 5 min · 7:30')
  })
})