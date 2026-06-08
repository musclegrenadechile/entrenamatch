import { Dumbbell, X } from 'lucide-react'

export type HomeCoachBannerContext = 'post-live' | 'post-sync'

export interface HomeCoachBannerProps {
  context: HomeCoachBannerContext
  onOpenCoach: () => void
  onDismiss: () => void
}

const COPY: Record<
  HomeCoachBannerContext,
  { title: string; body: string; cta: string }
> = {
  'post-live': {
    title: '¿Subir de nivel con un PT?',
    body: 'Acabas de cerrar tu live. Un coach puede ayudarte a convertir esa sesión en progreso medible.',
    cta: 'Ver EntrenaCoach',
  },
  'post-sync': {
    title: 'Lleva tu sync al siguiente nivel',
    body: 'Gran sesión en equipo. Reserva una sesión con un PT para afinar técnica o planificar la próxima semana.',
    cta: 'Explorar coaches',
  },
}

export function HomeCoachBanner({ context, onOpenCoach, onDismiss }: HomeCoachBannerProps) {
  const copy = COPY[context]

  return (
    <div className="mb-3 rounded-2xl border border-[#6366f1]/40 bg-gradient-to-r from-[#6366f1]/15 via-[#1C1C20] to-[#FF671F]/10 p-3 relative overflow-hidden">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-2 right-2 text-[#9CA3AF] active:text-white p-1"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="w-9 h-9 rounded-xl bg-[#6366f1]/25 flex items-center justify-center flex-shrink-0">
          <Dumbbell size={18} className="text-[#a5b4fc]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white">{copy.title}</p>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-snug">{copy.body}</p>
          <button
            type="button"
            onClick={onOpenCoach}
            className="mt-2 text-[10px] font-bold px-3 py-1.5 rounded-full bg-[#6366f1] text-white active:brightness-90"
          >
            {copy.cta} →
          </button>
        </div>
      </div>
    </div>
  )
}
