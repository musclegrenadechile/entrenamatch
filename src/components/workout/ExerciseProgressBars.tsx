import { TrendingUp } from 'lucide-react'
import type { ExerciseProgressEntry } from '../../utils/workoutProgress'

export interface ExerciseProgressBarsProps {
  entries: ExerciseProgressEntry[]
}

function trendSymbol(trend: ExerciseProgressEntry['trend']): string {
  if (trend === 'up') return '↑'
  if (trend === 'down') return '↓'
  return '→'
}

/** Barras de progreso por ejercicio — Perfil / Entreno de Hoy. */
export function ExerciseProgressBars({ entries }: ExerciseProgressBarsProps) {
  if (!entries.length) return null

  return (
    <div className="em-v2-training-progress">
      <p className="em-v2-training-progress__label">
        <TrendingUp className="w-3 h-3" aria-hidden />
        Progreso por ejercicio
      </p>
      <ul className="em-v2-training-progress__list">
        {entries.map((ex) => {
          const maxW = Math.max(1, ...ex.points.map((p) => p.weightKg))
          return (
            <li key={ex.name} className="em-v2-training-progress__row">
              <div className="em-v2-training-progress__head">
                <span className="em-v2-training-progress__name truncate">{ex.name}</span>
                <span
                  className={`em-v2-training-progress__best em-v2-training-progress__best--${ex.trend}`}
                >
                  {trendSymbol(ex.trend)}{' '}
                  {ex.bestWeightKg > 0 ? `${ex.bestWeightKg} kg` : `${ex.bestReps} reps`}
                </span>
              </div>
              <div className="em-v2-training-progress__bars" aria-hidden>
                {ex.points.map((p, i) => (
                  <div
                    key={i}
                    className="em-v2-training-progress__bar"
                    style={{
                      height: `${Math.max(18, Math.round((p.weightKg / maxW) * 100))}%`,
                    }}
                    title={`${p.weightKg}kg × ${p.reps}`}
                  />
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}