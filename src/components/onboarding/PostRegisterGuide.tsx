import { useState } from 'react'
import { ArrowRight, Dumbbell, Radio, Users, X } from 'lucide-react'

export interface PostRegisterGuideProps {
  open: boolean
  onClose: () => void
  onStep: (step: 'profile' | 'live' | 'explore') => void
}

const STEPS = [
  {
    id: 'profile' as const,
    icon: Dumbbell,
    title: '1. Completa tu perfil',
    desc: 'Foto, objetivos y horarios — mejora tus matches.',
  },
  {
    id: 'live' as const,
    icon: Radio,
    title: '2. Enciende Live',
    desc: 'Aparece en el mapa cuando entrenas. Tu red te ve.',
  },
  {
    id: 'explore' as const,
    icon: Users,
    title: '3. Busca tu equipo',
    desc: 'Explora partners compatibles cerca de ti.',
  },
]

/** Guía post-registro — 3 pasos (Visual v2, oleada 353). */
export function PostRegisterGuide({ open, onClose, onStep }: PostRegisterGuideProps) {
  const [done, setDone] = useState<Set<string>>(new Set())

  if (!open) return null

  const markDone = (id: string) => setDone((prev) => new Set(prev).add(id))

  return (
    <div className="em-v2-activation" role="dialog" aria-label="Primeros pasos">
      <div className="em-v2-activation__card">
        <button type="button" className="em-v2-activation__close" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>
        <p className="em-v2-activation__kicker">Bienvenido</p>
        <h2 className="em-v2-activation__title">3 pasos para empezar</h2>
        <div className="em-v2-activation__steps">
          {STEPS.map((s) => {
            const Icon = s.icon
            const isDone = done.has(s.id)
            return (
              <div
                key={s.id}
                className={`em-v2-activation__step${isDone ? ' em-v2-activation__step--done' : ''}`}
              >
                <span className="em-v2-activation__step-icon" aria-hidden>
                  <Icon size={18} />
                </span>
                <div className="em-v2-activation__step-body">
                  <strong>{s.title}</strong>
                  <p>{s.desc}</p>
                </div>
                {!isDone && (
                  <button
                    type="button"
                    className="em-v2-activation__go"
                    onClick={() => {
                      markDone(s.id)
                      onStep(s.id)
                    }}
                  >
                    Ir <ArrowRight size={14} />
                  </button>
                )}
                {isDone && <span className="em-v2-activation__done-badge">Hecho</span>}
              </div>
            )
          })}
        </div>
        <button type="button" className="em-v2-activation__cta" onClick={onClose}>
          Listo, explorar la app
        </button>
      </div>
    </div>
  )
}