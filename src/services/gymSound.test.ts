import { describe, expect, it } from 'vitest'
import { getPublicGymSound, getPublicGymSoundAnthem } from './gymSound'

describe('gymSound service', () => {
  it('getPublicGymSound prefers Spotify over manual anthem', () => {
    const spotify = {
      trackName: 'Eye of the Tiger',
      artistName: 'Survivor',
      isPlaying: true,
      updatedAt: Date.now(),
    }
    const result = getPublicGymSound({
      trainingNow: true,
      spotifyShareLive: true,
      spotifyNowPlaying: spotify,
      gymSoundAnthem: {
        trackName: 'Other',
        trackUrl: 'https://music.youtube.com/watch?v=abc',
        provider: 'youtube-music',
        updatedAt: Date.now(),
      },
    })
    expect(result?.provider).toBe('spotify')
    expect(result?.trackName).toBe('Eye of the Tiger')
  })

  it('getPublicGymSound falls back to anthem when no Spotify', () => {
    const result = getPublicGymSound({
      trainingNow: true,
      spotifyShareLive: true,
      gymSoundAnthem: {
        trackName: 'Gym Banger',
        artistName: 'DJ Fit',
        trackUrl: 'https://music.youtube.com/watch?v=abc',
        provider: 'youtube-music',
        updatedAt: Date.now(),
      },
    })
    expect(result?.provider).toBe('youtube-music')
    expect(result?.trackName).toBe('Gym Banger')
  })

  it('getPublicGymSoundAnthem requires live + opt-in', () => {
    const anthem = {
      trackName: 'X',
      trackUrl: 'https://youtu.be/abc',
      provider: 'youtube' as const,
      updatedAt: Date.now(),
    }
    expect(getPublicGymSoundAnthem({ trainingNow: true, spotifyShareLive: true, gymSoundAnthem: anthem })).toEqual(
      anthem
    )
    expect(getPublicGymSoundAnthem({ trainingNow: false, spotifyShareLive: true, gymSoundAnthem: anthem })).toBeUndefined()
  })
})
