import { describe, expect, it } from 'vitest'
import { DERBY_AWAY, DERBY_HOME, buildCityDerby } from '../services/cityDerby'
import { derbyShareLeaderLine, derbyShareTeamCopy } from './derbyStoryShare'

describe('derbyStoryShare', () => {
  it('uses short team titles for story layout', () => {
    expect(derbyShareTeamCopy(DERBY_HOME.norm)).toEqual({
      title: 'Valparaíso',
      subtitle: 'Región V · Costa',
    })
    expect(derbyShareTeamCopy(DERBY_AWAY.norm)).toEqual({
      title: 'Santiago',
      subtitle: 'Comuna RM',
    })
  })

  it('formats leader line with short city name', () => {
    const derby = buildCityDerby(
      {
        cityNorm: DERBY_HOME.norm,
        cityLabel: DERBY_HOME.label,
        weekKey: '2026-W23',
        totalMinutes: 100,
        participantCount: 3,
      },
      {
        cityNorm: DERBY_AWAY.norm,
        cityLabel: DERBY_AWAY.label,
        weekKey: '2026-W23',
        totalMinutes: 200,
        participantCount: 5,
      },
      {},
      'santiago',
      '2026-W23'
    )
    expect(derbyShareLeaderLine(derby)).toMatch(/^Santiago lidera/)
  })
})
