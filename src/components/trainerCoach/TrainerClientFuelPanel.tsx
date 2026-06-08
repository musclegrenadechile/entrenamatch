import type { DailyEnergyBalance } from '../../domain/fuelBalance'

export interface TrainerClientFuelPanelProps {
  clientName: string
  balance: DailyEnergyBalance | null
  onSuggestMacros?: () => void
}

/** Phase 86 — PT sees client FuelBalance snapshot. */
export function TrainerClientFuelPanel({
  clientName,
  balance,
  onSuggestMacros,
}: TrainerClientFuelPanelProps) {
  if (!balance) {
    return (
      <div className="rounded-2xl border border-[#a855f7]/25 bg-[#1C1C20] p-4 text-[11px] text-[#9CA3AF]">
        {clientName} aún no tiene Fuel configurado hoy.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#a855f7]/30 bg-gradient-to-br from-[#1a1520] to-[#1C1C20] p-4">
      <p className="text-[10px] uppercase tracking-wider text-[#c084fc] font-bold">FuelBalance · {clientName}</p>
      <p className="text-sm font-black text-white mt-1 tabular-nums">
        {balance.consumed.kcal} / {balance.adjustedTargetKcal} kcal
      </p>
      <p className="text-[10px] text-[#9CA3AF] mt-1">
        Entreno +{balance.workoutBurnKcal + balance.liveBurnKcal} kcal · Restan ~{Math.max(0, balance.remaining.kcal)} kcal
      </p>
      {balance.dominantMuscle && (
        <p className="text-[10px] text-[#22c55e] mt-2">Dominante hoy: {balance.dominantMuscle}</p>
      )}
      {onSuggestMacros && (
        <button
          type="button"
          onClick={onSuggestMacros}
          className="mt-3 w-full py-2 rounded-xl bg-[#a855f7]/20 text-[#c084fc] text-xs font-bold border border-[#a855f7]/30"
        >
          Prescribir ajuste de macros
        </button>
      )}
    </div>
  )
}
