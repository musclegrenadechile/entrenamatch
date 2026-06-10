import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
  quickAddSetToWorkoutDraft,
  saveWorkoutDraft,
  loadWorkoutDraft,
  clearWorkoutDraft,
} from './workoutDraft'

const USER = 'test-user-quick-set'

function installMemoryLocalStorage() {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => store.clear(),
  })
}

describe('quickAddSetToWorkoutDraft', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    clearWorkoutDraft(USER)
  })

  it('duplicates last strength set on current exercise', () => {
    saveWorkoutDraft(USER, {
      title: 'Push',
      type: 'push',
      durationMin: 45,
      startedAt: Date.now(),
      updatedAt: Date.now(),
      exercises: [
        {
          name: 'Press banca',
          sets: [{ reps: 8, weightKg: 60 }],
        },
      ],
    })
    const result = quickAddSetToWorkoutDraft(USER)
    expect(result.ok).toBe(true)
    expect(result.exerciseName).toBe('Press banca')
    const draft = loadWorkoutDraft(USER)
    expect(draft?.exercises[0].sets).toHaveLength(2)
    expect(draft?.exercises[0].sets[1]).toEqual({ reps: 8, weightKg: 60 })
  })

  it('returns false when no draft', () => {
    expect(quickAddSetToWorkoutDraft(USER).ok).toBe(false)
  })
})
