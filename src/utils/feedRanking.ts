import { getDistanceKm } from './index'
import { isUserLiveInSnapshot, type LiveUserLike } from './gymPulseLive'

export interface FeedPostRow {
  id?: string
  ownerId: string
  timestamp: number
  text?: string
  pinned?: boolean
  isMine?: boolean
  postType?: string
  [key: string]: unknown
}

export interface FeedRankingContext {
  syncBonds: Record<string, { bondLevel?: number }>
  liveUsersActive: LiveUserLike[]
  userLocation?: { lat: number; lng: number } | null
  ownerCoords?: Record<string, { lat: number; lng: number }>
  now?: number
}

export interface FeedRankBadges {
  live: boolean
  near: boolean
  bond: boolean
  echo: boolean
}

const WEIGHTS = {
  bondBase: 400,
  bondPerLevel: 120,
  echo: 350,
  live: 280,
  pinned: 80,
  workout: 60,
  recencyMax: 200,
  proximityMax: 150,
} as const

const RECENCY_WINDOW_MS = 7 * 86_400_000
const NEAR_KM = 8

export function isEchoPost(post: FeedPostRow): boolean {
  const text = post.text || ''
  return (
    text.includes('HIGHLIGHT DE ENTRENASYNC') ||
    text.includes('Destacado de Sesión Sync') ||
    text.includes('HIGHLIGHT') ||
    text.includes('Fui testigo')
  )
}

export function computeFeedPostScore(post: FeedPostRow, ctx: FeedRankingContext): number {
  const now = ctx.now ?? Date.now()
  let score = 0

  const bond = ctx.syncBonds[post.ownerId]
  if (bond) {
    score += WEIGHTS.bondBase + (bond.bondLevel || 1) * WEIGHTS.bondPerLevel
  }
  if (isEchoPost(post)) score += WEIGHTS.echo
  if (isUserLiveInSnapshot(post.ownerId, ctx.liveUsersActive, now)) score += WEIGHTS.live
  if (post.pinned) score += WEIGHTS.pinned
  if (post.postType === 'workout') score += WEIGHTS.workout

  const ts = post.timestamp || 0
  const ageMs = Math.max(0, now - ts)
  score += WEIGHTS.recencyMax * Math.max(0, 1 - ageMs / RECENCY_WINDOW_MS)

  if (ctx.userLocation && ctx.ownerCoords?.[post.ownerId]) {
    const { lat, lng } = ctx.ownerCoords[post.ownerId]
    const dist = getDistanceKm(ctx.userLocation.lat, ctx.userLocation.lng, lat, lng)
    if (dist <= NEAR_KM) {
      score += WEIGHTS.proximityMax * Math.max(0, 1 - dist / NEAR_KM)
    }
  }

  return score
}

export function getFeedRankBadges(post: FeedPostRow, ctx: FeedRankingContext): FeedRankBadges {
  const now = ctx.now ?? Date.now()
  let near = false
  if (ctx.userLocation && ctx.ownerCoords?.[post.ownerId]) {
    const { lat, lng } = ctx.ownerCoords[post.ownerId]
    near = getDistanceKm(ctx.userLocation.lat, ctx.userLocation.lng, lat, lng) <= NEAR_KM
  }
  return {
    live: isUserLiveInSnapshot(post.ownerId, ctx.liveUsersActive, now),
    near,
    bond: !!ctx.syncBonds[post.ownerId],
    echo: isEchoPost(post),
  }
}

export function sortFeedPosts<T extends FeedPostRow>(posts: T[], ctx: FeedRankingContext): T[] {
  return [...posts].sort((a, b) => {
    const sa = computeFeedPostScore(a, ctx)
    const sb = computeFeedPostScore(b, ctx)
    if (sb !== sa) return sb - sa
    return (b.timestamp || 0) - (a.timestamp || 0)
  })
}

export interface FeedComputeParams {
  profilePosts: Record<string, FeedPostRow[] | undefined>
  effectiveUserId: string
  syncBonds: Record<string, { bondLevel?: number }>
  liveUsersActive: LiveUserLike[]
  userLocation?: { lat: number; lng: number } | null
  realProfiles: Array<{ id: string; lat?: number; lng?: number; name?: string }>
  currentUser?: { name?: string; lat?: number; lng?: number } | null
  feedShowPinnedOnly: boolean
  feedOnlyReal: boolean
  feedOnlyLive: boolean
  feedSearch: string
  feedDisplayLimit: number
  isSeedProfileId: (id: string) => boolean
  now?: number
}

export function buildOwnerCoordsMap(
  realProfiles: Array<{ id: string; lat?: number; lng?: number }>,
  currentUser?: { id?: string; lat?: number; lng?: number } | null,
  effectiveUserId?: string
): Record<string, { lat: number; lng: number }> {
  const map: Record<string, { lat: number; lng: number }> = {}
  for (const p of realProfiles) {
    if (Number.isFinite(p.lat) && Number.isFinite(p.lng)) {
      map[p.id] = { lat: p.lat!, lng: p.lng! }
    }
  }
  if (
    currentUser &&
    effectiveUserId &&
    Number.isFinite(currentUser.lat) &&
    Number.isFinite(currentUser.lng)
  ) {
    map[effectiveUserId] = { lat: currentUser.lat!, lng: currentUser.lng! }
  }
  return map
}

/** Fase 141/221 — composite feed ranking (bond + live + recency + proximity). */
export function computeGlobalFeed(params: FeedComputeParams) {
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
    now = Date.now(),
  } = params

  const allCommunityPosts = Object.entries(profilePosts)
    .filter(([uid]) => uid !== effectiveUserId)
    .flatMap(([uid, posts]) => (posts || []).map((p) => ({ ...p, ownerId: uid })))

  const myPostsRaw = (profilePosts[effectiveUserId] || []).map((p) => ({
    ...p,
    ownerId: effectiveUserId,
    isMine: true,
  }))

  const rankingCtx: FeedRankingContext = {
    syncBonds,
    liveUsersActive,
    userLocation,
    ownerCoords: buildOwnerCoordsMap(realProfiles, currentUser, effectiveUserId),
    now,
  }

  let feedPosts = sortFeedPosts([...allCommunityPosts, ...myPostsRaw], rankingCtx)

  const hasActiveFilter =
    feedShowPinnedOnly || feedOnlyReal || feedOnlyLive || !!feedSearch.trim()

  if (feedShowPinnedOnly) feedPosts = feedPosts.filter((p) => p.pinned)
  if (feedOnlyReal) {
    feedPosts = feedPosts.filter((p) => p.isMine || !isSeedProfileId(p.ownerId))
  }
  if (feedOnlyLive) {
    feedPosts = feedPosts.filter(
      (p) => !p.isMine && isUserLiveInSnapshot(p.ownerId, liveUsersActive, now)
    )
  }
  if (feedSearch.trim()) {
    const q = feedSearch.toLowerCase().trim()
    feedPosts = feedPosts.filter((p) => {
      const ownerName = p.isMine
        ? currentUser?.name || ''
        : (realProfiles.find((r) => r.id === p.ownerId) || { name: '' }).name
      return (
        (p.text || '').toLowerCase().includes(q) ||
        (ownerName || '').toLowerCase().includes(q)
      )
    })
  }

  feedPosts = feedPosts.slice(0, feedDisplayLimit)

  return {
    feedPosts,
    allCommunityPosts,
    echoesSource: [...allCommunityPosts, ...myPostsRaw],
    hasActiveFilter,
    rankingCtx,
  }
}
