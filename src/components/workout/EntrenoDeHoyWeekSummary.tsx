import { Dumbbell, TrendingUp, Users } from 'lucide-react'
import type { WeekWorkoutDay, WeekWorkoutSummary } from '../../utils/workoutProgress'
import { formatWeekVolume } from '../../utils/workoutProgress'
import type { WeeklyPactProgress } from '../../services/weeklyPact'

export interface EntrenoDeHoyWeekSummaryProps {
  summary: WeekWorkoutSummary | null
  onOpenEntrenoDeHoy?: () => void
  exerciseHighlights?: Array<{ name: string; bestWeightKg: number; trend: 'up' | 'flat' | 'down' }>
  pactProgress?: WeeklyPactProgress | null
  partnerCompare?: {
    partnerName: string
    selfSessions: number
    partnerSessions: number
    selfSets: number
    partnerSets: number
  } | null
}

function WeekVolumeSparkline({ days }: { days: WeekWorkoutDay[] }) {
  if (!days.length) return null
  const values = days.map((d) => d.volumeKg)
  const max = Math.max(1, ...values)
  const w = 100
  const h = 28
  const step = days.length > 1 ? w / (days.length - 1) : 0
  const points = values
    .map((v, i) => {
      const x = days.length > 1 ? i * step : w / 2
      const y = h - 4 - (v / max) * (h - 8)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      className="em-v2-training__sparkline"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export function EntrenoDeHoyWeekSummary({
  summary,
  onOpenEntrenoDeHoy,
  exerciseHighlights = [],
  pactProgress = null,
  partnerCompare = null,
}: EntrenoDeHoyWeekSummaryProps) {
  if (!summary) return null

  const maxVol = Math.max(1, ...summary.days.map((d) => d.volumeKg))

  return (
    <section className="em-v2-card em-v2-card--brand" aria-label="Resumen semanal Entreno de Hoy">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="em-v2-training__icon">
            <Dumbbell className="w-4 h-4 text-[#FF671F]" />
          </div>
          <div>
            <p className="em-v2-card__title text-sm">Tu semana · Entreno de Hoy</p>
            <p className="em-v2-card__detail">
              {summary.activeDays} días · {summary.totalSessions} sesiones ·{' '}
              {formatWeekVolume(summary.totalVolumeKg)}
            </p>
          </div>
        </div>
        {onOpenEntrenoDeHoy && (
          <button type="button" onClick={onOpenEntrenoDeHoy} className="em-v2-card__cta text-[10px] px-2.5 py-1 shrink-0">
            + Log
          </button>
        )}
      </div>

      <WeekVolumeSparkline days={summary.days} />

      <div className="em-v2-training__chart">
        {summary.days.map((d) => {
          const h = d.volumeKg > 0 ? Math.max(12, Math.round((d.volumeKg / maxVol) * 100)) : 4
          return (
            <div key={d.dateStr} className="em-v2-training__chart-day">
              <div
                className={`em-v2-training__chart-bar ${d.sessions > 0 ? 'em-v2-training__chart-bar--active' : ''}`}
                style={{ height: `${h}%` }}
                title={
                  d.sessions > 0 ? `${d.sessions} sesión · ${d.sets} sets` : 'Sin registro'
                }
              />
              <span className="em-v2-training__chart-label">{d.label}</span>
            </div>
          )
        })}
      </div>

      {pactProgress?.pledged && (
        <div className="em-v2-training__pact-row">
          <span className="text-[#9CA3AF]">Meta semanal · logs</span>
          <span className="font-bold text-[#FF671F] tabular-nums">
            {pactProgress.loggedSessionsDone}/{pactProgress.loggedSessionsTarget} sesiones
          </span>
        </div>
      )}

      {partnerCompare && (
        <div className="em-v2-training__compare">
          <p className="em-v2-training__compare-label">
            <Users className="w-3 h-3" /> vs {partnerCompare.partnerName.split(' ')[0]}
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <p className="text-[#9CA3AF]">Tú</p>
              <p className="font-bold text-white">
                {partnerCompare.selfSessions} ses · {partnerCompare.selfSets} sets
              </p>
            </div>
            <div>
              <p className="text-[#9CA3AF]">{partnerCompare.partnerName.split(' ')[0]}</p>
              <p className="font-bold text-white">
                {partnerCompare.partnerSessions} ses · {partnerCompare.partnerSets} sets
              </p>
            </div>
          </div>
        </div>
      )}

      {exerciseHighlights.length > 0 && (
        <div className="em-v2-training__highlights">
          <p className="em-v2-training__highlights-label">
            <TrendingUp className="w-3 h-3" /> Progreso reciente
          </p>
          {exerciseHighlights.map((ex) => (
            <div key={ex.name} className="em-v2-training__highlight-row">
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