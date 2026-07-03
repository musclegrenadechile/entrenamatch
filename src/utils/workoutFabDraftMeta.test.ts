import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildWorkoutFabDraftMeta } from './workoutFabDraftMeta'
import type { WorkoutDraft } from './workoutDraft'

const draft: WorkoutDraft = {
  title: 'Push',
  type: 'strength',
  durationMin: 45,
  exercises: [
    { name: 'Press', sets: [{ reps: 10, weightKg: 60 }, { reps: 8, weightKg: 65 }] },
    { name: 'Remo', sets: [{ reps: 12, weightKg: 40 }] },
  ],
  startedAt: Date.now() - 120_000,
  updatedAt: Date.now() - 3 * 60_000,
}

describe('buildWorkoutFabDraftMeta', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-03T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resume bloques y antigüedad del borrador', () => {
    const meta = buildWorkoutFabDraftMeta({
      ...draft,
      updatedAt: Date.parse('2026-07-03T11:57:00Z'),
    })
    expect(meta.setCount).toBe(3)
    expect(meta.blocksLabel).toBe('3 bloques')
    expect(meta.ageLabel).toBe('hace 3 min')
  })

  it('sessionChip compacto con volumen y listas', () => {
    const meta = buildWorkoutFabDraftMeta(draft)
    expect(meta.sessionChip).toContain('3 series')
    expect(meta.sessionChip).toContain('kg')
  })
})