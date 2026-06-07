import type { TeamMemberStatus } from '../components/home/DailyHome'

export function formatLastLiveLabel(lastLiveDate?: number): string | undefined {
  if (!lastLiveDate || !Number.isFinite(lastLiveDate)) return undefined
  const diff = Date.now() - lastLiveDate
  if (diff < 60 * 60 * 1000) return 'Activo hace poco'
  if (diff < 24 * 60 * 60 * 1000) return 'Hoy'
  if (diff < 48 * 60 * 60 * 1000) return 'Ayer'
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  if (days < 7) return `Hace ${days} días`
  return undefined
}

export function getTeamMemberStatus(isLive: boolean, lastLiveDate?: number): TeamMemberStatus {
  if (isLive) return 'live'
  if (!lastLiveDate) return 'inactive'
  const diff = Date.now() - lastLiveDate
  if (diff < 48 * 60 * 60 * 1000) return 'recent'
  if (diff < 7 * 24 * 60 * 60 * 1000) return 'this_week'
  return 'inactive'
}

const STATUS_SORT: Record<TeamMemberStatus, number> = {
  live: 0,
  recent: 1,
  this_week: 2,
  inactive: 3,
}

export function sortTeamMembers<T extends { status: TeamMemberStatus; isBond: boolean }>(
  members: T[]
): T[] {
  return [...members].sort((a, b) => {
    const sd = STATUS_SORT[a.status] - STATUS_SORT[b.status]
    if (sd !== 0) return sd
    if (a.isBond && !b.isBond) return -1
    if (!a.isBond && b.isBond) return 1
    return 0
  })
}
