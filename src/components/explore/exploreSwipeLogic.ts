/** Swipe threshold constants — shared by ExploreSwipeCard and tests. */
export const EXPLORE_SWIPE_THRESHOLD = 96
export const EXPLORE_SWIPE_VELOCITY = 520

export function resolveExploreSwipeDirection(
  offsetX: number,
  velocityX: number
): 'left' | 'right' | null {
  if (offsetX > EXPLORE_SWIPE_THRESHOLD || velocityX > EXPLORE_SWIPE_VELOCITY) return 'right'
  if (offsetX < -EXPLORE_SWIPE_THRESHOLD || velocityX < -EXPLORE_SWIPE_VELOCITY) return 'left'
  return null
}
