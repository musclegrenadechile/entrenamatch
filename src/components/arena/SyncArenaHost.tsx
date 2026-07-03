import type { RefObject } from 'react'
import { useMemo } from 'react'
import { useWearableLiveHr } from '../../hooks/useWearableLiveHr'
import { getDistanceKm } from '../../utils'
import { buildGymSoundSyncMatch } from '../../services/gymSoundSyncMatch'
import { countLoggedSets } from '../../utils/arenaWorkoutLog'
import type { SyncWorkoutLogState } from '../../utils/arenaWorkoutLog'
import type { CurrentUser, Profile, Tab } from '../../types'
import type { WeeklyPactProgress } from '../../services/weeklyPact'
import { ArenaGlobalPulseBar } from './index'
import { LazySyncArenaView } from './LazySyncArenaView'

export interface SyncArenaHostProps {
  syncPartnerId: string | null
  showSyncArena: boolean
  showTrainerCoach: boolean
  showMarketplace: boolean
  showEntrenaLogModal: boolean
  currentUser: CurrentUser
  effectiveUserId: string
  firebaseUserUid?: string | null
  realProfiles: Profile[]
  userLocation: { lat: number; lng: number } | null
  syncStartedAt: number | null
  syncVibe: number
  syncCombo: number
  syncActions: Array<{ id: string; emoji: string; userId: string; at: number; label?: string }>
  syncBonds: Record<string, { bondLevel?: number }>
  syncRealWitnessCount: number
  syncWitnessIds: string[]
  syncPartnerLiveState: import('../../utils/arenaSyncState').ArenaParticipantLiveState | null
  syncRestUntil: number | null
  syncRestStartedBy: string | null
  syncWorkoutLog: SyncWorkoutLogState
  liveTrainingNow: Profile[]
  arenaWaveCount: number
  activeSyncPairs: Array<{ names: string; vibe: number; minutes?: number }>
  homeWeeklyPactProgress: WeeklyPactProgress | null
  activeTab: Tab
  redSubTab: string
  activeChat: string | null
  isArenaVoiceRecording: boolean
  isUserLive: (id: string) => boolean
  onMinimizeArena: () => void
  onOpenArena: () => void
  onEndSync: () => void | Promise<void>
  onSyncAction: (actionId: string, emoji: string, label: string) => void | Promise<void>
  onCapturePhoto: () => void | Promise<void>
  onVoicePing: () => void | Promise<void>
  onWorkoutLogChange: (patch: Partial<SyncWorkoutLogState>) => void
  persistSyncWorkoutLogToSession: (log: SyncWorkoutLogState) => void | Promise<void>
  arenaPhotoInputRef: RefObject<HTMLInputElement | null>
  arenaPhotoResolverRef: RefObject<((url: string | null) => void) | null>
}

export function SyncArenaHost(props: SyncArenaHostProps) {
  const {
    syncPartnerId,
    showSyncArena,
    showTrainerCoach,
    showMarketplace,
    showEntrenaLogModal,
    currentUser,
    effectiveUserId,
    firebaseUserUid,
    realProfiles,
    userLocation,
    syncStartedAt,
    syncVibe,
    syncCombo,
    syncActions,
    syncBonds,
    syncRealWitnessCount,
    syncWitnessIds,
    syncPartnerLiveState,
    syncRestUntil,
    syncRestStartedBy,
    syncWorkoutLog,
    liveTrainingNow,
    arenaWaveCount,
    activeSyncPairs,
    homeWeeklyPactProgress,
    activeTab,
    redSubTab,
    activeChat,
    isArenaVoiceRecording,
    isUserLive,
    onMinimizeArena,
    onOpenArena,
    onEndSync,
    onSyncAction,
    onCapturePhoto,
    onVoicePing,
    onWorkoutLogChange,
    persistSyncWorkoutLogToSession,
    arenaPhotoInputRef,
    arenaPhotoResolverRef,
  } = props

  const partner = syncPartnerId ? realProfiles.find((p) => p.id === syncPartnerId) : null
  const dist =
    syncPartnerId && userLocation && partner?.lat != null && partner?.lng != null
      ? getDistanceKm(userLocation.lat, userLocation.lng, partner.lat, partner.lng)
      : null
  const bond = syncPartnerId ? syncBonds[syncPartnerId] : undefined
  const excludeIds = new Set([effectiveUserId, syncPartnerId, 'me', firebaseUserUid].filter(Boolean))
  const redLiveCount = Object.keys(syncBonds).filter(
    (id) => !excludeIds.has(id) && isUserLive(id)
  ).length
  const witnessProfiles = syncWitnessIds.slice(0, 5).map((id) => {
    const p = realProfiles.find((pr) => pr.id === id)
    return p ? { id, name: p.name, photo: p.photos?.[0] } : { id, name: 'Atleta' }
  })

  const liveHeartRateBpm = useWearableLiveHr(
    !!syncPartnerId && showSyncArena && !!currentUser.wearableHealthConnected,
    syncStartedAt
  )

  const gymSoundSyncMatch = useMemo(
    () => buildGymSoundSyncMatch(currentUser, partner),
    [
      currentUser?.spotifyNowPlaying,
      currentUser?.gymSoundAnthem,
      currentUser?.spotifyShareLive,
      currentUser?.trainingNow,
      partner?.spotifyNowPlaying,
      partner?.gymSoundAnthem,
      partner?.spotifyShareLive,
      partner?.trainingNow,
    ]
  )

  return (
    <>
      <input
        ref={arenaPhotoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          const resolve = arenaPhotoResolverRef.current
          arenaPhotoResolverRef.current = null
          if (!file || !resolve) {
            resolve?.(null)
            return
          }
          const reader = new FileReader()
          reader.onload = () => {
            resolve(typeof reader.result === 'string' ? reader.result : null)
            e.target.value = ''
          }
          reader.onerror = () => {
            resolve(null)
            e.target.value = ''
          }
          reader.readAsDataURL(file)
        }}
      />

      {syncPartnerId && showSyncArena && (
        <LazySyncArenaView
          open
          onMinimize={onMinimizeArena}
          onEndSync={onEndSync}
          selfName={currentUser.name || 'Tú'}
          selfPhoto={currentUser.photos?.[0]}
          partnerName={partner?.name || 'Compañero'}
          partnerPhoto={partner?.photos?.[0]}
          partnerId={syncPartnerId}
          effectiveUserId={effectiveUserId}
          syncStartedAt={syncStartedAt}
          syncVibe={syncVibe}
          syncCombo={syncCombo}
          syncActions={syncActions}
          bondLevel={bond?.bondLevel ?? 1}
          isNetworkBond={!!bond}
          distanceKm={dist}
          liveNearbyCount={liveTrainingNow.length}
          witnessCount={syncRealWitnessCount}
          witnessProfiles={witnessProfiles}
          redLiveCount={redLiveCount}
          cityLabel={currentUser.city || partner?.city}
          partnerLiveState={syncPartnerLiveState}
          restUntil={syncRestUntil}
          restStartedBy={syncRestStartedBy}
          weeklyPactProgress={homeWeeklyPactProgress}
          isRecordingVoice={isArenaVoiceRecording}
          gymSoundSyncMatch={gymSoundSyncMatch}
          liveHeartRateBpm={liveHeartRateBpm}
          waveCount={arenaWaveCount}
          onSyncAction={onSyncAction}
          onCapturePhoto={onCapturePhoto}
          onVoicePing={onVoicePing}
          activeExercise={syncWorkoutLog.activeExercise}
          pendingReps={syncWorkoutLog.pendingReps}
          pendingWeightKg={syncWorkoutLog.pendingWeightKg}
          loggedSetCount={countLoggedSets(syncWorkoutLog)}
          selfExercises={syncWorkoutLog.exercises}
          onActiveExerciseChange={(name) => {
            onWorkoutLogChange({ activeExercise: name })
            void persistSyncWorkoutLogToSession({
              ...syncWorkoutLog,
              activeExercise: name,
            })
          }}
          onPendingRepsChange={(reps) => {
            onWorkoutLogChange({ pendingReps: reps })
            void persistSyncWorkoutLogToSession({
              ...syncWorkoutLog,
              pendingReps: reps,
            })
          }}
          onPendingWeightChange={(kg) => {
            onWorkoutLogChange({ pendingWeightKg: kg })
            void persistSyncWorkoutLogToSession({
              ...syncWorkoutLog,
              pendingWeightKg: kg,
            })
          }}
        />
      )}

      {syncPartnerId && !showSyncArena && !showTrainerCoach && !showMarketplace && !showEntrenaLogModal && (
        <ArenaGlobalPulseBar
          partnerName={partner?.name || 'Compañero'}
          syncVibe={syncVibe}
          witnessCount={syncRealWitnessCount}
          waveCount={arenaWaveCount}
          globalPairs={activeSyncPairs}
          onOpenArena={onOpenArena}
          preferCollapsed={activeTab === 'red' && redSubTab === 'messages' && !!activeChat}
        />
      )}
    </>
  )
}
