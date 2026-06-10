/**

 * GymSound — "vibra del gym": aggregate public music at the same gym.

 */



import type { LiveUserLike } from '../utils/gymPulseLive'

import { getPublicGymSound } from './gymSound'



export type GymVibeListener = {

  userId: string

  name: string

  trackName: string

  artistName: string

}



export type GymVibeSummary = {

  liveWithMusic: number

  topArtist: string

  topCount: number

  topTrack?: string

  topTrackCount?: number

  gymName?: string

  /** Who nearby is listening — up to 6 entries */

  listeners: GymVibeListener[]

}



export function buildGymVibeSummary(

  liveUsers: LiveUserLike[],

  gymId?: string | null,

  gymName?: string | null

): GymVibeSummary | null {

  if (!gymId) return null



  const atGym = (liveUsers || []).filter(

    (u) => u.trainingNow && u.gymCheckIn?.gymId === gymId

  )



  const listeners: GymVibeListener[] = []

  const tracks: Array<{ trackName: string; artistName: string }> = []



  for (const u of atGym) {

    const display = getPublicGymSound({

      trainingNow: true,

      spotifyShareLive: u.spotifyShareLive === true,

      spotifyNowPlaying: u.spotifyNowPlaying,

      gymSoundAnthem: u.gymSoundAnthem,

    })

    if (!display?.trackName) continue

    tracks.push({

      trackName: display.trackName,

      artistName: display.artistName || 'Música',

    })

    listeners.push({

      userId: u.id,

      name: u.name || 'Atleta',

      trackName: display.trackName,

      artistName: display.artistName || 'Música',

    })

  }



  if (tracks.length < 2) return null



  const byArtist = new Map<string, number>()

  const byTrack = new Map<string, { count: number; artist: string }>()

  for (const t of tracks) {

    const artist = (t.artistName || 'Música').trim()

    byArtist.set(artist, (byArtist.get(artist) || 0) + 1)

    const key = `${t.trackName}::${artist}`

    const prev = byTrack.get(key)

    byTrack.set(key, { count: (prev?.count || 0) + 1, artist })

  }



  const sortedArtists = [...byArtist.entries()].sort((a, b) => b[1] - a[1])

  const [topArtist, topCount] = sortedArtists[0] || ['Música', 1]



  const sortedTracks = [...byTrack.entries()].sort((a, b) => b[1].count - a[1].count)

  const topTrackEntry = sortedTracks[0]

  const topTrack = topTrackEntry ? topTrackEntry[0].split('::')[0] : undefined

  const topTrackCount = topTrackEntry?.[1].count



  return {

    liveWithMusic: tracks.length,

    topArtist,

    topCount,

    topTrack,

    topTrackCount,

    gymName: gymName || undefined,

    listeners: listeners.slice(0, 6),

  }

}

