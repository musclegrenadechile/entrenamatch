import { Dumbbell } from 'lucide-react'
import { buildWorkoutDraftBannerMeta } from '../../utils/workoutDraftBannerMeta'
import type { WorkoutDraft } from '../../utils/workoutDraft'

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
  return (
    <div
      className="em-v2-draft-banner em-v2-draft-banner--enter"
      role="status"
      aria-live="polite"
    >
      <div className="em-v2-training__icon em-v2-draft-banner__icon">
        <Dumbbell className="w-4 h-4 text-[#FF671F]" />
      </div>
      <div className="em-v2-draft-banner__copy">
        <p className="em-v2-draft-banner__title">Entreno sin terminar</p>
        <p className="em-v2-card__detail mt-0.5">{buildWorkoutDraftBannerMeta(draft)}</p>
      </div>
      <div className="em-v2-draft-banner__actions">
        <button type="button" onClick={onResume} className="em-v2-hero-card__cta text-[10px] px-3 py-1.5">
          Continuar
        </button>
        <button type="button" onClick={onDiscard} className="em-v2-draft-banner__discard">
          Descartar
        </button>
      </div>
    </div>
  )
}