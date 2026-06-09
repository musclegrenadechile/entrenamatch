import { describe, expect, it } from 'vitest'
import { mergeGymRoutineTemplates } from './gymRoutines'
import type { WorkoutQuickTemplate } from '../utils/workoutTemplates'

describe('mergeGymRoutineTemplates', () => {
  it('prefers Firestore templates over local fallbacks', () => {
    const fs: WorkoutQuickTemplate[] = [
      {
        id: 'gym-fs-1',
        label: 'Rutina del gym',
        type: 'full',
        durationMin: 45,
        exercises: [{ name: 'Sentadilla', sets: [{ reps: 10, weightKg: 40 }] }],
      },
    ]
    const merged = mergeGymRoutineTemplates(fs, { gymName: 'Smart Fit', partnerType: 'gym' })
    expect(merged[0].id).toBe('gym-fs-1')
    expect(merged.length).toBeGreaterThan(1)
  })

  it('dedupes by label', () => {
    const fs: WorkoutQuickTemplate[] = [
      {
        id: 'a',
        label: 'Full body en el gym',
        type: 'full',
        durationMin: 50,
        exercises: [{ name: 'Press', sets: [{ reps: 8, weightKg: 40 }] }],
      },
    ]
    const merged = mergeGymRoutineTemplates(fs, { partnerType: 'gym' })
    const labels = merged.map((t) => t.label.toLowerCase())
    expect(new Set(labels).size).toBe(labels.length)
  })
})
