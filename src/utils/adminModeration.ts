import type { Profile } from '../types'
import { isActiveLiveUser, normalizeTrainingSince, type LiveUserLike } from './gymPulseLive'
import { isBetaBotProfile } from './betaBots'

export function formatLiveDuration(since: number | undefined, now = Date.now()): string {
  const t = Number(since || 0)
  if (t <= 0) return 'recién'
  const mins = Math.floor((now - t) / 60_000)
  if (mins < 1) return 'recién'
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function sortLiveUsersForAdmin(users: LiveUserLike[], now = Date.now()): LiveUserLike[] {
  return [...users]
    .filter((u) => u?.id && isActiveLiveUser(u, now))
    .sort((a, b) => {
      const aSince = Number(normalizeTrainingSince(a.trainingNowSince) || 0)
      const bSince = Number(normalizeTrainingSince(b.trainingNowSince) || 0)
      return aSince - bSince
    })
}

export function filterProfilesForAdminSearch(
  profiles: Profile[],
  queryText: string,
  limit = 40
): Profile[] {
  const q = queryText.trim().toLowerCase()
  if (!q) return []
  const matches: Profile[] = []
  for (const p of profiles) {
    if (!p.id) continue
    const hay = [p.id, p.name, p.city].filter(Boolean).join(' ').toLowerCase()
    if (hay.includes(q)) matches.push(p)
    if (matches.length >= limit) break
  }
  return matches
}

export function adminActionLabel(action: string): string {
  switch (action) {
    case 'end_live':
      return 'Apagó LIVE'
    case 'suspend_user':
      return 'Suspendió cuenta'
    case 'unsuspend_user':
      return 'Reactivó cuenta'
    case 'delete_user':
      return 'Eliminó cuenta'
    case 'self_delete_user':
      return 'Auto-eliminación'
    default:
      return action
  }
}

export function canAdminBanProfile(profile: { id?: string; name?: string }): boolean {
  if (!profile.id) return false
  return !isBetaBotProfile(profile)
}
