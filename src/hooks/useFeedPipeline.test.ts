import { describe, expect, it } from 'vitest'
import { buildFeedPipeline } from './useFeedPipeline'

describe('useFeedPipeline', () => {
  it('ranks own fresh post above community when no filters', () => {
    const now = Date.now()
    const result = buildFeedPipeline({
      profilePosts: {
        me: [
          {
            id: 'mine',
            userId: 'me',
            text: 'Pierna',
            timestamp: now,
            pinned: false,
          },
        ],
        other: [
          {
            id: 'other',
            userId: 'other',
            text: 'Cardio',
            timestamp: now - 60_000,
            pinned: false,
          },
        ],
      },
      effectiveUserId: 'me',
      syncBonds: {},
      liveUsersActive: [],
      userLocation: null,
      realProfiles: [{ id: 'other', name: 'Ana' }],
      currentUser: { name: 'Yo' },
      feedShowPinnedOnly: false,
      feedOnlyReal: false,
      feedOnlyLive: false,
      feedSearch: '',
      feedDisplayLimit: 10,
      isSeedProfileId: () => false,
    })

    expect(result.feedPosts[0]?.id).toBe('mine')
    expect(result.computeMs).toBeGreaterThanOrEqual(0)
  })

  it('filters live-only posts', () => {
    const now = Date.now()
    const result = buildFeedPipeline({
      profilePosts: {
        live: [{ id: 'l1', userId: 'live', text: 'En gym', timestamp: now }],
        quiet: [{ id: 'q1', userId: 'quiet', text: 'Descanso', timestamp: now }],
      },
      effectiveUserId: 'me',
      syncBonds: {},
      liveUsersActive: [{ id: 'live', trainingNow: true, trainingNowSince: now }],
      userLocation: null,
      realProfiles: [
        { id: 'live', name: 'Live' },
        { id: 'quiet', name: 'Quiet' },
      ],
      currentUser: { name: 'Yo' },
      feedShowPinnedOnly: false,
      feedOnlyReal: false,
      feedOnlyLive: true,
      feedSearch: '',
      feedDisplayLimit: 10,
      isSeedProfileId: () => false,
      now,
    })

    expect(result.feedPosts.every((p) => p.ownerId === 'live')).toBe(true)
    expect(result.hasActiveFilter).toBe(true)
  })
})
