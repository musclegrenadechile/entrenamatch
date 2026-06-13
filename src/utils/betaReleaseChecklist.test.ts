import { describe, expect, it } from 'vitest'
import { buildBetaReleaseChecklist, countBetaReleaseItems } from './betaReleaseChecklist'

describe('betaReleaseChecklist', () => {
  it('merges P0 QA (12) + LIVE pilot (5) = 17 items', () => {
    expect(countBetaReleaseItems()).toBe(17)
    const items = buildBetaReleaseChecklist()
    expect(items.filter((i) => i.source === 'p0').length).toBe(12)
    expect(items.filter((i) => i.source === 'live-pilot').length).toBe(5)
  })
})
