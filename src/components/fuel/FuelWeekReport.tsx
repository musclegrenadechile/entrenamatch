import type { FuelWeekMacroDay } from '../../services/fuel'

export interface FuelWeekReportProps {
  days: FuelWeekMacroDay[]
}

export function FuelWeekReport({ days }: FuelWeekReportProps) {
  const totals = days.reduce(
    (acc, d) => ({
      kcal: acc.kcal + d.kcal,
      proteinG: acc.proteinG + d.proteinG,
      carbsG: acc.carbsG + d.carbsG,
      fatG: acc.fatG + d.fatG,
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  )

  return (
    <div className="fuel-week-report">
      <p className="fuel-week-report__title">Reporte semanal Fuel</p>
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
