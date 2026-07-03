import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Share2 } from 'lucide-react'
import { getSyncShareOptOut, setSyncShareOptOut } from '../../utils/syncSharePrefs'
import {
  buildDuelMetrics,
  computeSyncDuel,
  type SyncDuelAction,
} from '../../utils/syncDuel'
import { ArenaSyncReel } from './ArenaSyncReel'
import { shareSyncStory } from '../../utils/syncStoryShare'
import { shareNativeMessage } from '../../utils/shareNative'
import { toast } from 'sonner'
import { estimateSyncSessionBurn } from '../../domain/fuelBalance'
import { SyncWorkoutCompareStrip } from '../workout/SyncWorkoutCompareStrip'
import type { SyncWorkoutCompare } from '../../utils/workoutSyncCompare'
import { winnerLabel, type ProfileGender } from '../../utils/genderedCopy'
import { BRAND_COPY } from '../../constants/brandCopy'
import { recordPilotDensityEvent } from '../../services/pilotDensityMetrics'
import type { Firestore } from 'firebase/firestore'
import type { WearableSessionSnapshot } from '../../types'

export interface SyncDuelSummaryProps {
  open: boolean
  selfName: string
  selfPhoto?: string
  selfGender?: ProfileGender
  partnerName: string
  partnerPhoto?: string
  partnerGender?: ProfileGender
  partnerId: string
  effectiveUserId: string
  minutes: number
  elapsedSec?: number
  vibe: number
  witnessCount: number
  setsLogged: number
  actions: SyncDuelAction[]
  isNetworkBond?: boolean
  bondLevel?: number
  weeklyMetaComplete?: boolean
  weeklyMetaLine?: string
  onClose: () => void
  onResync: (partnerId: string) => void
  onReplay: () => void
  onRate?: (rating: number, opts?: { publishToFeed: boolean }) => void
  onInviteSquad?: (partnerId: string, partnerName: string) => void
  onPublishToFeed?: () => void | Promise<void>
  onShareSkip?: () => void
  onShareOptOutChange?: (optOut: boolean) => void
  shareInviteUrl?: string
  publishingFeed?: boolean
  db?: Firestore | null
  userCity?: string | null
  isDemoMode?: boolean
  fuelBurnKcal?: number
  weightKg?: number
  workoutCompare?: SyncWorkoutCompare | null
  selfWearable?: WearableSessionSnapshot | null
  partnerWearable?: WearableSessionSnapshot | null
}

export function SyncDuelSummary({
  open,
  selfName,
  selfPhoto,
  selfGender,
  partnerName,
  partnerPhoto,
  partnerGender,
  partnerId,
  effectiveUserId,
  minutes,
  elapsedSec = 0,
  vibe,
  witnessCount,
  setsLogged,
  actions,
  isNetworkBond,
  bondLevel = 1,
  weeklyMetaComplete,
  weeklyMetaLine,
  onClose,
  onResync,
  onReplay,
  onRate,
  onInviteSquad,
  onPublishToFeed,
  onShareSkip,
  onShareOptOutChange,
  shareInviteUrl,
  publishingFeed = false,
  db = null,
  userCity = null,
  isDemoMode = false,
  fuelBurnKcal = 0,
  weightKg = 75,
  workoutCompare = null,
  selfWearable = null,
  partnerWearable = null,
}: SyncDuelSummaryProps) {
  const [shareToFeed, setShareToFeed] = useState(() => !getSyncShareOptOut())
  const [globalOptOut, setGlobalOptOut] = useState(() => getSyncShareOptOut())
  const publishedRef = useRef(false)

  useEffect(() => {
    if (!open) return
    const opt = getSyncShareOptOut()
    setGlobalOptOut(opt)
    setShareToFeed(!opt)
    publishedRef.current = false
  }, [open, partnerId])

  useEffect(() => {
    if (!open || minutes < 3) return
    const dayKey = new Date().toISOString().slice(0, 10)
    const promptKey = `entrenamatch_sync_story_prompt_${partnerId}_${dayKey}`
    try {
      if (sessionStorage.getItem(promptKey) === '1') return
      sessionStorage.setItem(promptKey, '1')
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => {
      toast(BRAND_COPY.syncStory.promptTitle, {
        description: BRAND_COPY.syncStory.promptBody,
        duration: 8000,
        action: {
          label: 'Story',
          onClick: () => void shareStory(),
        },
      })
    }, 600)
    return () => window.clearTimeout(t)
  }, [open, minutes, partnerId])

  if (!open) return null

  const handleClose = () => {
    if (!publishedRef.current) onShareSkip?.()
    onClose()
  }

  const toggleGlobalOptOut = () => {
    const next = !globalOptOut
    setGlobalOptOut(next)
    setSyncShareOptOut(next)
    if (next) setShareToFeed(false)
    else setShareToFeed(true)
    onShareOptOutChange?.(next)
  }

  const duel = computeSyncDuel(
    actions,
    effectiveUserId,
    selfName,
    partnerId,
    partnerName
  )
  const metrics = buildDuelMetrics(duel)
  const partnerFirst = partnerName.split(' ')[0] || 'Compañero'
  const showRating = (minutes >= 3 || elapsedSec >= 180) && !!onRate
  const durationLabel =
    minutes >= 1
      ? `${minutes} min`
      : elapsedSec > 0
        ? `${Math.floor(elapsedSec / 60)}:${(elapsedSec % 60).toString().padStart(2, '0')}`
        : '<1 min'

  const watchKcal = selfWearable?.activeCaloriesKcal ?? 0
  const sessionBurn =
    fuelBurnKcal > 0
      ? fuelBurnKcal
      : watchKcal > 0
        ? watchKcal
        : estimateSyncSessionBurn(weightKg, Math.max(1, minutes || Math.ceil(elapsedSec / 60)))
  const burnFromWatch = watchKcal > 0 || (selfWearable?.workoutDetected ?? false)

  const shareSummary = async () => {
    const text = `EntrenaSync con ${partnerName} — ${durationLabel}, vibe ${vibe}%, ${setsLogged} series. #EntrenaMatch #EntrenaSync`
    const outcome = await shareNativeMessage({
      title: 'EntrenaSync · EntrenaMatch',
      text,
      url: shareInviteUrl,
    })
    if (outcome === 'copied') {
      toast.success('Resumen copiado — pégalo en WhatsApp o Instagram')
    } else if (outcome === 'failed') {
      toast.error('No se pudo compartir')
    }
  }

  const shareStory = async () => {
    const outcome = await shareSyncStory({
      selfName,
      partnerName,
      minutes,
      vibe,
      setsLogged,
      selfPhoto,
      partnerPhoto,
      witnessCount,
      isNetworkBond,
    })
    if (outcome === 'downloaded' || outcome === 'shared') {
      toast.success('Imagen guardada — compártela desde tu galería')
      void recordPilotDensityEvent(db, {
        city: userCity,
        kind: 'sync_story_shared',
        isDemoMode,
      })
    } else if (outcome === 'failed') {
      toast.error('No se pudo generar la story')
    }
  }

  return (
    <div
      className="em-visual-v2 em-v2-sync-duel-overlay"
      role="dialog"
      aria-label="Cierre de sync EntrenaSync"
      onClick={handleClose}
    >
      <motion.div
        className="em-v2-sync-duel-card em-v2-sync-duel-card--sala em-v2-arena"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="em-v2-sync-duel-card__eyebrow">CIERRE DE SYNC</p>

        {weeklyMetaLine && (
          <div
            className={`em-v2-sync-duel-meta ${
              weeklyMetaComplete ? 'em-v2-sync-duel-meta--done' : ''
            }`}
          >
            {weeklyMetaComplete ? '🏁 Semana sellada' : '📊 Meta semanal'} · {weeklyMetaLine}
          </div>
        )}

        <ArenaSyncReel
          actions={actions}
          selfUserId={effectiveUserId}
          selfName={selfName}
          partnerName={partnerName}
        />

        <h2 className="em-v2-sync-duel-card__headline">{duel.headline}</h2>
        <p className="em-v2-sync-duel-card__subline">{duel.subline}</p>

        <div className="em-v2-sync-duel-card__versus">
          <div
            className={`em-v2-sync-duel-card__fighter ${
              duel.winner === 'self' ? 'em-v2-sync-duel-card__fighter--win' : ''
            }`}
          >
            {selfPhoto ? (
              <img src={selfPhoto} alt={`Foto de ${duel.self.name}`} className="em-v2-sync-duel-card__avatar" />
            ) : (
              <span className="em-v2-sync-duel-card__avatar em-v2-sync-duel-card__avatar--fallback">
                {duel.self.name.charAt(0)}
              </span>
            )}
            <span className="em-v2-sync-duel-card__name">{duel.self.name}</span>
            <span className="em-v2-sync-duel-card__score">{duel.self.score}</span>
            {duel.winner === 'self' && (
              <span className="em-v2-sync-duel-card__badge">{winnerLabel(selfGender)}</span>
            )}
          </div>

          <div className="em-v2-sync-duel-card__vs" aria-hidden>
            VS
          </div>

          <div
            className={`em-v2-sync-duel-card__fighter ${
              duel.winner === 'partner' ? 'em-v2-sync-duel-card__fighter--win' : ''
            }`}
          >
            {partnerPhoto ? (
              <img src={partnerPhoto} alt={`Foto de ${duel.partner.name}`} className="em-v2-sync-duel-card__avatar" />
            ) : (
              <span className="em-v2-sync-duel-card__avatar em-v2-sync-duel-card__avatar--fallback">
                {duel.partner.name.charAt(0)}
              </span>
            )}
            <span className="em-v2-sync-duel-card__name">{duel.partner.name}</span>
            <span className="em-v2-sync-duel-card__score">{duel.partner.score}</span>
            {duel.winner === 'partner' && (
              <span className="em-v2-sync-duel-card__badge">{winnerLabel(partnerGender)}</span>
            )}
          </div>
        </div>

        <div className="em-v2-sync-duel-card__session">
          <span>{durationLabel}</span>
          <span>Sync {vibe}%</span>
          {setsLogged > 0 && <span>{setsLogged} sets</span>}
          {witnessCount > 0 && <span>{witnessCount} testigos</span>}
          {isNetworkBond && (
            <span className="em-v2-sync-duel-card__bond">⭐ RED · Fuerza {bondLevel}</span>
          )}
        </div>

        {sessionBurn > 0 && (
          <p className="em-v2-sync-duel-card__fuel">
            {burnFromWatch ? '⌚' : '🔥'} FuelBalance · ~{sessionBurn} kcal
            {burnFromWatch ? ' desde tu reloj' : ' estimadas en el sync'} · suma al target de hoy
            {selfWearable?.workoutDetected && (
              <span className="em-v2-sync-duel-card__fuel-sub">Workout detectado · Sincronizado</span>
            )}
          </p>
        )}

        {(selfWearable?.heartRateAvg || partnerWearable?.heartRateAvg) && (
          <div className="em-v2-sync-duel-card__pulse">
            <span className="em-v2-sync-duel-card__pulse-title">⌚ Pulso sync</span>
            {selfWearable?.heartRateAvg ? (
              <span className="ml-2">
                Tú: {selfWearable.heartRateAvg} bpm
                {selfWearable.heartRateMax ? ` (máx ${selfWearable.heartRateMax})` : ''}
              </span>
            ) : null}
            {partnerWearable?.heartRateAvg ? (
              <span className="ml-2">
                · {partnerFirst}: {partnerWearable.heartRateAvg} bpm
              </span>
            ) : null}
          </div>
        )}

        {workoutCompare && (
          <SyncWorkoutCompareStrip
            compare={workoutCompare}
            selfName={selfName}
            partnerName={partnerName}
          />
        )}

        <details className="em-v2-sync-duel-card__metrics-fold">
          <summary className="em-v2-sync-duel-card__metrics-toggle">Ver marcador detallado</summary>
          <div className="em-v2-sync-duel-card__metrics">
            {metrics.map((row) => {
              const total = row.self + row.partner
              const selfPct = total > 0 ? (row.self / total) * 100 : 50
              const partnerPct = total > 0 ? (row.partner / total) * 100 : 50
              const selfLeads = row.self > row.partner
              const partnerLeads = row.partner > row.self
              return (
                <div key={row.key} className="em-v2-sync-duel-metric">
                  <div className="em-v2-sync-duel-metric__labels">
                    <span className={selfLeads ? 'em-v2-sync-duel-metric__lead' : ''}>
                      {row.self}
                    </span>
                    <span className="em-v2-sync-duel-metric__title">{row.label}</span>
                    <span className={partnerLeads ? 'em-v2-sync-duel-metric__lead' : ''}>
                      {row.partner}
                    </span>
                  </div>
                  <div className="em-v2-sync-duel-metric__bar" aria-hidden>
                    <span
                      className="em-v2-sync-duel-metric__fill em-v2-sync-duel-metric__fill--self"
                      style={{ width: `${selfPct}%` }}
                    />
                    <span
                      className="em-v2-sync-duel-metric__fill em-v2-sync-duel-metric__fill--partner"
                      style={{ width: `${partnerPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </details>

        <div className="em-v2-sync-duel-prefs">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={shareToFeed && !globalOptOut}
              disabled={globalOptOut}
              onChange={(e) => setShareToFeed(e.target.checked)}
              className="mt-0.5 accent-[#FF671F]"
            />
            <span className="text-[11px] text-white leading-snug">
              Publicar resumen en mi muro al cerrar
              <span className="block text-[#9CA3AF] text-[10px] mt-0.5">
                Opt-in — no spam automático en el feed
              </span>
            </span>
          </label>
          <button
            type="button"
            onClick={toggleGlobalOptOut}
            className="mt-2 text-[10px] text-[#9CA3AF] underline underline-offset-2 hover:text-white"
          >
            {globalOptOut
              ? 'Activar publicación post-sync (preferencia guardada)'
              : 'No publicar syncs en el muro (opt-out global)'}
          </button>
        </div>

        {showRating && (
          <div className="em-v2-sync-duel-card__rating">
            <p className="text-[11px] text-[#9CA3AF] mb-2 text-center">
              ¿Cómo estuvo el sync con {partnerFirst}?
            </p>
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    if (shareToFeed && !globalOptOut) publishedRef.current = true
                    onRate?.(r, { publishToFeed: shareToFeed && !globalOptOut })
                  }}
                  className="text-xl px-1.5 py-0.5 text-[#FF671F] hover:text-white active:scale-90 transition"
                  aria-label={`${r} estrellas`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="em-v2-sync-duel-card__actions">
          {onPublishToFeed && (
            <button
              type="button"
              disabled={publishingFeed || globalOptOut}
              onClick={() => {
                publishedRef.current = true
                void onPublishToFeed()
              }}
              className="em-v2-sync-duel-card__btn em-v2-sync-duel-card__btn--primary"
            >
              {globalOptOut
                ? 'Publicación desactivada (opt-out)'
                : publishingFeed
                  ? 'Publicando…'
                  : '📣 Publicar en muro 1-tap'}
            </button>
          )}
          <button
            type="button"
            onClick={() => onResync(partnerId)}
            className={`em-v2-sync-duel-card__btn ${onPublishToFeed ? 'em-v2-sync-duel-card__btn--ghost' : 'em-v2-sync-duel-card__btn--primary'}`}
          >
            🔄 Re-sync con {partnerFirst}
          </button>
          {actions.length > 0 && (
            <button
              type="button"
              onClick={onReplay}
              className="em-v2-sync-duel-card__btn em-v2-sync-duel-card__btn--ghost"
            >
              Ver resumen de la sesión
            </button>
          )}
          <button
            type="button"
            onClick={() => void shareStory()}
            className="em-v2-sync-duel-card__btn em-v2-sync-duel-card__btn--primary"
          >
            📱 {BRAND_COPY.syncStory.cta}
          </button>
          {onInviteSquad && (
            <button
              type="button"
              onClick={() => onInviteSquad(partnerId, partnerName)}
              className="em-v2-sync-duel-card__btn em-v2-sync-duel-card__btn--ghost"
            >
              👥 Invitar a Squad
            </button>
          )}
          <button
            type="button"
            onClick={() => void shareSummary()}
            className="em-v2-sync-duel-card__btn em-v2-sync-duel-card__btn--ghost"
          >
            <Share2 size={14} /> Compartir
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="em-v2-sync-duel-card__btn em-v2-sync-duel-card__btn--ghost"
          >
            Cerrar sin publicar
          </button>
        </div>

        <p className="em-v2-sync-duel-card__footer">
          Queda en vuestro historial — re-sync suma a tu alianza y Fuerza del equipo.
        </p>
      </motion.div>
    </div>
  )
}
