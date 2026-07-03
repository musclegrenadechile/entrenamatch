import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

import confetti from 'canvas-confetti'
import { fireWorkoutPRConfetti } from './workoutPRConfetti'

describe('workoutPRConfetti', () => {
  beforeEach(() => {
    vi.mocked(confetti).mockClear()
  })

  it('fires subtle gold confetti', () => {
    fireWorkoutPRConfetti()
    expect(confetti).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 48,
        colors: ['#FFD700', '#FF671F', '#22c55e'],
      })
    )
  })
})