import { describe, expect, it } from 'vitest'
import {
  WORKOUT_STORY_APP_HOST,
  buildWorkoutStoryPostText,
  buildWorkoutStoryRefUrl,
} from './workoutStoryShare'

describe('workoutStoryShare', () => {
  const preview = {
    title: 'Push día A',
    type: 'strength' as const,
    exerciseCount: 5,
    totalSets: 18,
    volumeLabel: '4.2k kg',
    durationMin: 52,
    prCount: 2,
    exercises: [
      { name: 'Press banca', setCount: 4, topWeightKg: 80 },
      { name: 'Press inclinado', setCount: 3, topWeightKg: 60 },
    ],
  }

  it('buildWorkoutStoryPostText includes brand hashtags and stats', () => {
    const text = buildWorkoutStoryPostText({
      userName: 'Cote Test',
      userId: 'user-abc',
      preview,
      prSummary: '🏆 PR Press banca 82.5 kg',
    })
    expect(text).toContain('Push día A')
    expect(text).toContain('#EntrenaMatch')
    expect(text).toContain('#EntrenoDeHoy')
    expect(text).toContain('#MapaLIVE')
    expect(text).not.toContain('GymPulse')
    expect(text).toContain('PR Press banca')
    expect(text).toContain('ref=user-abc')
  })

  it('buildWorkoutStoryRefUrl appends ref param', () => {
    const url = buildWorkoutStoryRefUrl('uid-123')
    expect(url).toContain('ref=uid-123')
    expect(url).toMatch(/^https?:\/\//)
  })

  it('exports stable app host label for tests', () => {
    expect(WORKOUT_STORY_APP_HOST).toBe('entrenamatch.web.app')
  })
})
