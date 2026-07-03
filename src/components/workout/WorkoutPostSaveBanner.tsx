import { Dumbbell, Share2, X } from 'lucide-react'

export interface WorkoutPostSaveBannerData {
  title: string
  prSummary?: string
  burnKcal?: number
  fuelTip?: string
}

export interface WorkoutPostSaveBannerProps extends WorkoutPostSaveBannerData {
  onShareStory: () => void
  onOpenFuel: () => void
  onDismiss: () => void
}

/** Oleada 362 — CTA prominente tras guardar Entreno de Hoy. */
export function WorkoutPostSaveBanner({
  title,
  prSummary,
  burnKcal,
  fuelTip,
  onShareStory,
  onOpenFuel,
  onDismiss,
}: WorkoutPostSaveBannerProps) {
  const meta = [
    burnKcal && burnKcal > 0 ? `~${burnKcal} kcal` : null,
    prSummary || null,
    fuelTip || null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div
      className="em-v2-training-save-banner em-v2-training-save-banner--sticky em-v2-training-save-banner--enter"
      role="status"
    >
      <button type="button" onClick={onDismiss} className="em-v2-training-save-banner__close" aria-label="Cerrar">
        <X size={14} />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="em-v2-training__icon">
          <Dumbbell className="w-4 h-4 text-[#FF671F]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-xs font-bold text-white">Entreno guardado · {title}</p>
            {prSummary && (
              <span className="em-v2-training-save-banner__pr-badge">🏆 Nuevo PR</span>
            )}
          </div>
          {meta && <p className="em-v2-card__detail mt-0.5 leading-snug">{meta}</p>}
          <div className="flex flex-wrap gap-2 mt-2.5">
            <button type="button" onClick={onShareStory} className="em-v2-hero-card__cta text-[10px] px-3 py-1.5 flex items-center gap-1">
              <Share2 size={12} /> Compartir story
            </button>
            <button
              type="button"
              onClick={onOpenFuel}
              className="em-v2-card__cta--outline text-[10px] px-3 py-1.5"
              aria-label="Registrar post-entreno en Fuel"
            >
              Registrar post-entreno
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}