import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const TOUR_KEY = 'entrenamatch_feature_tour_seen'

const STEPS = [
  {
    id: 'map',
    title: 'Mapa en vivo',
    body: 'Ve quién entrena cerca de ti. Toca el pin Mapa en la barra inferior.',
    anchor: 'bottom-nav-map',
  },
  {
    id: 'explore',
    title: 'Explorar y swipe',
    body: 'Desliza perfiles compatibles. ❤️ = match instantáneo y chat.',
    anchor: 'bottom-nav-explore',
  },
  {
    id: 'live',
    title: 'Live en Perfil',
    body: 'Activa “Entrenando ahora” para aparecer en el mapa mientras entrenas.',
    anchor: 'bottom-nav-profile',
  },
] as const

export function hasSeenAppFeatureTour(): boolean {
  try {
    return localStorage.getItem(TOUR_KEY) === '1'
  } catch {
    return false
  }
}

export function markAppFeatureTourSeen(): void {
  try {
    localStorage.setItem(TOUR_KEY, '1')
  } catch {
    /* ignore */
  }
}

type AppFeatureTourProps = {
  open: boolean
  onClose: () => void
}

/** Optional 30s discovery tour — 3 hotspots (fase 180). */
export function AppFeatureTour({ open, onClose }: AppFeatureTourProps) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  if (!open) return null

  const current = STEPS[step]
  const isLast = step >= STEPS.length - 1

  const finish = () => {
    markAppFeatureTourSeen()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/75 flex items-end sm:items-center justify-center p-4 pb-24"
      role="dialog"
      aria-label="Tour rápido de EntrenaMatch"
    >
      <div className="w-full max-w-sm bg-[#1C1C20] border border-[#FF671F]/30 rounded-3xl p-5 shadow-2xl relative">
        <button
          type="button"
          onClick={finish}
          className="absolute top-3 right-3 p-1.5 rounded-full text-[#9CA3AF] hover:text-white active:bg-white/10"
          aria-label="Saltar tour"
        >
          <X size={18} />
        </button>
        <p className="text-[10px] uppercase tracking-widest text-[#FF671F] mb-1">
          Paso {step + 1} de {STEPS.length}
        </p>
        <h2 className="text-lg font-black tracking-tight mb-2 pr-8">{current.title}</h2>
        <p className="text-sm text-[#9CA3AF] leading-snug mb-4">{current.body}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={finish}
            className="flex-1 py-2.5 rounded-xl border border-[#2F2F35] text-xs font-semibold text-[#9CA3AF] active:bg-[#25252A]"
          >
            Saltar
          </button>
          <button
            type="button"
            onClick={() => {
              if (isLast) finish()
              else setStep((s) => s + 1)
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#FF671F] text-black text-xs font-bold active:opacity-90"
          >
            {isLast ? 'Empezar' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  )
}
