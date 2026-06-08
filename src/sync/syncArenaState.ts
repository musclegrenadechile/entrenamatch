/** Sync arena state types — extracted from App.tsx (Phase 62) */
export interface SyncArenaSnapshot {
  partnerId: string | null
  startedAt: number | null
  vibe: number
  showArena: boolean
}

export function createEmptySyncArenaSnapshot(): SyncArenaSnapshot {
  return { partnerId: null, startedAt: null, vibe: 0, showArena: false }
}

export function isSyncActive(s: SyncArenaSnapshot): boolean {
  return !!s.partnerId && s.showArena
}
