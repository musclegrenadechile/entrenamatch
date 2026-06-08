import { motion } from 'framer-motion'
import { Share2 } from 'lucide-react'
import {
  buildDuelMetrics,
  computeSyncDuel,
  type SyncDuelAction,
} from '../../utils/syncDuel'
import { ArenaSyncReel } from './ArenaSyncReel'
import { downloadSyncStory } from '../../utils/syncStoryShare'

export interface SyncDuelSummaryProps {
  open: boolean
  selfName: string
  selfPhoto?: string
  partnerName: string
  partnerPhoto?: string
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
  onRate?: (rating: number) => void
  onInviteSquad?: (partnerId: string, partnerName: string) => void
}

export function SyncDuelSummary({
  open,
  selfName,
  selfPhoto,
  partnerName,
  partnerPhoto,
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
}: SyncDuelSummaryProps) {
  if (!open) return null

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

  const shareSummary = async () => {
    const text = `EntrenaSync con ${partnerName} — ${durationLabel}, vibe ${vibe}%, ${setsLogged} series. #EntrenaMatch`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'EntrenaSync', text })
        return
      }
      await navigator.clipboard.writeText(text)
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div
      className="sync-duel-overlay"
      role="dialog"
      aria-label="Cierre de sync EntrenaSync"
      onClick={onClose}
    >
      <motion.div
        className="sync-duel-card sync-duel-card--sala"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="sync-duel-card__eyebrow">CIERRE DE SYNC</p>

        {weeklyMetaLine && (
          <div
            className={`sync-duel-meta-banner ${
              weeklyMetaComplete ? 'sync-duel-meta-banner--done' : ''
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

        <h2 className="sync-duel-card__headline">{duel.headline}</h2>
        <p className="sync-duel-card__subline">{duel.subline}</p>

        <div className="sync-duel-card__versus">
          <div
            className={`sync-duel-card__fighter ${
              duel.winner === 'self' ? 'sync-duel-card__fighter--win' : ''
            }`}
          >
            {selfPhoto ? (
              <img src={selfPhoto} alt="" className="sync-duel-card__avatar" />
            ) : (
              <span className="sync-duel-card__avatar sync-duel-card__avatar--fallback">
                {duel.self.name.charAt(0)}
              </span>
            )}
            <span className="sync-duel-card__name">{duel.self.name}</span>
            <span className="sync-duel-card__score">{duel.self.score}</span>
            {duel.winner === 'self' && (
              <span className="sync-duel-card__badge">Ganador</span>
            )}
          </div>

          <div className="sync-duel-card__vs" aria-hidden>
            VS
          </div>

          <div
            className={`sync-duel-card__fighter ${
              duel.winner === 'partner' ? 'sync-duel-card__fighter--win' : ''
            }`}
          >
            {partnerPhoto ? (
              <img src={partnerPhoto} alt="" className="sync-duel-card__avatar" />
            ) : (
              <span className="sync-duel-card__avatar sync-duel-card__avatar--fallback">
                {duel.partner.name.charAt(0)}
              </span>
            )}
            <span className="sync-duel-card__name">{duel.partner.name}</span>
            <span className="sync-duel-card__score">{duel.partner.score}</span>
            {duel.winner === 'partner' && (
              <span className="sync-duel-card__badge">Ganador</span>
            )}
          </div>
        </div>

        <div className="sync-duel-card__session">
          <span>{durationLabel}</span>
          <span>Sync {vibe}%</span>
          {setsLogged > 0 && <span>{setsLogged} sets</span>}
          {witnessCount > 0 && <span>{witnessCount} testigos</span>}
          {isNetworkBond && (
            <span className="text-[#FFD700]">⭐ RED · Fuerza {bondLevel}</span>
          )}
        </div>

        <details className="sync-duel-card__metrics-fold">
          <summary className="sync-duel-card__metrics-toggle">Ver marcador detallado</summary>
          <div className="sync-duel-card__metrics">
            {metrics.map((row) => {
              const total = row.self + row.partner
              const selfPct = total > 0 ? (row.self / total) * 100 : 50
              const partnerPct = total > 0 ? (row.partner / total) * 100 : 50
              const selfLeads = row.self > row.partner
              const partnerLeads = row.partner > row.self
              return (
                <div key={row.key} className="sync-duel-metric">
                  <div className="sync-duel-metric__labels">
                    <span className={selfLeads ? 'sync-duel-metric__lead' : ''}>
                      {row.self}
                    </span>
                    <span className="sync-duel-metric__title">{row.label}</span>
                    <span className={partnerLeads ? 'sync-duel-metric__lead' : ''}>
                      {row.partner}
                    </span>
                  </div>
                  <div className="sync-duel-metric__bar" aria-hidden>
                    <span
                      className="sync-duel-metric__fill sync-duel-metric__fill--self"
                      style={{ width: `${selfPct}%` }}
                    />
                    <span
                      className="sync-duel-metric__fill sync-duel-metric__fill--partner"
                      style={{ width: `${partnerPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </details>

        {showRating && (
          <div className="sync-duel-card__rating">
            <p className="text-[11px] text-[#9CA3AF] mb-2 text-center">
              ¿Cómo estuvo el sync con {partnerFirst}?
            </p>
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRate?.(r)}
                  className="text-xl px-1.5 py-0.5 text-[#FF671F] hover:text-white active:scale-90 transition"
                  aria-label={`${r} estrellas`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="sync-duel-card__actions">
          <button
            type="button"
            onClick={() => onResync(partnerId)}
            className="sync-duel-card__btn sync-duel-card__btn--primary"
          >
            🔄 Re-sync con {partnerFirst}
          </button>
          {actions.length > 0 && (
            <button
              type="button"
              onClick={onReplay}
              className="sync-duel-card__btn sync-duel-card__btn--ghost"
            >
              Ver timeline
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              void downloadSyncStory({
                selfName,
                partnerName,
                minutes,
                vibe,
                setsLogged,
              })
            }
            className="sync-duel-card__btn sync-duel-card__btn--ghost"
          >
            📱 Story 1080×1920
          </button>
          {onInviteSquad && (
            <button
              type="button"
              onClick={() => onInviteSquad(partnerId, partnerName)}
              className="sync-duel-card__btn sync-duel-card__btn--ghost"
            >
              👥 Invitar a Squad
            </button>
          )}
          <button
            type="button"
            onClick={() => void shareSummary()}
            className="sync-duel-card__btn sync-duel-card__btn--ghost"
          >
            <Share2 size={14} /> Compartir
          </button>
          <button
            type="button"
            onClick={onClose}
            className="sync-duel-card__btn sync-duel-card__btn--ghost"
          >
            Cerrar
          </button>
        </div>

        <p className="sync-duel-card__footer">
          Queda en vuestro historial — re-sync suma a tu alianza y Fuerza del equipo.
        </p>
      </motion.div>
    </div>
  )
}
