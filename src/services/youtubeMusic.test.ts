import { describe, expect, it } from 'vitest'
import { isYoutubeMusicUrl, isYoutubeUrl, normalizeYoutubeUrl } from './youtubeMusic'

describe('youtubeMusic service', () => {
  it('normalizeYoutubeUrl accepts youtube and youtu.be', () => {
    expect(normalizeYoutubeUrl('https://youtu.be/abc123')).toBe('https://youtu.be/abc123')
    expect(normalizeYoutubeUrl('https://music.youtube.com/watch?v=abc')).toBe(
      'https://music.youtube.com/watch?v=abc'
    )
    expect(normalizeYoutubeUrl('not-a-url')).toBeNull()
  })

  it('isYoutubeUrl detects hosts', () => {
    expect(isYoutubeUrl('https://www.youtube.com/watch?v=x')).toBe(true)
    expect(isYoutubeUrl('https://example.com/x')).toBe(false)
  })

  it('isYoutubeMusicUrl detects music host', () => {
    expect(isYoutubeMusicUrl('https://music.youtube.com/watch?v=x')).toBe(true)
    expect(isYoutubeMusicUrl('https://youtu.be/x')).toBe(false)
  })
})
