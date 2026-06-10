/**
 * GymSound Phase 2 — YouTube / YouTube Music manual anthem (no OAuth).
 */

import type { GymSoundAnthem } from '../types'

const YT_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be'])

export function isYoutubeMusicUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.replace(/^www\./, '')
    if (host === 'music.youtube.com') return true
    if (host === 'youtu.be' || host === 'youtube.com' || host === 'm.youtube.com') {
      return url.includes('music.youtube') || url.includes('list=')
    }
    return false
  } catch {
    return false
  }
}

export function isYoutubeUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.replace(/^www\./, '')
    return YT_HOSTS.has(host) || host.endsWith('.youtube.com')
  } catch {
    return false
  }
}

export function normalizeYoutubeUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    const host = url.hostname.replace(/^www\./, '')
    if (!YT_HOSTS.has(host) && !host.endsWith('.youtube.com')) return null
    return url.toString()
  } catch {
    return null
  }
}

export type YoutubeOEmbed = {
  title: string
  authorName?: string
  thumbnailUrl?: string
}

/** Public oEmbed — no API key required. */
export async function fetchYoutubeOEmbed(url: string): Promise<YoutubeOEmbed | null> {
  const normalized = normalizeYoutubeUrl(url)
  if (!normalized) return null

  try {
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(normalized)}&format=json`
    const res = await fetch(endpoint)
    if (!res.ok) return null
    const data = (await res.json()) as {
      title?: string
      author_name?: string
      thumbnail_url?: string
    }
    if (!data.title?.trim()) return null
    return {
      title: data.title.trim(),
      authorName: data.author_name?.trim(),
      thumbnailUrl: data.thumbnail_url,
    }
  } catch {
    return null
  }
}

export async function buildGymSoundAnthemFromUrl(url: string): Promise<GymSoundAnthem | null> {
  const normalized = normalizeYoutubeUrl(url)
  if (!normalized) return null

  const oembed = await fetchYoutubeOEmbed(normalized)
  const provider = isYoutubeMusicUrl(normalized) ? 'youtube-music' : 'youtube'

  return {
    trackName: oembed?.title || 'Tema de entreno',
    artistName: oembed?.authorName || (provider === 'youtube-music' ? 'YouTube Music' : 'YouTube'),
    albumArtUrl: oembed?.thumbnailUrl,
    trackUrl: normalized,
    provider,
    updatedAt: Date.now(),
  }
}
