import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Zap } from 'lucide-react'
import { ARENA_HERO_ACTIONS, heroActionToSync } from './arenaActions'
import { ArenaSyncDuelStrip } from './ArenaSyncDuelStrip'
import { ArenaFomoStrip } from './ArenaFomoStrip'
import { ArenaMiniMap } from './ArenaMiniMap'
import { ArenaWitnessRow } from './ArenaWitnessRow'

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
  rippleCount: number
  witnessCount: number
  redLiveCount: number
  waveCount: number
  lastWaveLabel?: string
  wavePulseKey?: number
  cityLabel?: string
  flyingEmojis: SyncArenaFlyingEmoji[]
  onSyncAction: (actionId: string, emoji: string, label: string) => void
  onCapturePhoto: () => void
  onReplay: () => void
  /** Phase 2 — EntrenaLog in Arena */
  activeExercise: string
  pendingReps: number
  pendingWeightKg: number
  loggedSetCount: number
  exerciseSuggestions: string[]
  onActiveExerciseChange: (name: string) => void
  onPendingRepsChange: (reps: number) => void
  onPendingWeightChange: (kg: number) => void
}

const STORY_MILESTONE_MIN = 3

const accentClass: Record<string, string> = {
  green: 'arena-hero-btn--green',
  orange: 'arena-hero-btn--orange',
  gold: 'arena-hero-btn--gold',
  cyan: 'arena-hero-btn--cyan',
  pink: 'arena-hero-btn--pink',
}

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
  rippleCount,
  witnessCount,
  redLiveCount,
  waveCount,
  lastWaveLabel,
  wavePulseKey = 0,
  cityLabel,
  flyingEmojis,
  onSyncAction,
  onCapturePhoto,
  onReplay,
  activeExercise,
  pendingReps,
  pendingWeightKg,
  loggedSetCount,
  exerciseSuggestions,
  onActiveExerciseChange,
  onPendingRepsChange,
  onPendingWeightChange,
}: SyncArenaViewProps) {
  const [now, setNow] = useState(Date.now())
  const [partnerFlash, setPartnerFlash] = useState<SyncArenaAction | null>(null)

  useEffect(() => {
    if (!open) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [open])

  const minutes = syncStartedAt ? Math.floor((now - syncStartedAt) / 60000) : 0
  const seconds = syncStartedAt ? Math.floor(((now - syncStartedAt) % 60000) / 1000) : 0
  const storyTargetMs = STORY_MILESTONE_MIN * 60 * 1000
  const elapsedMs = syncStartedAt ? now - syncStartedAt : 0
  const msToStory = Math.max(0, storyTargetMs - elapsedMs)
  const minsToStory = Math.floor(msToStory / 60000)
  const secsToStory = Math.floor((msToStory % 60000) / 1000)
  const highlightUnlocked = syncVibe >= 80
  const vibeToHighlight = Math.max(0, 80 - syncVibe)

  const exerciseOptions = useMemo(() => {
    const set = new Set(exerciseSuggestions)
    if (activeExercise) set.add(activeExercise)
    return Array.from(set)
  }, [exerciseSuggestions, activeExercise])

  const latestPartnerAction = useMemo(() => {
    return syncActions.find((a) => a.userId && a.userId !== effectiveUserId) || null
  }, [syncActions, effectiveUserId])

  useEffect(() => {
    if (!latestPartnerAction?.at) return
    setPartnerFlash(latestPartnerAction)
    const t = setTimeout(() => setPartnerFlash(null), 2200)
    return () => clearTimeout(t)
  }, [latestPartnerAction?.at, latestPartnerAction?.emoji, latestPartnerAction?.label])

  if (!open) return null

  const partnerFirst = partnerName.split(' ')[0] || 'Compañero'
  const orbScale = 0.88 + (syncVibe / 100) * 0.35

  return (
    <div className="arena-fullscreen" role="dialog" aria-label="EntrenaSync Arena">
      <div className="arena-fullscreen__bg" aria-hidden />
      <div className="arena-fullscreen__scanlines" aria-hidden />

      {/* Header */}
      <header className="arena-fullscreen__header">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#22c55e]/80 font-bold">
            Pista compartida · EN VIVO
          </p>
          <h2 className="text-lg font-black text-white tracking-tight">
            {selfName.split(' ')[0]} <span className="text-[#22c55e]">×</span> {partnerFirst}
          </h2>
          <p className="text-[11px] text-white/55">
            {distanceKm != null ? `${distanceKm.toFixed(1)} km · ` : ''}
            {isNetworkBond && (
              <span className="text-[#FFD700] font-bold">⭐ RED LV{bondLevel} · </span>
            )}
            Sync activo
          </p>
        </div>
        <div className="flex items-center gap-2">
          {highlightUnlocked ? (
            <span className="arena-highlight-badge">⭐ HIGHLIGHT</span>
          ) : syncVibe >= 60 ? (
            <span className="arena-highlight-badge arena-highlight-badge--soon">⚡ {vibeToHighlight}→80</span>
          ) : null}
          {syncCombo >= 2 && (
            <span className="arena-combo-badge">COMBO ×{syncCombo}</span>
          )}
          <button type="button" onClick={onMinimize} className="arena-icon-btn" aria-label="Minimizar">
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Partner action flash */}
      <AnimatePresence>
        {partnerFlash && (
          <motion.div
            key={`${partnerFlash.at}-${partnerFlash.label}`}
            className="arena-partner-flash"
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <span className="text-3xl">{partnerFlash.emoji}</span>
            <div>
              <p className="text-[11px] text-[#22c55e] font-bold uppercase tracking-wider">
                {partnerFirst} ahora
              </p>
              <p className="text-base font-black text-white">{partnerFlash.label}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero stage */}
      <section className="arena-fullscreen__stage">
        <div className="arena-avatar arena-avatar--self">
          <div className="arena-avatar__ring">
            {selfPhoto ? (
              <img src={selfPhoto} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="arena-avatar__initial">{(selfName || 'T')[0]}</span>
            )}
          </div>
          <span className="arena-avatar__label text-[#22c55e]">TÚ</span>
        </div>

        <div className="arena-orb-wrap">
          <div
            className={`arena-orb ${syncVibe > 75 ? 'arena-orb--high' : ''} ${isNetworkBond ? 'arena-orb--bond' : ''}`}
            style={{ transform: `scale(${orbScale})` }}
          >
            <div className="arena-orb__timer">
              <span className="arena-orb__mins">{minutes}</span>
              <span className="arena-orb__secs">:{seconds.toString().padStart(2, '0')}</span>
            </div>
            <p className="arena-orb__vibe">
              VIBE <strong>{syncVibe}</strong>%
            </p>
          </div>
          <div className="arena-tether" aria-hidden />

          <AnimatePresence>
            {flyingEmojis.map((f, idx) => (
              <motion.span
                key={f.id}
                className="arena-fly-emoji"
                style={{ left: `${38 + idx * 8}%` }}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -72, scale: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
              >
                {f.emoji}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        <div className="arena-avatar arena-avatar--partner">
          <div className="arena-avatar__ring arena-avatar__ring--partner">
            {partnerPhoto ? (
              <img src={partnerPhoto} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="arena-avatar__initial">{(partnerName || 'C')[0]}</span>
            )}
          </div>
          <span className="arena-avatar__label text-[#FF671F]">{partnerFirst.toUpperCase()}</span>
        </div>
      </section>

      {/* Progress + FOMO strip */}
      <section className="arena-fullscreen__progress px-4">
        <div className="arena-progress-row">
          <span className="text-[10px] text-white/50">Energía compartida</span>
          <div className="arena-bar">
            <div className="arena-bar__fill arena-bar__fill--vibe" style={{ width: `${syncVibe}%` }} />
          </div>
        </div>
        <div className="arena-progress-row">
          <span className="text-[10px] text-white/50">Alianza esta sesión</span>
          <div className="arena-bar">
            <div
              className="arena-bar__fill arena-bar__fill--bond"
              style={{ width: `${Math.min(100, (minutes / STORY_MILESTONE_MIN) * 100)}%` }}
            />
          </div>
        </div>
        <p className="text-[10px] text-center text-[#22c55e]/80 mt-1">
          {msToStory > 0 ? (
            <>
              En{' '}
              <strong>
                {minsToStory}:{secsToStory.toString().padStart(2, '0')}
              </strong>{' '}
              → Historia compartida en ambos muros
            </>
          ) : (
            <>⭐ Historia compartida desbloqueada al terminar</>
          )}
        </p>
        <div className="arena-vibe-milestones" aria-hidden>
          {[60, 80, 100].map((tick) => (
            <span
              key={tick}
              className={`arena-vibe-milestone ${syncVibe >= tick ? 'arena-vibe-milestone--hit' : ''}`}
              style={{ left: `${tick}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
      </section>

      {/* EntrenaLog strip — active exercise + set inputs (Phase 2) */}
      <section className="mx-4 mb-2 rounded-2xl border border-[#FF671F]/25 bg-[#FF671F]/5 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[#FF671F] uppercase tracking-wider">
            EntrenaLog en vivo
          </span>
          {loggedSetCount > 0 && (
            <span className="text-[10px] text-[#22c55e] font-bold">{loggedSetCount} sets</span>
          )}
        </div>
        <select
          value={activeExercise}
          onChange={(e) => onActiveExerciseChange(e.target.value)}
          className="w-full mb-2 px-2.5 py-2 rounded-xl bg-[#1a1a22] border border-white/10 text-white text-xs font-semibold"
        >
          {exerciseOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 text-xs">
          <label className="text-[#9CA3AF] shrink-0">Reps</label>
          <input
            type="number"
            min={1}
            max={100}
            value={pendingReps}
            onChange={(e) => onPendingRepsChange(Math.max(1, Number(e.target.value) || 10))}
            className="w-14 px-2 py-1.5 rounded-lg bg-[#1a1a22] border border-white/10 text-white text-center"
          />
          <label className="text-[#9CA3AF] shrink-0 ml-1">Kg</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={pendingWeightKg}
            onChange={(e) => onPendingWeightChange(Math.max(0, Number(e.target.value) || 0))}
            className="w-16 px-2 py-1.5 rounded-lg bg-[#1a1a22] border border-white/10 text-white text-center"
          />
          <span className="text-[9px] text-[#6B7280] ml-auto leading-tight text-right">
            Set listo / PR registran aquí
          </span>
        </div>
      </section>

      <div className="px-4 mt-2 space-y-2">
        <ArenaFomoStrip
          witnessCount={witnessCount}
          redLiveCount={redLiveCount}
          waveCount={waveCount}
          syncVibe={syncVibe}
          minsToStory={minsToStory}
          secsToStory={secsToStory}
          highlightUnlocked={highlightUnlocked}
          lastWaveLabel={lastWaveLabel}
          cityLabel={cityLabel}
        />
        <ArenaWitnessRow
          witnessCount={witnessCount}
          liveNearbyCount={liveNearbyCount}
          redLiveCount={redLiveCount}
        />
        <ArenaMiniMap
          liveNearbyCount={liveNearbyCount}
          rippleCount={rippleCount}
          cityLabel={cityLabel}
          vibe={syncVibe}
          witnessCount={witnessCount}
          wavePulseKey={wavePulseKey}
        />
      </div>

      <ArenaSyncDuelStrip
        actions={syncActions}
        effectiveUserId={effectiveUserId}
        partnerId={partnerId}
        selfName={selfName}
        partnerName={partnerName}
      />

      {/* 5 hero actions */}
      <section className="arena-fullscreen__actions px-3">
        {ARENA_HERO_ACTIONS.map((hero) => (
          <button
            key={hero.id}
            type="button"
            className={`arena-hero-btn ${accentClass[hero.accent]}`}
            onClick={() => {
              if (hero.id === 'photo') {
                onCapturePhoto()
                return
              }
              const { emoji, label } = heroActionToSync(hero)
              onSyncAction(hero.id, emoji, label)
            }}
          >
            <span className="arena-hero-btn__emoji">{hero.emoji}</span>
            <span className="arena-hero-btn__label">{hero.label}</span>
            <span className="arena-hero-btn__sub">{hero.sub}</span>
          </button>
        ))}
      </section>

      {/* Live timeline */}
      {syncActions.length > 0 && (
        <section className="arena-fullscreen__timeline mx-4 mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-[#22c55e]/70 uppercase tracking-wider">
              Sync en vivo ({syncActions.length})
            </span>
            <button type="button" onClick={onReplay} className="text-[9px] text-[#FF671F] underline">
              Replay
            </button>
          </div>
          <div className="max-h-[56px] overflow-y-auto space-y-0.5">
            {syncActions.slice(0, 5).map((a, i) => {
              const isMe = a.userId === effectiveUserId
              const who = isMe ? 'Tú' : partnerFirst
              return (
                <div key={a.id || i} className="text-[10px] flex gap-1.5 text-white/85">
                  <span className={isMe ? 'text-white' : 'text-[#22c55e]'}>
                    {who} {a.emoji} {a.label}
                    {a.combo ? <span className="text-[#FF671F] font-black"> ×{a.combo}</span> : null}
                  </span>
                  {a.photoUrl && (
                    <img src={a.photoUrl} alt="" className="w-4 h-4 rounded object-cover" />
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="arena-fullscreen__footer">
        <button type="button" onClick={onEndSync} className="arena-end-btn">
          Terminar EntrenaSync
        </button>
        <p className="text-[9px] text-center text-white/40 px-6 flex items-center justify-center gap-1">
          <Zap size={10} className="text-[#22c55e]" />
          {witnessCount > 0
            ? `Cada acción llega a ${partnerFirst} y ${witnessCount} más presencian en el mapa`
            : 'Cada acción suma al duelo — al terminar verás el resumen VS'}
        </p>
      </footer>
    </div>
  )
}
