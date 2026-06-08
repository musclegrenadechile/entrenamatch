import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ArenaWeeklyMetaChip } from './ArenaWeeklyMetaChip'
import { ArenaSharedPulse } from './ArenaSharedPulse'
import { ArenaSetCard } from './ArenaSetCard'
import { ArenaSyncDock } from './ArenaSyncDock'
import { ArenaWitnessRow } from './ArenaWitnessRow'
import type { ArenaParticipantLiveState } from '../../utils/arenaSyncState'
import { restSecondsLeft as calcRestLeft } from '../../utils/arenaSyncState'
import type { WeeklyPactProgress } from '../../services/weeklyPact'
import { ArenaLiveRoutines } from './ArenaLiveRoutines'
import type { WorkoutExercise } from '../../types'

export interface SyncArenaFlyingEmoji {
  id: string
  emoji: string
  label: string
}

export interface SyncArenaAction {
  id?: string
  emoji: string
  label: string
  userId: string
  at?: number
  combo?: number
  photoUrl?: string
  voiceUrl?: string
}

export interface SyncArenaViewProps {
  open: boolean
  onMinimize: () => void
  onEndSync: () => void
  selfName: string
  selfPhoto?: string
  partnerName: string
  partnerPhoto?: string
  partnerId: string
  effectiveUserId: string
  syncStartedAt: number | null
  syncVibe: number
  syncCombo: number
  syncActions: SyncArenaAction[]
  bondLevel?: number
  isNetworkBond: boolean
  distanceKm?: number | null
  liveNearbyCount: number
  witnessCount: number
  witnessProfiles?: ArenaWitnessProfile[]
  redLiveCount: number
  cityLabel?: string
  partnerLiveState?: ArenaParticipantLiveState | null
  restUntil?: number | null
  restStartedBy?: string | null
  weeklyPactProgress?: WeeklyPactProgress | null
  isRecordingVoice?: boolean
  onSyncAction: (actionId: string, emoji: string, label: string) => void
  onCapturePhoto: () => void
  onVoicePing?: () => void
  activeExercise: string
  pendingReps: number
  pendingWeightKg: number
  loggedSetCount: number
  selfExercises: WorkoutExercise[]
  exerciseSuggestions: string[]
  onActiveExerciseChange: (name: string) => void
  onPendingRepsChange: (reps: number) => void
  onPendingWeightChange: (kg: number) => void
}

const STORY_MILESTONE_MIN = 3

export function SyncArenaView({
  open,
  onMinimize,
  onEndSync,
  selfName,
  selfPhoto,
  partnerName,
  partnerPhoto,
  partnerId,
  effectiveUserId,
  syncStartedAt,
  syncVibe,
  syncCombo,
  syncActions,
  bondLevel = 1,
  isNetworkBond,
  distanceKm,
  liveNearbyCount,
  witnessCount,
  witnessProfiles = [],
  redLiveCount,
  cityLabel,
  partnerLiveState = null,
  restUntil = null,
  restStartedBy = null,
  weeklyPactProgress = null,
  isRecordingVoice = false,
  onSyncAction,
  onCapturePhoto,
  onVoicePing,
  activeExercise,
  pendingReps,
  pendingWeightKg,
  loggedSetCount,
  selfExercises,
  exerciseSuggestions,
  onActiveExerciseChange,
  onPendingRepsChange,
  onPendingWeightChange,
}: SyncArenaViewProps) {
  const [now, setNow] = useState(Date.now())
  const [handshakeLabel, setHandshakeLabel] = useState<string | null>(null)
  const [witnessGlow, setWitnessGlow] = useState(false)
  const prevWitnessRef = useState({ count: witnessCount })[0]

  useEffect(() => {
    if (!open) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [open])

  useEffect(() => {
    if (witnessCount > prevWitnessRef.count) {
      setWitnessGlow(true)
      const t = setTimeout(() => setWitnessGlow(false), 2400)
      prevWitnessRef.count = witnessCount
      return () => clearTimeout(t)
    }
    prevWitnessRef.count = witnessCount
  }, [witnessCount, prevWitnessRef])

  const minutes = syncStartedAt ? Math.floor((now - syncStartedAt) / 60000) : 0
  const seconds = syncStartedAt ? Math.floor(((now - syncStartedAt) % 60000) / 1000) : 0
  const restLeft = calcRestLeft(restUntil, now)
  const isResting = restLeft > 0

  const exerciseOptions = useMemo(() => {
    const set = new Set(exerciseSuggestions)
    if (activeExercise) set.add(activeExercise)
    return Array.from(set)
  }, [exerciseSuggestions, activeExercise])

  const latestAction = syncActions[0] ?? null

  useEffect(() => {
    const a = latestAction
    if (!a || a.userId === effectiveUserId) return
    const partnerFirst = partnerName.split(' ')[0] || 'Compañero'
    const detail = a.label.replace(/^(Set|PR) · /, '')
    setHandshakeLabel(`${partnerFirst} · ${a.emoji} ${detail}`)
    const t = setTimeout(() => setHandshakeLabel(null), 3200)
    return () => clearTimeout(t)
  }, [latestAction?.at, latestAction?.label, latestAction?.userId, latestAction?.voiceUrl, effectiveUserId, partnerName])

  if (!open) return null

  const partnerFirst = partnerName.split(' ')[0] || 'Compañero'
  const storyTargetMs = STORY_MILESTONE_MIN * 60 * 1000
  const elapsedMs = syncStartedAt ? now - syncStartedAt : 0
  const msToStory = Math.max(0, storyTargetMs - elapsedMs)
  const minsToStory = Math.floor(msToStory / 60000)
  const secsToStory = Math.floor((msToStory % 60000) / 1000)

  return (
    <div
      className={`arena-fullscreen arena-sala-sync ${witnessGlow ? 'arena-sala-sync--witness-glow' : ''}`}
      role="dialog"
      aria-label="Sala Sync EntrenaSync"
    >
      <div className="arena-fullscreen__bg" aria-hidden />
      <div className="arena-fullscreen__scanlines" aria-hidden />

      <div className="arena-sala-sync__content">
        <header className="arena-sala-sync__top">
          <div className="arena-sala-sync__timer tabular-nums">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <ArenaWeeklyMetaChip progress={weeklyPactProgress} sessionMinutes={minutes} />
          <div className="arena-sala-sync__top-actions">
            {syncCombo >= 2 && (
              <span className="arena-combo-badge">RACHA ×{syncCombo}</span>
            )}
            <button type="button" onClick={onMinimize} className="arena-icon-btn" aria-label="Minimizar">
              <X size={18} />
            </button>
          </div>
        </header>

        <p className="arena-sala-sync__subtitle">
          Sala Sync · {selfName.split(' ')[0]} × {partnerFirst}
          {distanceKm != null ? ` · ${distanceKm.toFixed(1)} km` : ''}
          {isNetworkBond && (
            <span className="text-[#FFD700]"> · ⭐ RED F{bondLevel}</span>
          )}
          {cityLabel && <span> · {cityLabel}</span>}
        </p>

        {/* Set card primero — siempre visible (ejercicio + reps/kg) */}
        <div className="arena-sala-sync__set-wrap">
          <ArenaSetCard
            selfExercise={activeExercise}
            selfReps={pendingReps}
            selfWeightKg={pendingWeightKg}
            selfSetCount={loggedSetCount}
            exerciseOptions={exerciseOptions}
            onExerciseChange={onActiveExerciseChange}
            onRepsChange={onPendingRepsChange}
            onWeightChange={onPendingWeightChange}
            partnerState={partnerLiveState}
            partnerFirst={partnerFirst}
          />
        </div>

        <section className="arena-sala-sync__stage arena-sala-sync__stage--compact">
          <div className="arena-sala-sync__athlete arena-sala-sync__athlete--self">
            <div className="arena-avatar__ring">
              {selfPhoto ? (
                <img src={selfPhoto} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="arena-avatar__initial">{(selfName || 'T')[0]}</span>
              )}
            </div>
            <span className="arena-sala-sync__athlete-label text-[#22c55e]">TÚ</span>
            <span className="arena-sala-sync__athlete-ex">{activeExercise}</span>
          </div>

          <ArenaSharedPulse
            syncVibe={syncVibe}
            latestAction={latestAction}
            partnerFirst={partnerFirst}
            effectiveUserId={effectiveUserId}
            isResting={isResting}
            restSecondsLeft={restLeft}
            restStartedBy={restStartedBy}
            handshakeLabel={handshakeLabel}
          />

          <div className="arena-sala-sync__athlete arena-sala-sync__athlete--partner">
            <div className="arena-avatar__ring arena-avatar__ring--partner">
              {partnerPhoto ? (
                <img src={partnerPhoto} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="arena-avatar__initial">{(partnerName || 'C')[0]}</span>
              )}
            </div>
            <span className="arena-sala-sync__athlete-label text-[#FF671F]">{partnerFirst.toUpperCase()}</span>
            <span className="arena-sala-sync__athlete-ex">
              {partnerLiveState?.activeExercise || '—'}
            </span>
          </div>
        </section>

        <ArenaLiveRoutines
          partnerLabel={partnerFirst.toUpperCase()}
          selfActiveExercise={activeExercise}
          partnerActiveExercise={partnerLiveState?.activeExercise}
          selfExercises={selfExercises}
          partnerExercises={partnerLiveState?.exercises}
        />

        <div className="arena-sala-sync__meta-row">
          <p className="arena-sala-sync__story-hint">
            {msToStory > 0 ? (
              <>Historia en {minsToStory}:{secsToStory.toString().padStart(2, '0')}</>
            ) : (
              <>Historia lista al terminar</>
            )}
          </p>
          <ArenaWitnessRow
            witnessCount={witnessCount}
            witnessProfiles={witnessProfiles}
            liveNearbyCount={liveNearbyCount}
            redLiveCount={redLiveCount}
            newWitnessGlow={witnessGlow}
          />
        </div>
      </div>

      <div className="arena-sala-sync__bottom">
        <ArenaSyncDock
          onSetReady={() => onSyncAction('set', '💪', 'Set listo')}
          onRest={() => onSyncAction('rest', '💧', 'Descanso')}
          onHype={() => onSyncAction('hype', '🔥', 'Ánimo')}
          onVoicePing={onVoicePing}
          onPr={() => onSyncAction('pr', '🏆', 'PR logrado')}
          onPhoto={onCapturePhoto}
          isRecordingVoice={isRecordingVoice}
        />

        <footer className="arena-fullscreen__footer arena-sala-sync__footer">
          <button type="button" onClick={onEndSync} className="arena-end-btn">
            Terminar EntrenaSync
          </button>
        </footer>
      </div>

      <AnimatePresence>
        {isResting && (
          <motion.div
            className="arena-sala-sync__rest-veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden
          />
        )}
      </AnimatePresence>
    </div>
  )
}
