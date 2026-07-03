import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const TOUR_KEY = 'entrenamatch_feature_tour_seen'

const STEPS = [
  {
    id: 'home',
    title: 'Hoy — tu día',
    body: 'Empieza aquí: reto del día, comunidad y el botón LIVE cuando entrenes.',
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
  {
    id: 'profile',
    title: 'Tu perfil atleta',
    body: 'Foto, stats y tabs Actividad / Red / Ajustes — tu presencia en la red.',
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
  onGoToStep?: (stepId: (typeof STEPS)[number]['id']) => void
}

function clearTourHighlights() {
  document.querySelectorAll('[data-tour].em-v2-tour-highlight').forEach((el) => {
    el.classList.remove('em-v2-tour-highlight')
  })
}

/** Oleada 352 — tour anclado al bottom nav v2. */
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
      document.querySelector(`[data-tour="${anchor}"]`)?.classList.add('em-v2-tour-highlight')
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
      className="em-v2-tour"
      role="dialog"
      aria-label="Tour rápido de EntrenaMatch"
    >
      <div className="em-v2-tour__card">
        <button
          type="button"
          onClick={finish}
          className="em-v2-tour__close"
          aria-label="Saltar tour"
        >
          <X size={18} />
        </button>
        <p className="em-v2-tour__kicker">
          Paso {step + 1} de {STEPS.length}
        </p>
        <div className="em-v2-tour__dots" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={STEPS[i].id}
              className={`em-v2-tour__dot${i === step ? ' em-v2-tour__dot--active' : ''}${i < step ? ' em-v2-tour__dot--done' : ''}`}
            />
          ))}
        </div>
        <h2 className="em-v2-tour__title">{current.title}</h2>
        <p className="em-v2-tour__body">{current.body}</p>
        <div className="em-v2-tour__actions">
          <button type="button" onClick={finish} className="em-v2-tour__skip">
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
            className="em-v2-tour__next"
          >
            {isLast ? 'Empezar' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  )
}