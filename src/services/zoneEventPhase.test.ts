import { describe, expect, it } from 'vitest'
import {
  getWarEventKey,
  getZoneEventPhaseFromChileDay,
  isZoneScoringActive,
} from './zoneEventPhase'

describe('zoneEventPhase', () => {
  it('maps Chile weekdays to phases', () => {
    expect(getZoneEventPhaseFromChileDay(5)).toBe('war')
    expect(getZoneEventPhaseFromChileDay(6)).toBe('war')
    expect(getZoneEventPhaseFromChileDay(0)).toBe('war')
    expect(getZoneEventPhaseFromChileDay(1)).toBe('celebration')
    expect(getZoneEventPhaseFromChileDay(2)).toBe('celebration')
    expect(getZoneEventPhaseFromChileDay(3)).toBe('armistice')
    expect(getZoneEventPhaseFromChileDay(4)).toBe('armistice')
  })

  it('only scores during war', () => {
    expect(isZoneScoringActive(new Date('2026-06-12T20:00:00-04:00'))).toBe(true)
    expect(isZoneScoringActive(new Date('2026-06-08T12:00:00-04:00'))).toBe(false)
  })

  it('resolves war event key to cycle Friday', () => {
    const sunday = new Date('2026-06-07T18:00:00-04:00')
    expect(getWarEventKey(sunday)).toBe('2026-06-05')
    const monday = new Date('2026-06-08T10:00:00-04:00')
    expect(getWarEventKey(monday)).toBe('2026-06-05')
    const friday = new Date('2026-06-12T10:00:00-04:00')
    expect(getWarEventKey(friday)).toBe('2026-06-12')
  })
})
