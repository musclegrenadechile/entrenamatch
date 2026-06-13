import { describe, expect, it, vi, afterEach } from 'vitest'
import { getRelativeTime } from './relativeTime'

describe('getRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty for missing timestamp', () => {
    expect(getRelativeTime()).toBe('')
    expect(getRelativeTime(0)).toBe('')
  })

  it('returns ahora for under one minute', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-09T12:00:00Z'))
    expect(getRelativeTime(Date.now() - 30_000)).toBe('ahora')
  })

  it('returns minutes and hours', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-09T12:00:00Z'))
    expect(getRelativeTime(Date.now() - 5 * 60_000)).toBe('5m')
    expect(getRelativeTime(Date.now() - 3 * 60 * 60_000)).toBe('3h')
  })
})
