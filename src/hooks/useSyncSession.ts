import { useEffect, useMemo, useRef, useState } from 'react'
import type { ArenaParticipantLiveState } from '../utils/arenaSyncState'
import type { SyncWorkoutLogState } from '../utils/arenaWorkoutLog'
import { createEmptySyncWorkoutLog } from '../utils/arenaWorkoutLog'

export type SyncBond = {
  totalMin: number
  sessions: number
  avgRating: number
  bondLevel: number
}

/** Fase 123 — EntrenaSync session state bundle (Arena, bonds, partner pointer) */
export function useSyncSession() {
  const [syncPartnerId, setSyncPartnerId] = useState<string | null>(null)
  const [syncStartedAt, setSyncStartedAt] = useState<number | null>(null)
  const [syncActions, setSyncActions] = useState<
    Array<{ id: string; emoji: string; userId: string; at: number; label?: string }>
  >([])
  const [syncVibe, setSyncVibe] = useState(0)
  const [pendingSyncRating, setPendingSyncRating] = useState<{
    partnerId: string
    partnerName: string
    minutes: number
  } | null>(null)
  const [activeSyncCount, setActiveSyncCount] = useState(0)
  const [joiningSyncWith, setJoiningSyncWith] = useState<string | null>(null)
  const [syncCombo, setSyncCombo] = useState(0)
  const [flyingEmojis, setFlyingEmojis] = useState<Array<{ id: string; emoji: string; label?: string }>>([])
  const [arenaWaveCount, setArenaWaveCount] = useState(0)
  const [lastArenaWaveLabel, setLastArenaWaveLabel] = useState('')
  const [arenaWavePulseKey, setArenaWavePulseKey] = useState(0)
  const [syncRealWitnessCount, setSyncRealWitnessCount] = useState(0)
  const [showSyncArena, setShowSyncArena] = useState(false)
  const [syncRipples, setSyncRipples] = useState<
    Array<{ id: string; lat: number; lng: number; label?: string; intensity?: number }>
  >([])
  const [syncBonds, setSyncBonds] = useState<Record<string, SyncBond>>({})
  const [lastSyncStory, setLastSyncStory] = useState<Record<string, unknown> | null>(null)
  const [syncWorkoutLog, setSyncWorkoutLog] = useState<SyncWorkoutLogState>(createEmptySyncWorkoutLog())
  const [syncPartnerLiveState, setSyncPartnerLiveState] = useState<ArenaParticipantLiveState | null>(null)
  const [syncRestUntil, setSyncRestUntil] = useState<number | null>(null)
  const [syncRestStartedBy, setSyncRestStartedBy] = useState<string | null>(null)
  const [syncWitnessIds, setSyncWitnessIds] = useState<string[]>([])

  const syncPartnerIdRef = useRef<string | null>(null)
  const syncBondsRef = useRef<Record<string, SyncBond>>({})
  const witnessedSessionsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    syncPartnerIdRef.current = syncPartnerId
  }, [syncPartnerId])
  useEffect(() => {
    syncBondsRef.current = syncBonds
  }, [syncBonds])

  const networkStats = useMemo(() => {
    const bonds = syncBonds || {}
    const numPartners = Object.keys(bonds).length
    if (numPartners === 0) {
      return { networkPower: 0, totalMin: 0, totalSessions: 0, estimatedImpact: 0, numPartners: 0 }
    }
    const totalMin = Object.values(bonds).reduce((sum, b) => sum + (b.totalMin || 0), 0)
    const totalSessions = Object.values(bonds).reduce((sum, b) => sum + (b.sessions || 0), 0)
    const avgBond = Object.values(bonds).reduce((sum, b) => sum + (b.bondLevel || 1), 0) / numPartners
    const estimatedImpact = Math.min(52, Math.floor(totalMin / 7))
    const networkPower = Math.round(avgBond * totalSessions * 0.8)
    return { networkPower, totalMin, totalSessions, estimatedImpact, numPartners }
  }, [syncBonds])

  return {
    syncPartnerId,
    setSyncPartnerId,
    syncStartedAt,
    setSyncStartedAt,
    syncActions,
    setSyncActions,
    syncVibe,
    setSyncVibe,
    pendingSyncRating,
    setPendingSyncRating,
    activeSyncCount,
    setActiveSyncCount,
    joiningSyncWith,
    setJoiningSyncWith,
    syncCombo,
    setSyncCombo,
    flyingEmojis,
    setFlyingEmojis,
    arenaWaveCount,
    setArenaWaveCount,
    lastArenaWaveLabel,
    setLastArenaWaveLabel,
    arenaWavePulseKey,
    setArenaWavePulseKey,
    syncRealWitnessCount,
    setSyncRealWitnessCount,
    showSyncArena,
    setShowSyncArena,
    syncRipples,
    setSyncRipples,
    syncBonds,
    setSyncBonds,
    lastSyncStory,
    setLastSyncStory,
    syncWorkoutLog,
    setSyncWorkoutLog,
    syncPartnerLiveState,
    setSyncPartnerLiveState,
    syncRestUntil,
    setSyncRestUntil,
    syncRestStartedBy,
    setSyncRestStartedBy,
    syncWitnessIds,
    setSyncWitnessIds,
    syncPartnerIdRef,
    syncBondsRef,
    witnessedSessionsRef,
    networkStats,
  }
}
