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
    <div className="mx-4 mb-3 px-3 py-2.5 rounded-xl bg-[#FF671F]/10 border border-[#FF671F]/25">
      <p className="text-[9px] uppercase tracking-wider text-[#FF671F] font-bold mb-1">
        Entreno de Hoy · comparativa
      </p>
      <p className="text-xs font-bold text-white">{compare.headline}</p>
      <p className="text-[10px] text-[#9CA3AF] mt-0.5 mb-2">{compare.subline}</p>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div
          className={`rounded-lg px-2 py-1.5 ${
            compare.winner === 'self' ? 'bg-[#22c55e]/15 border border-[#22c55e]/30' : 'bg-black/30'
          }`}
        >
          <p className="text-[#9CA3AF] truncate">{selfFirst}</p>
          <p className="font-bold text-white tabular-nums">
            {compare.self.sets} sets · {compare.self.volumeKg.toLocaleString('es-CL')} kg
          </p>
        </div>
        <div
          className={`rounded-lg px-2 py-1.5 ${
            compare.winner === 'partner' ? 'bg-[#FFD700]/15 border border-[#FFD700]/30' : 'bg-black/30'
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
