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
    <section
      className="rounded-3xl p-4 border border-[#FF671F]/25 bg-gradient-to-br from-[#1a1208] to-[#141418]"
      aria-label="Records personales"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#FF671F] font-bold">
          Tus PRs
        </p>
        {onOpenEntrenoLog && (
          <button
            type="button"
            onClick={onOpenEntrenoLog}
            className="text-[9px] text-[#9CA3AF] underline"
          >
            Registrar
          </button>
        )}
      </div>
      <ul className="space-y-1.5">
        {records.slice(0, 4).map((r) => (
          <li
            key={`${r.exerciseKey}-${r.achievedAt}`}
            className="flex items-center justify-between text-[11px] bg-white/[0.04] rounded-xl px-2.5 py-2"
          >
            <span className="font-bold text-white truncate">🏆 {r.exerciseName}</span>
            <span className="text-[#FF671F] font-black tabular-nums shrink-0 ml-2">
              {formatExercisePRLine(r).split(' · ')[1] || `${r.reps} reps`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
