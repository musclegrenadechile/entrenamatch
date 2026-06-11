/** Lightweight dev perf counters — no React deps. */
export const realtimeStats = {
  profileListeners: 0,
  feedGlobalListeners: 0,
  feedUserListeners: 0,
  chatListeners: 0,
  commentListeners: 0,
  liveListeners: 0,
  lastFeedComputeMs: 0,
}

export function bumpRealtimeStat(
  key: keyof typeof realtimeStats,
  delta: number
): void {
  if (key === 'lastFeedComputeMs') return
  realtimeStats[key] = Math.max(0, realtimeStats[key] + delta)
}
