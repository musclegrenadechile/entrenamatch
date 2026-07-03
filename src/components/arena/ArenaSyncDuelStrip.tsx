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
    <div className="em-v2-arena-duel mx-4 mt-2" aria-label="Marcador en vivo">
      <div className="em-v2-arena-duel__head">
        <span className="em-v2-arena-duel__tag">📊 MARCADOR EN VIVO</span>
        <span className="em-v2-arena-duel__hint">Al terminar → resumen completo</span>
      </div>
      <div className="em-v2-arena-duel__row">
        <div
          className={`em-v2-arena-duel__side ${
            duel.winner === 'self' ? 'em-v2-arena-duel__side--lead' : ''
          }`}
        >
          <span className="em-v2-arena-duel__name">{selfFirst}</span>
          <span className="em-v2-arena-duel__score">{duel.self.score}</span>
          <span className="em-v2-arena-duel__meta">{duel.self.actions} acc</span>
        </div>
        <span className="em-v2-arena-duel__vs">VS</span>
        <div
          className={`em-v2-arena-duel__side ${
            duel.winner === 'partner' ? 'em-v2-arena-duel__side--lead' : ''
          }`}
        >
          <span className="em-v2-arena-duel__name">{partnerFirst}</span>
          <span className="em-v2-arena-duel__score">{duel.partner.score}</span>
          <span className="em-v2-arena-duel__meta">{duel.partner.actions} acc</span>
        </div>
      </div>
      {duel.self.actions + duel.partner.actions === 0 && (
        <p className="em-v2-arena-duel__empty">
          Toca Set listo, Ánimo o PR — cada acción suma al marcador
        </p>
      )}
    </div>
  )
}