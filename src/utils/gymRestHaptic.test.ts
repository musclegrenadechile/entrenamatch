import { describe, it, expect, vi } from 'vitest'
import { buzzRestTimerDone } from './gymRestHaptic'

describe('gymRestHaptic', () => {
  it('vibrates on rest timer done', () => {
    const vibrate = vi.fn()
    vi.stubGlobal('navigator', { vibrate })
    buzzRestTimerDone()
    expect(vibrate).toHaveBeenCalledWith([200, 90, 200, 90, 280])
  })
})