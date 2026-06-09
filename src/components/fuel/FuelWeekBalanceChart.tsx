import type { FuelWeekBalanceDay } from '../../utils/fuelWeekBalance'

export interface FuelWeekBalanceChartProps {
  days: FuelWeekBalanceDay[]
}

/** Fase 94 — mini bar chart: consumo vs quema vs target. */
export function FuelWeekBalanceChart({ days }: FuelWeekBalanceChartProps) {
  if (!days.length) return null

  const maxVal = Math.max(
    ...days.map((d) => Math.max(d.consumedKcal, d.burnKcal, d.targetKcal, 1)),
    1
  )

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] uppercase tracking-wider text-[#6B7280] font-bold">
          Semana · consumo vs quema
        </span>
        <span className="text-[8px] text-[#6B7280]">— target</span>
      </div>
      <div className="flex justify-between gap-1 items-end h-20">
        {days.map((day) => {
          const consumedH = `${Math.round((day.consumedKcal / maxVal) * 100)}%`
          const burnH = `${Math.round((day.burnKcal / maxVal) * 100)}%`
          const targetH = `${Math.round((day.targetKcal / maxVal) * 100)}%`
          return (
            <div key={day.date} className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <div className="relative w-full h-14 flex items-end justify-center gap-0.5">
                <div
                  className="w-[38%] rounded-t-sm bg-[#22c55e]/70"
                  style={{ height: burnH, minHeight: day.burnKcal > 0 ? 2 : 0 }}
                  title={`Quema ~${day.burnKcal} kcal`}
                />
                <div
                  className="w-[38%] rounded-t-sm bg-gradient-to-t from-[#9333ea] to-[#c084fc]"
                  style={{ height: consumedH, minHeight: day.consumedKcal > 0 ? 2 : 0 }}
                  title={`Consumo ${day.consumedKcal} kcal`}
                />
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-[#9CA3AF]/50 pointer-events-none"
                  style={{ bottom: targetH }}
                  title={`Target ${day.targetKcal} kcal`}
                />
              </div>
              <span
                className={`text-[8px] font-bold truncate w-full text-center ${
                  day.isToday ? 'text-[#c084fc]' : 'text-[#6B7280]'
                }`}
              >
                {day.label}
              </span>
            </div>
          )
        })}
      </div>
      <div className="flex gap-3 mt-1.5 text-[8px] text-[#6B7280]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-[#22c55e]/70" /> Quema
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-[#a855f7]" /> Consumo
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 border-t border-dashed border-[#9CA3AF]/60" /> Target
        </span>
      </div>
    </div>
  )
}
