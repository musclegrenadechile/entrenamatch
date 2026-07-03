import { describe, expect, it, vi } from 'vitest'
import { buzzGymLogLivePR, celebrateGymLogLivePR } from './gymLogPRFeedback'

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

describe('gymLogPRFeedback', () => {
  it('buzzGymLogLivePR vibra en dispositivos compatibles', () => {
    const vibrate = vi.fn()
    vi.stubGlobal('navigator', { vibrate })
    buzzGymLogLivePR()
    expect(vibrate).toHaveBeenCalledWith([120, 60, 160])
  })

  it('celebrateGymLogLivePR no lanza', () => {
    const vibrate = vi.fn()
    vi.stubGlobal('navigator', { vibrate })
    expect(() => celebrateGymLogLivePR()).not.toThrow()
  })
})