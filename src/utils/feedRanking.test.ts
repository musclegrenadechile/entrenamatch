import { describe, expect, it } from 'vitest'
import {
  computeFeedPostScore,
  computeGlobalFeed,
  isEchoPost,
  sortFeedPosts,
} from './feedRanking'
import type { LiveUserLike } from './gymPulseLive'

const now = new Date('2026-06-07T12:00:00').getTime()

const basePost = (overrides: Record<string, unknown> = {}) => ({
  id: 'p1',
  ownerId: 'u2',
  timestamp: now - 3_600_000,
  text: 'Entreno de hoy',
  ...overrides,
})

describe('isEchoPost', () => {
  it('detects EntrenaSync highlights', () => {
    expect(isEchoPost({ ownerId: 'a', timestamp: 0, text: 'HIGHLIGHT DE ENTRENASYNC' })).toBe(
      true
    )
  })
})

describe('computeFeedPostScore', () => {
  const liveUsers: LiveUserLike[] = [
    {
      id: 'live-u',
      name: 'Live',
      trainingNow: true,
      trainingSince: now - 60_000,
    } as LiveUserLike,
  ]

  it('ranks bond + live above plain recency', () => {
    const plain = basePost({ ownerId: 'stranger', timestamp: now - 1_000 })
    const bondedLive = basePost({
      id: 'p2',
      ownerId: 'live-u',
      timestamp: now - 86_400_000,
    })
    const ctx = {
      syncBonds: { 'live-u': { bondLevel: 3 } },
      liveUsersActive: liveUsers,
      now,
    }
    expect(computeFeedPostScore(bondedLive, ctx)).toBeGreaterThan(
      computeFeedPostScore(plain, ctx)
    )
  })

  it('boosts proximity when owner is near', () => {
    const far = basePost({ ownerId: 'far' })
    const near = basePost({ id: 'p2', ownerId: 'near' })
    const ctx = {
      syncBonds: {},
      liveUsersActive: [],
      userLocation: { lat: -33.45, lng: -70.66 },
      ownerCoords: {
        far: { lat: -34.5, lng: -71.5 },
        near: { lat: -33.46, lng: -70.67 },
      },
      now,
    }
    expect(computeFeedPostScore(near, ctx)).toBeGreaterThan(computeFeedPostScore(far, ctx))
  })
})

describe('sortFeedPosts', () => {
  it('orders echo posts above newer non-echo when scores tie on bond', () => {
    const posts = [
      basePost({ id: 'new', timestamp: now, text: 'Hola' }),
      basePost({
        id: 'echo',
        timestamp: now - 86_400_000,
        text: 'Destacado de Sesión Sync con mi Red',
      }),
    ]
    const sorted = sortFeedPosts(posts, { syncBonds: {}, liveUsersActive: [], now })
    expect(sorted[0].id).toBe('echo')
  })
})

describe('computeGlobalFeed', () => {
  it('includes own posts and applies live filter', () => {
    const result = computeGlobalFeed({
      profilePosts: {
        me: [basePost({ id: 'mine', ownerId: 'me', text: 'Mi post' })],
        u2: [basePost({ id: 'other' })],
      },
      effectiveUserId: 'me',
      syncBonds: {},
      liveUsersActive: [
        {
          id: 'u2',
          name: 'U2',
          trainingNow: true,
          trainingSince: now - 30_000,
        } as LiveUserLike,
      ],
      realProfiles: [{ id: 'u2', name: 'U2', lat: -33.4, lng: -70.6 }],
      currentUser: { name: 'Yo' },
      feedShowPinnedOnly: false,
      feedOnlyReal: false,
      feedOnlyLive: true,
      feedSearch: '',
      feedDisplayLimit: 20,
      isSeedProfileId: () => false,
      now,
    })
    expect(result.feedPosts.some((p) => p.isMine)).toBe(false)
    expect(result.feedPosts.every((p) => p.ownerId === 'u2')).toBe(true)
  })
})
