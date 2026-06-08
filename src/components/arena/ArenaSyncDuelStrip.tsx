import { computeSyncDuel, type SyncDuelAction } from '../../utils/syncDuel'

export interface ArenaSyncDuelStripProps {
  actions: SyncDuelAction[]
  effectiveUserId: string
  partnerId: string
  selfName: string
  partnerName: string
}

/** Live duel scoreboard — visible during EntrenaSync (D3 preview). */
export function ArenaSyncDuelStrip({
  actions,
  effectiveUserId,
  partnerId,
  selfName,
  partnerName,
}: ArenaSyncDuelStripProps) {
  const duel = computeSyncDuel(actions, effectiveUserId, selfName, partnerId, partnerName)
  const selfFirst = duel.self.name
  const partnerFirst = duel.partner.name

  return (
    <div className="arena-sync-duel-strip mx-4 mt-2" aria-label="Duelo en vivo">
      <div className="arena-sync-duel-strip__head">
        <span className="arena-sync-duel-strip__tag">⚔️ DUELO EN VIVO</span>
        <span className="arena-sync-duel-strip__hint">Al terminar → resumen completo</span>
      </div>
      <div className="arena-sync-duel-strip__row">
        <div className={`arena-sync-duel-strip__side ${duel.winner === 'self' ? 'arena-sync-duel-strip__side--lead' : ''}`}>
          <span className="arena-sync-duel-strip__name">{selfFirst}</span>
          <span className="arena-sync-duel-strip__score">{duel.self.score}</span>
          <span className="arena-sync-duel-strip__meta">{duel.self.actions} acc</span>
        </div>
        <span className="arena-sync-duel-strip__vs">VS</span>
        <div className={`arena-sync-duel-strip__side ${duel.winner === 'partner' ? 'arena-sync-duel-strip__side--lead' : ''}`}>
          <span className="arena-sync-duel-strip__name">{partnerFirst}</span>
          <span className="arena-sync-duel-strip__score">{duel.partner.score}</span>
          <span className="arena-sync-duel-strip__meta">{duel.partner.actions} acc</span>
        </div>
      </div>
      {duel.self.actions + duel.partner.actions === 0 && (
        <p className="arena-sync-duel-strip__empty">
          Toca Set listo, Ánimo o PR — cada acción suma al duelo
        </p>
      )}
    </div>
  )
}
