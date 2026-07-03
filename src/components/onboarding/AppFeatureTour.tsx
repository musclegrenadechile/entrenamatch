import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const TOUR_KEY = 'entrenamatch_feature_tour_seen'

const STEPS = [
  {
    id: 'home',
    title: 'Hoy — tu día',
    body: 'Empieza aquí: Copa Zona, piloto regional y el botón LIVE flotante cuando entrenes.',
    anchor: 'bottom-nav-home',
  },
  {
    id: 'map',
    title: 'Mapa en vivo',
    body: 'Ve quién entrena cerca. Toca el pin Mapa en la barra inferior.',
    anchor: 'bottom-nav-map',
  },
  {
    id: 'explore',
    title: 'Explorar y swipe',
    body: 'Desliza perfiles compatibles. ❤️ = conexión instantánea y chat.',
    anchor: 'bottom-nav-explore',
  },
  {
    id: 'red',
    title: 'Matches y chat',
    body: 'Tus matches viven aquí. Rompe el hielo y agenda un EntrenaSync.',
    anchor: 'bottom-nav-red',
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
  /** Navigate to the tab that matches the current tour step. */
  onGoToStep?: (stepId: (typeof STEPS)[number]['id']) => void
}

function clearTourHighlights() {
  document.querySelectorAll('[data-tour].tour-highlight').forEach((el) => {
    el.classList.remove('tour-highlight')
  })
}

/** Optional discovery tour — 3 steps anchored to bottom nav (fase 108). */
export function AppFeatureTour({ open, onClose, onGoToStep }: AppFeatureTourProps) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (open) {
      setStep(0)
      onGoToStep?.('home')
    }
  }, [open, onGoToStep])

  useEffect(() => {
    if (!open) {
      clearTourHighlights()
      return
    }
    clearTourHighlights()
    const anchor = STEPS[step]?.anchor
    if (anchor) {
      document.querySelector(`[data-tour="${anchor}"]`)?.classList.add('tour-highlight')
    }
    return clearTourHighlights
  }, [open, step])

  if (!open) return null

  const current = STEPS[step]
  const isLast = step >= STEPS.length - 1

  const finish = () => {
    clearTourHighlights()
    markAppFeatureTourSeen()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/60 flex items-end sm:items-center justify-center p-4 pb-24 pointer-events-none"
      role="dialog"
      aria-label="Tour rápido de EntrenaMatch"
    >
      <div className="w-full max-w-sm bg-[#1C1C20] border border-[#FF671F]/30 rounded-3xl p-5 shadow-2xl relative pointer-events-auto">
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
              if (isLast) {
                finish()
                return
              }
              const next = step + 1
              setStep(next)
              onGoToStep?.(STEPS[next].id)
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
