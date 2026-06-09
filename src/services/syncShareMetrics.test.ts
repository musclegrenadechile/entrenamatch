import { describe, expect, it } from 'vitest'
import {
  buildEmptySyncShareWeekly,
  publishRatePct,
  syncShareWeeklyDocId,
} from './syncShareMetrics'

describe('syncShareMetrics', () => {
  it('builds stable weekly doc id', () => {
    expect(syncShareWeeklyDocId('abc123', '2026-06-09')).toBe('abc123__2026-06-09')
  })

  it('computes publish rate from offers', () => {
    const doc = buildEmptySyncShareWeekly('u1', '2026-06-09')
    doc.offers = 10
    doc.publishes = 3
    expect(publishRatePct(doc)).toBe(30)
    expect(publishRatePct(buildEmptySyncShareWeekly('u1', 'w'))).toBe(0)
  })
})
