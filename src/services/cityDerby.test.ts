import { describe, expect, it } from 'vitest'
import {
  buildCityDerby,
  derbyStatusLine,
  resolveDerbyTeam,
  DERBY_AWAY,
  DERBY_HOME,
} from './cityDerby'

describe('cityDerby', () => {
  it('resolves team for coast vs santiago', () => {
    expect(resolveDerbyTeam('Viña del Mar')).toBe('home')
    expect(resolveDerbyTeam('Valparaíso')).toBe('home')
    expect(resolveDerbyTeam('Santiago')).toBe('away')
    expect(resolveDerbyTeam('Concepción')).toBeNull()
  })

  it('builds derby with leader and bars', () => {
    const derby = buildCityDerby(
      {
        cityNorm: DERBY_HOME.norm,
        cityLabel: DERBY_HOME.label,
        weekKey: '2026-06-02',
        totalMinutes: 120,
        participantCount: 8,
      },
      {
        cityNorm: DERBY_AWAY.norm,
        cityLabel: DERBY_AWAY.label,
        weekKey: '2026-06-02',
        totalMinutes: 80,
        participantCount: 5,
      },
      {},
      'Viña del Mar',
      '2026-06-02'
    )
    expect(derby.leaderNorm).toBe(DERBY_HOME.norm)
    expect(derby.marginMinutes).toBe(40)
    expect(derby.myTeam).toBe('home')
    expect(derby.homeBarPct).toBeGreaterThan(derby.awayBarPct)
    expect(derbyStatusLine(derby)).toContain('Viña')
  })

  it('handles tie at zero', () => {
    const derby = buildCityDerby(null, null, {}, 'Santiago', '2026-06-02')
    expect(derby.isTie).toBe(true)
    expect(derby.home.totalMinutes).toBe(0)
  })
})
