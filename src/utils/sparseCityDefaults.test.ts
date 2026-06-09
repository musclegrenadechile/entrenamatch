import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildInviteLink,
  resolveShareableAppBase,
  sanitizeShareUrl,
  shareableAppHostname,
} from './sparseCityDefaults'

function mockLocation(hostname: string, origin: string, pathname = '/') {
  vi.stubGlobal('window', {
    location: { hostname, origin, pathname },
  })
}

describe('resolveShareableAppBase', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses production URL on Capacitor localhost', () => {
    mockLocation('localhost', 'https://localhost', '/')
    expect(resolveShareableAppBase()).toBe('https://entrenamatch.web.app')
  })

  it('uses production URL on LAN dev server', () => {
    mockLocation('192.168.1.42', 'http://192.168.1.42:5173', '/')
    expect(resolveShareableAppBase()).toBe('https://entrenamatch.web.app')
  })

  it('keeps origin when already on public hosting', () => {
    mockLocation('entrenamatch.web.app', 'https://entrenamatch.web.app', '/')
    expect(resolveShareableAppBase()).toBe('https://entrenamatch.web.app')
  })

  it('uses Firebase when opened on legacy GitHub Pages', () => {
    mockLocation(
      'musclegrenadechile.github.io',
      'https://musclegrenadechile.github.io',
      '/entrenamatch/'
    )
    expect(resolveShareableAppBase()).toBe('https://entrenamatch.web.app')
    expect(shareableAppHostname()).toBe('entrenamatch.web.app')
  })
})

describe('buildInviteLink', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('never emits localhost invite links from APK WebView', () => {
    mockLocation('localhost', 'https://localhost', '/')
    expect(buildInviteLink('WEB5PLwMb9NrdkecF26FScDtjU63')).toBe(
      'https://entrenamatch.web.app?ref=WEB5PLwMb9NrdkecF26FScDtjU63'
    )
  })

  it('never shares legacy GitHub invite links', () => {
    mockLocation(
      'musclegrenadechile.github.io',
      'https://musclegrenadechile.github.io',
      '/entrenamatch/index.html'
    )
    expect(buildInviteLink('abc123')).toBe('https://entrenamatch.web.app?ref=abc123')
  })
})

describe('sanitizeShareUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rewrites localhost share URLs preserving ref', () => {
    mockLocation('localhost', 'https://localhost', '/')
    expect(
      sanitizeShareUrl('https://localhost/?ref=WEB5PLwMb9NrdkecF26FScDtjU63')
    ).toBe('https://entrenamatch.web.app?ref=WEB5PLwMb9NrdkecF26FScDtjU63')
  })

  it('passes through valid public URLs', () => {
    expect(sanitizeShareUrl('https://entrenamatch.web.app?ref=abc')).toBe(
      'https://entrenamatch.web.app?ref=abc'
    )
    expect(
      sanitizeShareUrl('https://musclegrenadechile.github.io/entrenamatch?ref=xyz')
    ).toBe('https://entrenamatch.web.app?ref=xyz')
  })
})
