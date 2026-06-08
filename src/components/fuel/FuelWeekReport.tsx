import type { FuelWeekMacroDay } from '../../services/fuel'

export interface FuelWeekReportProps {
  days: FuelWeekMacroDay[]
  adjustedTargetKcal?: number
  weeklyBurnKcal?: number
}

export function FuelWeekReport({ days, adjustedTargetKcal, weeklyBurnKcal = 0 }: FuelWeekReportProps) {
  const totals = days.reduce(
    (acc, d) => ({
      kcal: acc.kcal + d.kcal,
      proteinG: acc.proteinG + d.proteinG,
      carbsG: acc.carbsG + d.carbsG,
      fatG: acc.fatG + d.fatG,
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  )

  const loggedDays = days.filter((d) => d.logged).length
  const avgKcal = loggedDays > 0 ? Math.round(totals.kcal / loggedDays) : 0
  const targetLine =
    adjustedTargetKcal && loggedDays > 0
      ? `Promedio ${avgKcal} kcal/día vs target ~${adjustedTargetKcal} (balance dinámico)`
      : null

  return (
    <div className="fuel-week-report">
      <p className="fuel-week-report__title">Reporte semanal Fuel</p>
      {targetLine && (
        <p className="text-[10px] text-[#c084fc] mb-2">{targetLine}</p>
      )}
      {weeklyBurnKcal > 0 && (
        <p className="text-[10px] text-[#22c55e] mb-2">~{weeklyBurnKcal} kcal estimadas en entrenos esta semana</p>
      )}
      <div className="fuel-week-report__totals">
        <span>{Math.round(totals.kcal)} kcal</span>
        <span>P {Math.round(totals.proteinG)}g</span>
        <span>C {Math.round(totals.carbsG)}g</span>
        <span>G {Math.round(totals.fatG)}g</span>
      </div>
      <div className="fuel-week-report__grid">
        {days.map((d) => (
          <div key={d.date} className={`fuel-week-report__day${d.logged ? '' : ' fuel-week-report__day--empty'}`}>
            <span className="fuel-week-report__label">{d.label}</span>
            <span className="fuel-week-report__kcal">{d.logged ? `${Math.round(d.kcal)}` : '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
