/**
 * Realtime listener policy — central perf contract (Fase perf 2026-06).
 * Counters live in `realtimeStats`; wiring is in App + domain hooks.
 */
import { PROFILE_LIST_LIMIT } from '../utils/profileFirestoreParse'
import { MAX_CHAT_LISTENERS } from './useChatSession'

export const REALTIME_HUB_POLICY = {
  profileListLimit: PROFILE_LIST_LIMIT,
  profileScope: 'city' as const,
  feedMode: 'global-single-listener' as const,
  feedGlobalMaxPosts: 40,
  feedUserListeners: 'self-and-viewed-profile-only' as const,
  commentListeners: 'visible-feed-posts-only' as const,
  chatListenersMax: MAX_CHAT_LISTENERS,
  livePatchRealProfiles: false,
  liveIdleThrottleMs: 2000,
  tabGatedListeners: true,
  pauseWhenBackground: true,
  backgroundProfilePollMs: 90_000,
} as const

export {
  shouldRunProfilesListener,
  shouldRunLiveListeners,
  shouldRunOwnProfileListener,
  shouldRunCityEngagementListeners,
  shouldRunSquadsListener,
  shouldRunBackgroundProfilePoll,
} from '../utils/tabRealtimePolicy'

export type RealtimeHubPolicy = typeof REALTIME_HUB_POLICY
