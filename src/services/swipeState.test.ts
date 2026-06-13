import { describe, expect, it } from 'vitest'
import { shouldMergeLegacyPasses } from './swipeState'

describe('swipeState', () => {
  it('skips legacy passes after explicit deck reset', () => {
    expect(
      shouldMergeLegacyPasses({
        swipeLikedIds: [],
        swipePassedIds: [],
        swipeDeckUpdatedAt: { seconds: 1, nanoseconds: 0 },
      })
    ).toBe(false)
  })

  it('merges legacy passes when profile never reset the deck', () => {
    expect(shouldMergeLegacyPasses({ swipeLikedIds: [], swipePassedIds: [] })).toBe(true)
    expect(
      shouldMergeLegacyPasses({
        swipePassedIds: ['uid-a'],
        swipeDeckUpdatedAt: { seconds: 1, nanoseconds: 0 },
      })
    ).toBe(true)
  })
})
