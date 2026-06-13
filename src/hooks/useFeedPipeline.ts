import { useMemo } from 'react'
import {
  computeGlobalFeed,
  type FeedComputeParams,
} from '../utils/feedRanking'

export type FeedPipelineResult = ReturnType<typeof computeGlobalFeed> & {
  computeMs: number
}

/** Fase 397 — ranking + filtros del Muro global fuera de App.tsx. */
export function buildFeedPipeline(params: FeedComputeParams): FeedPipelineResult {
  const t0 = performance.now()
  const result = computeGlobalFeed(params)
  return { ...result, computeMs: Math.round(performance.now() - t0) }
}

export function useFeedPipeline(params: FeedComputeParams): FeedPipelineResult {
  const {
    profilePosts,
    effectiveUserId,
    syncBonds,
    liveUsersActive,
    userLocation,
    realProfiles,
    currentUser,
    feedShowPinnedOnly,
    feedOnlyReal,
    feedOnlyLive,
    feedSearch,
    feedDisplayLimit,
    isSeedProfileId,
    recentlyPublishedPostId,
  } = params

  return useMemo(
    () =>
      buildFeedPipeline({
        profilePosts,
        effectiveUserId,
        syncBonds,
        liveUsersActive,
        userLocation,
        realProfiles,
        currentUser,
        feedShowPinnedOnly,
        feedOnlyReal,
        feedOnlyLive,
        feedSearch,
        feedDisplayLimit,
        isSeedProfileId,
        recentlyPublishedPostId,
      }),
    [
      profilePosts,
      effectiveUserId,
      syncBonds,
      liveUsersActive,
      userLocation,
      realProfiles,
      currentUser,
      feedShowPinnedOnly,
      feedOnlyReal,
      feedOnlyLive,
      feedSearch,
      feedDisplayLimit,
      isSeedProfileId,
      recentlyPublishedPostId,
    ]
  )
}
