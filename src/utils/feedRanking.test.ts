import { describe, expect, it } from 'vitest'
import {
  computeFeedPostScore,
  computeGlobalFeed,
  isEchoPost,
  limitConsecutiveSameAuthor,
  pickFeedDisplayBadges,
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

  it('prefers photo and comments over auto templates', () => {
    const auto = basePost({ text: '¡Entrenando ahora en el Mapa LIVE! ¿Quién se une?' })
    const social = basePost({
      id: 'p2',
      text: 'Terminé pierna con el equipo',
      photo: 'https://example.com/gym.jpg',
      comments: [{ id: 'c1' }, { id: 'c2' }],
    })
    const ctx = { syncBonds: {}, liveUsersActive: [], now }
    expect(computeFeedPostScore(social, ctx)).toBeGreaterThan(computeFeedPostScore(auto, ctx))
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

describe('limitConsecutiveSameAuthor', () => {
  it('breaks runs of more than two posts from the same owner', () => {
    const posts = [
      basePost({ id: 'a1', ownerId: 'jorge' }),
      basePost({ id: 'a2', ownerId: 'jorge' }),
      basePost({ id: 'a3', ownerId: 'jorge' }),
      basePost({ id: 'b1', ownerId: 'maria' }),
    ]
    const mixed = limitConsecutiveSameAuthor(posts)
    for (let i = 0; i < mixed.length - 2; i++) {
      const trio = mixed.slice(i, i + 3)
      const sameOwner = trio.every((p) => p.ownerId === trio[0].ownerId)
      expect(sameOwner).toBe(false)
    }
    expect(mixed.map((p) => p.id).sort()).toEqual(['a1', 'a2', 'a3', 'b1'].sort())
  })
})

describe('pickFeedDisplayBadges', () => {
  it('returns at most two badges prioritizing live and proximity', () => {
    const badges = pickFeedDisplayBadges({
      isMine: false,
      isReal: true,
      isPinned: false,
      isNew: true,
      isSyncPost: true,
      isEcho: false,
      ownerTrainingNow: true,
      rankBadges: { live: true, near: true, bond: true, echo: false },
    })
    expect(badges).toHaveLength(2)
    expect(badges[0].label).toBe('🟢 LIVE AHORA')
    expect(badges[1].label).toBe('SYNC')
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
