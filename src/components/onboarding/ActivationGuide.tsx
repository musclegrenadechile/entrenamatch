import { useMemo } from 'react'
import { ArrowRight, Dumbbell, Radio, RefreshCw, Target, Users, X } from 'lucide-react'

export interface ActivationGuideProps {
  open: boolean
  isLive: boolean
  hasTeam: boolean
  hasPact?: boolean
  onClose: () => void
  onStep: (step: 'profile' | 'live' | 'explore' | 'sync' | 'pact') => void
}

const STEPS = [
  {
    id: 'profile' as const,
    icon: Dumbbell,
    title: '1. Tu perfil',
    desc: 'Foto, objetivos y horarios — mejores matches desde el inicio.',
  },
  {
    id: 'live' as const,
    icon: Radio,
    title: '2. Live',
    desc: 'Enciende live al entrenar. Apareces en GymPulse y sumas para tu semana.',
  },
  {
    id: 'explore' as const,
    icon: Users,
    title: '3. Equipo',
    desc: 'Explora partners compatibles cerca y arma tu red de gym.',
  },
  {
    id: 'sync' as const,
    icon: RefreshCw,
    title: '4. EntrenaSync',
    desc: 'Entrena en tiempo real con alguien de tu equipo o del mapa.',
  },
  {
    id: 'pact' as const,
    icon: Target,
    title: '5. Meta semanal',
    desc: 'Define live + sync esta semana y ciérrala con tu red.',
  },
]

/** Guía unificada post-registro (Fase 35) — reemplaza PostRegister + FirstSteps modal. */
export function ActivationGuide({
  open,
  isLive,
  hasTeam,
  hasPact = false,
  onClose,
  onStep,
}: ActivationGuideProps) {
  const done = useMemo(
    () =>
      new Set([
        ...(isLive ? ['live'] : []),
        ...(hasTeam ? ['explore'] : []),
        ...(hasPact ? ['pact'] : []),
      ]),
    [isLive, hasTeam, hasPact]
  )

  if (!open) return null

  return (
    <div className="post-register-guide" role="dialog" aria-label="Primeros pasos en EntrenaMatch">
      <div className="post-register-guide__card post-register-guide__card--wide">
        <button type="button" className="post-register-guide__close" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>
        <p className="post-register-guide__kicker">Bienvenido a EntrenaMatch</p>
        <h2 className="post-register-guide__title">Tu rutina en 5 pasos</h2>
        <p className="text-[11px] text-[#9CA3AF] mb-3 pr-6">
          Live → Equipo → Sync → Semana. Una sola guía para empezar fuerte.
        </p>
        <div className="post-register-guide__steps">
          {STEPS.map((s) => {
            const Icon = s.icon
            const isDone = done.has(s.id)
            return (
              <div
                key={s.id}
                className={`post-register-guide__step${isDone ? ' post-register-guide__step--done' : ''}`}
              >
                <Icon size={18} />
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.desc}</p>
                </div>
                {!isDone && (
                  <button
                    type="button"
                    className="post-register-guide__go"
                    onClick={() => onStep(s.id)}
                  >
                    Ir <ArrowRight size={14} />
                  </button>
                )}
                {isDone && (
                  <span className="text-[10px] font-bold text-[#22c55e] shrink-0">Hecho</span>
                )}
              </div>
            )
          })}
        </div>
        <button type="button" className="post-register-guide__done" onClick={onClose}>
          Empezar en EntrenaMatch
        </button>
      </div>
    </div>
  )
}
