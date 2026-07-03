import { describe, expect, it } from 'vitest'
import { formatWorkoutDraftRecoveredMessage } from './workoutDraftRecoveredCopy'

describe('formatWorkoutDraftRecoveredMessage', () => {
  it('diferencia timer reiniciado vs sesión continua', () => {
    expect(formatWorkoutDraftRecoveredMessage(true)).toContain('cronómetro')
    expect(formatWorkoutDraftRecoveredMessage(false)).toContain('sigue donde')
  })
})