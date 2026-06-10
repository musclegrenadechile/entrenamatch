import { describe, expect, it } from 'vitest'
import { buildGymVibeSummary } from './gymSoundVibe'

describe('gymSoundVibe', () => {
  it('returns null with fewer than 2 live users sharing music at gym', () => {
    expect(
      buildGymVibeSummary(
        [
          {
            id: 'u1',
            trainingNow: true,
            gymCheckIn: { gymId: 'g1' },
            spotifyShareLive: true,
            spotifyNowPlaying: {
              trackName: 'A',
              artistName: 'Artist A',
              isPlaying: true,
              updatedAt: Date.now(),
            },
          },
        ],
        'g1'
      )
    ).toBeNull()
  })

  it('aggregates top artist when 2+ share music at same gym', () => {
    const now = Date.now()
    const vibe = buildGymVibeSummary(
      [
        {
          id: 'u1',
          trainingNow: true,
          gymCheckIn: { gymId: 'g1', gymName: 'Gold Gym' },
          spotifyShareLive: true,
          spotifyNowPlaying: {
            trackName: 'T1',
            artistName: 'Bad Bunny',
            isPlaying: true,
            updatedAt: now,
          },
        },
        {
          id: 'u2',
          trainingNow: true,
          gymCheckIn: { gymId: 'g1' },
          spotifyShareLive: true,
          spotifyNowPlaying: {
            trackName: 'T2',
            artistName: 'Bad Bunny',
            isPlaying: true,
            updatedAt: now,
          },
        },
      ],
      'g1',
      'Gold Gym'
    )
    expect(vibe?.liveWithMusic).toBe(2)
    expect(vibe?.topArtist).toBe('Bad Bunny')
    expect(vibe?.topCount).toBe(2)
    expect(vibe?.gymName).toBe('Gold Gym')
    expect(vibe?.listeners).toHaveLength(2)
    expect(vibe?.topTrack).toBe('T1')
  })
})
