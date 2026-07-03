import { describe, expect, it } from 'vitest'
import {
  aggregateDerbyClientMinutes,
  buildCityDerby,
  derbyPopulationIndex,
  derbyStatusLine,
  isDerbyParticipantCity,
  resolveDerbyTeam,
  DERBY_AWAY,
  DERBY_HOME,
} from './cityDerby'

describe('cityDerby', () => {
  it('resolves team for valparaiso region vs santiago only', () => {
    expect(resolveDerbyTeam('Viña del Mar')).toBe('home')
    expect(resolveDerbyTeam('Valparaíso')).toBe('home')
    expect(resolveDerbyTeam('Quilpué')).toBe('home')
    expect(resolveDerbyTeam('San Antonio')).toBe('home')
    expect(resolveDerbyTeam('Santiago')).toBe('away')
    expect(resolveDerbyTeam('Maipú')).toBeNull()
    expect(resolveDerbyTeam('Puente Alto')).toBeNull()
    expect(resolveDerbyTeam('Concepción')).toBeNull()
  })

  it('isDerbyParticipantCity mirrors resolveDerbyTeam', () => {
    expect(isDerbyParticipantCity('Concón')).toBe(true)
    expect(isDerbyParticipantCity('Lima')).toBe(false)
    expect(isDerbyParticipantCity(null)).toBe(false)
  })

  it('aggregates minutes from regional allies (away = santiago only)', () => {
    const totals = aggregateDerbyClientMinutes([
      { cityNorm: 'quilpue', minutes: 30 },
      { cityNorm: 'maipu', minutes: 20 },
      { cityNorm: 'santiago', minutes: 15 },
      { cityNorm: 'concepcion', minutes: 99 },
    ])
    expect(totals.home).toBe(30)
    expect(totals.away).toBe(15)
  })

  it('scores leader by population index, not raw minutes', () => {
    const derby = buildCityDerby(
      {
        cityNorm: DERBY_HOME.norm,
        cityLabel: 'Viña del Mar',
        weekKey: '2026-06-02',
        totalMinutes: 120,
        participantCount: 8,
      },
      {
        cityNorm: DERBY_AWAY.norm,
        cityLabel: 'Santiago',
        weekKey: '2026-06-02',
        totalMinutes: 80,
        participantCount: 5,
      },
      {},
      'Viña del Mar',
      '2026-06-02'
    )
    expect(derby.home.cityLabel).toBe(DERBY_HOME.label)
    expect(derby.away.cityLabel).toBe(DERBY_AWAY.label)
    expect(derby.home.totalMinutes).toBeGreaterThan(derby.away.totalMinutes)
    expect(derby.leaderNorm).toBe(DERBY_AWAY.norm)
    expect(derby.marginIndex).toBeGreaterThan(0)
    expect(derby.homeBarPct).toBeLessThan(derby.awayBarPct)
    expect(derbyStatusLine(derby)).toContain('Santiago')
  })

  it('computes population index', () => {
    expect(derbyPopulationIndex(100, 1_000_000)).toBe(10)
    expect(derbyPopulationIndex(0, 467_327)).toBe(0)
  })

  it('handles tie at zero', () => {
    const derby = buildCityDerby(null, null, {}, 'Santiago', '2026-06-02')
    expect(derby.isTie).toBe(true)
    expect(derby.home.totalMinutes).toBe(0)
  })
})
