import type { Profile } from '../types'

/** Stable signature for live map merge — skip redundant React updates. */
export function liveUsersSnapshotSignature(users: Array<Profile | { id: string }>): string {
  return users
    .map((u) => {
      const p = u as Profile & {
        liveMotionAt?: number
        trainingNowSince?: number
      }
      const lat = Number.isFinite(Number(p.lat)) ? Number(p.lat).toFixed(4) : ''
      const lng = Number.isFinite(Number(p.lng)) ? Number(p.lng).toFixed(4) : ''
      return [
        p.id,
        p.trainingNow ? 1 : 0,
        lat,
        lng,
        p.trainingNowSince ?? '',
        p.liveMotionAt ?? '',
        (p as Profile & { liveMotionIdle?: boolean }).liveMotionIdle ? 1 : 0,
      ].join(':')
    })
    .sort()
    .join('|')
}

export function partnerLocationsSignature(
  partners: Array<{ id: string; lat?: number; lng?: number; name?: string; logoUrl?: string }>
): string {
  return partners
    .map((p) =>
      [
        p.id,
        Number(p.lat ?? 0).toFixed(5),
        Number(p.lng ?? 0).toFixed(5),
        p.name ?? '',
        p.logoUrl ?? '',
      ].join(':')
    )
    .sort()
    .join('|')
}
