import { demoStorage, DEMO_KEYS } from '../services/demoStorage'
import type { CurrentUser } from '../types'

export function profileCacheKey(uid: string): string {
  return `${DEMO_KEYS.PROFILE}:${uid}`
}

export function readCachedProfile(uid: string | undefined): CurrentUser | null {
  if (uid) {
    const scoped = demoStorage.get<CurrentUser>(profileCacheKey(uid))
    if (scoped?.name?.trim()) return scoped
  }
  const legacy = demoStorage.get<CurrentUser>(DEMO_KEYS.PROFILE)
  if (legacy?.name?.trim()) return legacy
  return null
}

export function writeCachedProfile(uid: string | undefined, user: CurrentUser): void {
  if (uid) {
    demoStorage.set(profileCacheKey(uid), user)
    demoStorage.remove(DEMO_KEYS.PROFILE)
    return
  }
  demoStorage.set(DEMO_KEYS.PROFILE, user)
}

export function clearCachedProfile(uid?: string): void {
  if (uid) demoStorage.remove(profileCacheKey(uid))
  demoStorage.remove(DEMO_KEYS.PROFILE)
}
