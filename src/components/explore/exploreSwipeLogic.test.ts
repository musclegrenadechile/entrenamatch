import { describe, expect, it } from 'vitest'
import {
  EXPLORE_SWIPE_THRESHOLD,
  EXPLORE_SWIPE_VELOCITY,
  resolveExploreSwipeDirection,
} from './exploreSwipeLogic'

describe('resolveExploreSwipeDirection', () => {
  it('returns null below threshold', () => {
    expect(resolveExploreSwipeDirection(0, 0)).toBeNull()
    expect(resolveExploreSwipeDirection(EXPLORE_SWIPE_THRESHOLD - 1, 0)).toBeNull()
  })

  it('returns right on offset past threshold', () => {
    expect(resolveExploreSwipeDirection(EXPLORE_SWIPE_THRESHOLD + 1, 0)).toBe('right')
  })

  it('returns left on negative offset past threshold', () => {
    expect(resolveExploreSwipeDirection(-EXPLORE_SWIPE_THRESHOLD - 1, 0)).toBe('left')
  })

  it('returns right on fast flick velocity', () => {
    expect(resolveExploreSwipeDirection(10, EXPLORE_SWIPE_VELOCITY + 50)).toBe('right')
  })

  it('returns left on fast negative velocity', () => {
    expect(resolveExploreSwipeDirection(-10, -EXPLORE_SWIPE_VELOCITY - 50)).toBe('left')
  })
})
