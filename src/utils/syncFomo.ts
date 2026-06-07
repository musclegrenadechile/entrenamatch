/** Helpers for credible EntrenaSync FOMO copy (real counts only). */

export function countRedLiveMembers(
  syncBonds: Record<string, unknown> | null | undefined,
  liveUserIds: Set<string> | string[],
  excludeUid?: string | null
): number {
  const liveSet = liveUserIds instanceof Set ? liveUserIds : new Set(liveUserIds)
  return Object.keys(syncBonds || {}).filter(
    (id) => id !== excludeUid && id !== 'me' && liveSet.has(id)
  ).length
}

export function syncElapsedMinutes(startedAt?: number | null, now = Date.now()): number {
  if (!startedAt || startedAt <= 0) return 0
  return Math.max(0, Math.floor((now - startedAt) / 60000))
}

export function formatWitnessLabel(count: number): string {
  if (count <= 0) return ''
  return count === 1 ? '1 presenciando' : `${count} presenciando`
}

export function formatRedSyncFomoLine(redLiveCount: number, syncCount: number): string | null {
  if (redLiveCount <= 0 && syncCount <= 0) return null
  const parts: string[] = []
  if (redLiveCount > 0) {
    parts.push(
      redLiveCount === 1
        ? '1 de tu red en live'
        : `${redLiveCount} de tu red en live`
    )
  }
  if (syncCount > 0) {
    parts.push(
      syncCount === 1 ? '1 en sync ahora' : `${syncCount} en sync ahora`
    )
  }
  return parts.join(' · ')
}
