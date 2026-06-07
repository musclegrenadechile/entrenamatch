import type { FuelDayTotals, FuelProfile } from '../../types'

export interface FuelDayCardProps {
  profile: FuelProfile | null
  totals: FuelDayTotals
  postWorkoutTip?: string
  onSetup: () => void
  onLogMeal: () => void
}

function pct(current: number, target: number): number {
  if (!target) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

export function FuelDayCard({
  profile,
  totals,
  postWorkoutTip,
  onSetup,
  onLogMeal,
}: FuelDayCardProps) {
  if (!profile) {
    return (
      <div className="rounded-3xl p-4 bg-gradient-to-br from-[#1a1520] via-[#141418] to-[#0f0f12] border border-[#a855f7]/25">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#c084fc] font-bold">Fuel AI</p>
        <h3 className="text-sm font-black text-white mt-1">Configura tu fuel del día</h3>
        <p className="text-[11px] text-[#9CA3AF] mt-1 leading-snug">
          TDEE + macros según tu objetivo. Luego registra comidas con foto o manual.
        </p>
        <button
          type="button"
          onClick={onSetup}
          className="mt-3 w-full py-2.5 rounded-xl bg-[#a855f7]/20 border border-[#a855f7]/40 text-[11px] font-bold text-[#c084fc] active:bg-[#a855f7]/30"
        >
          Configurar Fuel →
        </button>
      </div>
    )
  }

  const kcalPct = pct(totals.kcal, profile.targetKcal)
  const proteinPct = pct(totals.proteinG, profile.targetProteinG)

  return (
    <div className="rounded-3xl p-4 bg-gradient-to-br from-[#1a1520] via-[#141418] to-[#0f0f12] border border-[#a855f7]/25">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#c084fc] font-bold">Fuel del día</p>
          <p className="text-lg font-black text-white tabular-nums">
            {totals.kcal}{' '}
            <span className="text-sm text-[#9CA3AF] font-semibold">/ {profile.targetKcal} kcal</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onSetup}
          className="text-[9px] text-[#9CA3AF] underline shrink-0"
        >
          Editar
        </button>
      </div>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-[#a855f7] to-[#c084fc] transition-all"
          style={{ width: `${kcalPct}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-3">
        <div className="rounded-xl bg-white/5 py-2 px-1">
          <div className="text-[#c084fc] font-black tabular-nums">{totals.proteinG}g</div>
          <div className="text-[#6B7280]">Prot / {profile.targetProteinG}g</div>
        </div>
        <div className="rounded-xl bg-white/5 py-2 px-1">
          <div className="text-white font-black tabular-nums">{totals.carbsG}g</div>
          <div className="text-[#6B7280]">Carbs / {profile.targetCarbsG}g</div>
        </div>
        <div className="rounded-xl bg-white/5 py-2 px-1">
          <div className="text-white font-black tabular-nums">{totals.fatG}g</div>
          <div className="text-[#6B7280]">Grasa / {profile.targetFatG}g</div>
        </div>
      </div>

      {proteinPct < 70 && totals.entryCount > 0 && (
        <p className="text-[10px] text-[#fbbf24] mb-2 leading-snug">
          Te faltan ~{Math.max(0, profile.targetProteinG - totals.proteinG)}g proteína para cerrar el día.
        </p>
      )}

      {postWorkoutTip && (
        <p className="text-[10px] text-[#22c55e] mb-2 leading-snug bg-[#22c55e]/8 rounded-xl px-2.5 py-2 border border-[#22c55e]/20">
          💡 {postWorkoutTip}
        </p>
      )}

      <button
        type="button"
        onClick={onLogMeal}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#9333ea] text-black text-[11px] font-extrabold active:opacity-90"
      >
        + Registrar comida (foto o manual)
      </button>

      <p className="text-[8px] text-[#6B7280] mt-2 text-center leading-snug">
        Estimaciones IA — no es consejo médico. TDEE ref: {profile.tdee} kcal.
      </p>
    </div>
  )
}
