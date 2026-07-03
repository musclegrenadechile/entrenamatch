import { describe, expect, it } from 'vitest'
import { buildDemoWorkoutFromSave, buildE2EDemoWorkoutHistory } from './demoWorkoutHistory'

describe('demoWorkoutHistory', () => {
  it('buildDemoWorkoutFromSave calcula stats', () => {
    const w = buildDemoWorkoutFromSave('u1', {
      title: 'Test',
      type: 'push',
      durationMin: 30,
      exercises: [{ name: 'Press banca', sets: [{ reps: 10, weightKg: 60 }] }],
    })
    expect(w.userId).toBe('u1')
    expect(w.stats.totalVolumeKg).toBe(600)
    expect(w.source).toBe('manual')
  })

  it('buildE2EDemoWorkoutHistory — 2 sesiones, más reciente primero', () => {
    const list = buildE2EDemoWorkoutHistory('u1')
    expect(list).toHaveLength(2)
    expect(list[0].title).toBe('E2E Entreno PR')
    expect(list[0].stats.totalVolumeKg).toBe(600)
    expect(list[1].stats.totalVolumeKg).toBe(500)
  })
})