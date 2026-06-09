import { Dumbbell, TrendingUp } from 'lucide-react'
import type { WeekWorkoutSummary } from '../../utils/workoutProgress'
import { formatWeekVolume } from '../../utils/workoutProgress'

export interface EntrenoDeHoyWeekSummaryProps {
  summary: WeekWorkoutSummary | null
  onOpenEntrenoDeHoy?: () => void
  exerciseHighlights?: Array<{ name: string; bestWeightKg: number; trend: 'up' | 'flat' | 'down' }>
}

export function EntrenoDeHoyWeekSummary({
  summary,
  onOpenEntrenoDeHoy,
  exerciseHighlights = [],
}: EntrenoDeHoyWeekSummaryProps) {
  if (!summary) return null

  const maxVol = Math.max(1, ...summary.days.map((d) => d.volumeKg))

  return (
    <section
      className="rounded-2xl border border-[#FF671F]/25 bg-gradient-to-br from-[#FF671F]/8 via-[#141418] to-[#0f0f12] p-3.5"
      aria-label="Resumen semanal Entreno de Hoy"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#FF671F]/20 flex items-center justify-center shrink-0">
            <Dumbbell className="w-4 h-4 text-[#FF671F]" />
          </div>
          <div>
            <p className="text-xs font-black text-white">Tu semana · Entreno de Hoy</p>
            <p className="text-[10px] text-[#9CA3AF]">
              {summary.activeDays} días · {summary.totalSessions} sesiones ·{' '}
              {formatWeekVolume(summary.totalVolumeKg)}
            </p>
          </div>
        </div>
        {onOpenEntrenoDeHoy && (
          <button
            type="button"
            onClick={onOpenEntrenoDeHoy}
            className="text-[9px] px-2.5 py-1 rounded-full bg-[#FF671F] text-black font-bold shrink-0"
          >
            + Log
          </button>
        )}
      </div>

      <div className="flex items-end gap-1 h-14 mb-2">
        {summary.days.map((d) => {
          const h = d.volumeKg > 0 ? Math.max(12, Math.round((d.volumeKg / maxVol) * 100)) : 4
          return (
            <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
              <div
                className={`w-full rounded-t-md transition-all ${
                  d.sessions > 0 ? 'bg-[#FF671F]' : 'bg-white/10'
                }`}
                style={{ height: `${h}%` }}
                title={
                  d.sessions > 0
                    ? `${d.sessions} sesión · ${d.sets} sets`
                    : 'Sin registro'
                }
              />
              <span className="text-[8px] text-[#9CA3AF] truncate w-full text-center">{d.label}</span>
            </div>
          )
        })}
      </div>

      {exerciseHighlights.length > 0 && (
        <div className="pt-2 border-t border-white/8 space-y-1.5">
          <p className="text-[9px] uppercase tracking-wider text-[#9CA3AF] font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Progreso reciente
          </p>
          {exerciseHighlights.map((ex) => (
            <div
              key={ex.name}
              className="flex items-center justify-between text-[10px] text-white/90"
            >
              <span className="truncate pr-2">{ex.name}</span>
              <span className="shrink-0 tabular-nums text-[#FFD700] font-bold">
                {ex.trend === 'up' ? '↑' : ex.trend === 'down' ? '↓' : '→'}{' '}
                {ex.bestWeightKg > 0 ? `${ex.bestWeightKg} kg` : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
