import { describe, expect, it } from 'vitest'

import {

  generateCodeVerifier,

  getPublicSpotifyNowPlaying,

  getSpotifyRedirectUri,

  parseSpotifyDeepLink,

  SPOTIFY_REDIRECT_CALLBACK,

  SPOTIFY_REDIRECT_WEB,

} from './spotify'



describe('spotify service', () => {

  it('generateCodeVerifier returns url-safe string', () => {

    const v = generateCodeVerifier()

    expect(v.length).toBeGreaterThan(40)

    expect(v).toMatch(/^[A-Za-z0-9_-]+$/)

  })



  it('getPublicSpotifyNowPlaying requires live + opt-in + fresh data', () => {

    const np = {

      trackName: 'Eye of the Tiger',

      artistName: 'Survivor',

      isPlaying: true,

      updatedAt: Date.now(),

    }

    expect(getPublicSpotifyNowPlaying({ trainingNow: true, spotifyShareLive: true, spotifyNowPlaying: np })).toEqual(np)

    expect(getPublicSpotifyNowPlaying({ trainingNow: false, spotifyShareLive: true, spotifyNowPlaying: np })).toBeUndefined()

    expect(getPublicSpotifyNowPlaying({ trainingNow: true, spotifyShareLive: false, spotifyNowPlaying: np })).toBeUndefined()

    expect(

      getPublicSpotifyNowPlaying({

        trainingNow: true,

        spotifyShareLive: true,

        spotifyNowPlaying: { ...np, updatedAt: Date.now() - 7 * 60_000 },

      })

    ).toBeUndefined()

  })



  it('getSpotifyRedirectUri ends with slash or .html for native callback', () => {

    expect(getSpotifyRedirectUri()).toMatch(/\/$|\.html$/)

  })



  it('getSpotifyRedirectUri uses HTTPS callback on Capacitor native', () => {

    const prev = (globalThis as { window?: Window }).window

    ;(globalThis as { window: Window }).window = {

      location: { protocol: 'https:', host: 'localhost', origin: 'https://localhost' },

      Capacitor: { isNativePlatform: () => true },

    } as unknown as Window

    expect(getSpotifyRedirectUri()).toBe(SPOTIFY_REDIRECT_CALLBACK)

    ;(globalThis as { window?: Window }).window = prev

  })



  it('parseSpotifyDeepLink reads app scheme callback', () => {

    const link = 'com.entrenamatch.app://spotify-auth?code=abc&state=xyz'

    expect(parseSpotifyDeepLink(link)).toEqual({ code: 'abc', state: 'xyz' })

    expect(parseSpotifyDeepLink('https://evil.com')).toBeNull()

  })



  it('SPOTIFY_REDIRECT constants are https', () => {

    expect(SPOTIFY_REDIRECT_WEB).toMatch(/^https:\/\//)

    expect(SPOTIFY_REDIRECT_CALLBACK).toMatch(/^https:\/\//)

  })

})


