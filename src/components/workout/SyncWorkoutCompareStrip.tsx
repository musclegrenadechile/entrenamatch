import type { SyncWorkoutCompare } from '../../utils/workoutSyncCompare'

export interface SyncWorkoutCompareStripProps {
  compare: SyncWorkoutCompare
  selfName: string
  partnerName: string
}

export function SyncWorkoutCompareStrip({
  compare,
  selfName,
  partnerName,
}: SyncWorkoutCompareStripProps) {
  const selfFirst = selfName.split(' ')[0] || 'Tú'
  const partnerFirst = partnerName.split(' ')[0] || 'Compañero'

  return (
    <div className="em-v2-card em-v2-card--compact mx-4 mb-3">
      <p className="em-v2-training__eyebrow mb-1">Entreno de Hoy · comparativa</p>
      <p className="text-xs font-bold text-white">{compare.headline}</p>
      <p className="em-v2-card__detail mt-0.5 mb-2">{compare.subline}</p>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div
          className={`em-v2-training__compare-cell ${
            compare.winner === 'self' ? 'em-v2-training__compare-cell--win' : ''
          }`}
        >
          <p className="text-[#9CA3AF] truncate">{selfFirst}</p>
          <p className="font-bold text-white tabular-nums">
            {compare.self.sets} sets · {compare.self.volumeKg.toLocaleString('es-CL')} kg
          </p>
        </div>
        <div
          className={`em-v2-training__compare-cell ${
            compare.winner === 'partner' ? 'em-v2-training__compare-cell--gold' : ''
          }`}
        >
          <p className="text-[#9CA3AF] truncate">{partnerFirst}</p>
          <p className="font-bold text-white tabular-nums">
            {compare.partner.sets} sets · {compare.partner.volumeKg.toLocaleString('es-CL')} kg
          </p>
        </div>
      </div>
    </div>
  )
}