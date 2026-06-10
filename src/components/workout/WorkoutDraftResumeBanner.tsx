import { Dumbbell } from 'lucide-react'
import { formatDraftAge, type WorkoutDraft } from '../../utils/workoutDraft'

type WorkoutDraftResumeBannerProps = {
  draft: WorkoutDraft
  onResume: () => void
  onDiscard: () => void
}

export function WorkoutDraftResumeBanner({
  draft,
  onResume,
  onDiscard,
}: WorkoutDraftResumeBannerProps) {
  const count = draft.exercises.length
  const sets = draft.exercises.reduce((n, e) => n + e.sets.length, 0)

  return (
    <div className="rounded-2xl border border-[#FF671F]/40 bg-gradient-to-r from-[#FF671F]/15 to-[#141418] p-3.5 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#FF671F]/25 flex items-center justify-center shrink-0">
        <Dumbbell className="w-5 h-5 text-[#FF671F]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-white">Entreno sin terminar</p>
        <p className="text-[10px] text-[#9CA3AF] mt-0.5">
          {count} ejercicio{count !== 1 ? 's' : ''} · {sets} bloques · {formatDraftAge(draft.updatedAt)}
        </p>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button
          type="button"
          onClick={onResume}
          className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-[#FF671F] text-black active:brightness-90"
        >
          Continuar
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="text-[9px] text-[#9CA3AF] underline"
        >
          Descartar
        </button>
      </div>
    </div>
  )
}
