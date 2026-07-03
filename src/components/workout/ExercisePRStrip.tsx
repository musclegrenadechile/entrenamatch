import type { ExercisePRRecord } from '../../services/exercisePRs'
import { formatExercisePRLine } from '../../services/exercisePRs'

export interface ExercisePRStripProps {
  records: ExercisePRRecord[]
  onOpenEntrenoLog?: () => void
}

/** Fase 95 — recent personal records from Entreno de Hoy. */
export function ExercisePRStrip({ records, onOpenEntrenoLog }: ExercisePRStripProps) {
  if (!records.length) return null

  return (
    <section className="em-v2-card em-v2-card--brand em-v2-training-pr" aria-label="Records personales">
      <div className="em-v2-training-pr__head">
        <p className="em-v2-training__eyebrow">Tus PRs</p>
        {onOpenEntrenoLog && (
          <button type="button" onClick={onOpenEntrenoLog} className="em-v2-card__cta--ghost text-[10px]">
            Registrar
          </button>
        )}
      </div>
      <ul className="em-v2-training-pr__list">
        {records.slice(0, 4).map((r) => (
          <li key={`${r.exerciseKey}-${r.achievedAt}`} className="em-v2-training__pr-row em-v2-training-pr__item">
            <span className="em-v2-training-pr__name truncate">🏆 {r.exerciseName}</span>
            <span className="em-v2-training-pr__value tabular-nums shrink-0">
              {formatExercisePRLine(r).split(' · ')[1] || `${r.reps} reps`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}