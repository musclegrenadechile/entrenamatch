import { describe, expect, it } from 'vitest'
import {
  computePilotDensityHealth,
  pilotDensityDocId,
} from './pilotDensityMetrics'

describe('pilotDensityMetrics', () => {
  it('reuses pilot weekly doc id format', () => {
    expect(pilotDensityDocId('vina del mar', '2026-06-09')).toContain('vina')
  })

  it('labels cold density when cohort is tiny', () => {
    const h = computePilotDensityHealth({
      memberCount: 2,
      weeklySyncs: 0,
      weeklyInvites: 0,
    })
    expect(h.health).toBe('cold')
  })

  it('labels active when MAU min and sync exist', () => {
    const h = computePilotDensityHealth({
      memberCount: 55,
      weeklySyncs: 2,
      weeklyInvites: 5,
      liveNow: 2,
    })
    expect(h.health).toBe('active')
  })
})
