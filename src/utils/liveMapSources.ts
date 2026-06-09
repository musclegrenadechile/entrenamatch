/**
 * Fase 75 — livePresence primary source for map merge.
 * Pure helpers so CI can assert no duplicate pins when presence is healthy.
 */

import type { LiveUserLike } from './gymPulseLive'
import { mergeLiveUsersById } from './gymPulseLive'

export type LiveMapSourceMode = 'presence' | 'profiles_fallback' | 'presence_error_fallback'

export interface LiveMapMergeInput {
  presenceHealthy: boolean
  presenceUsers: LiveUserLike[]
  profilesQueryUsers: LiveUserLike[]
}

export interface LiveMapMergeResult {
  mode: LiveMapSourceMode
  profilesForMerge: LiveUserLike[]
  merged: LiveUserLike[]
}

/** When livePresence listener is healthy, profiles.trainingNow query must not contribute pins. */
export function resolveLiveMapMerge(input: LiveMapMergeInput): LiveMapMergeResult {
  const { presenceHealthy, presenceUsers, profilesQueryUsers } = input

  if (presenceHealthy) {
    return {
      mode: 'presence',
      profilesForMerge: [],
      merged: mergeLiveUsersById([presenceUsers]),
    }
  }

  return {
    mode: profilesQueryUsers.length > 0 ? 'profiles_fallback' : 'presence_error_fallback',
    profilesForMerge: profilesQueryUsers,
    merged: mergeLiveUsersById([presenceUsers, profilesQueryUsers]),
  }
}
