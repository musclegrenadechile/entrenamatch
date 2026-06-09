import { useMemo } from 'react'
import { ArrowRight, MapPin, Radio, RefreshCw, Share2, Users, X } from 'lucide-react'

export interface ActivationGuideProps {
  open: boolean
  isLive: boolean
  isDemoMode?: boolean
  hasTeam: boolean
  hasPact?: boolean
  onClose: () => void
  onPrimaryAction: () => void
  onStep: (step: 'profile' | 'live' | 'explore' | 'sync' | 'pact') => void
  onShareInvite?: () => void
}

/** Fase 101 — una sola guía, máximo 3 pasos. */
const STEPS = [
  {
    id: 'live' as const,
    icon: Radio,
    title: '1. Activa LIVE',
    desc: 'Al entrenar, enciende live. Apareces en el mapa y sumas minutos a tu zona.',
    demoDesc: 'Prueba live en modo demo — visible solo en este dispositivo.',
  },
  {
    id: 'explore' as const,
    icon: Users,
    title: '2. Arma tu equipo',
    desc: 'Explora partners compatibles e invita a alguien de tu gym al piloto.',
    demoDesc: 'Explora perfiles demo y simula un match.',
  },
  {
    id: 'sync' as const,
    icon: RefreshCw,
    title: '3. EntrenaSync en el mapa',
    desc: 'Sincroniza con un match en el mapa LIVE — tus minutos suman al derby Valparaíso vs Santiago.',
    demoDesc: 'Prueba EntrenaSync con perfiles demo.',
  },
]

export function ActivationGuide({
  open,
  isLive,
  isDemoMode = false,
  hasTeam,
  onClose,
  onPrimaryAction,
  onStep,
  onShareInvite,
}: ActivationGuideProps) {
  const done = useMemo(
    () =>
      new Set([...(isLive ? ['live'] : []), ...(hasTeam ? ['explore'] : [])]),
    [isLive, hasTeam]
  )

  if (!open) return null

  const primaryLabel = isLive ? 'Ir al mapa' : 'Activar LIVE'

  return (
    <div className="post-register-guide" role="dialog" aria-label="Primeros pasos en EntrenaMatch">
      <div className="post-register-guide__card post-register-guide__card--wide">
        <button type="button" className="post-register-guide__close" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>
        <p className="post-register-guide__kicker">Bienvenido a EntrenaMatch</p>
        <h2 className="post-register-guide__title">Tu rutina en 3 pasos</h2>
        <p className="text-[11px] text-[#9CA3AF] mb-3 pr-6">
          {isDemoMode
            ? 'Modo prueba: mismos pasos que una cuenta real, con datos locales.'
            : 'Beta cerrada Viña × Santiago. Live → Equipo → Derby regional.'}
        </p>
        <div className="post-register-guide__steps">
          {STEPS.map((s) => {
            const Icon = s.icon
            const isDone = done.has(s.id)
            const desc = isDemoMode && s.demoDesc ? s.demoDesc : s.desc
            return (
              <div
                key={s.id}
                className={`post-register-guide__step${isDone ? ' post-register-guide__step--done' : ''}`}
              >
                <Icon size={18} />
                <div>
                  <strong>{s.title}</strong>
                  <p>{desc}</p>
                </div>
                {!isDone && (
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      className="post-register-guide__go"
                      onClick={() => onStep(s.id)}
                    >
                      Ir <ArrowRight size={14} />
                    </button>
                    {s.id === 'explore' && onShareInvite && (
                      <button
                        type="button"
                        className="text-[9px] font-bold text-[#22c55e] px-2 py-1 rounded-lg border border-[#22c55e]/40 active:bg-[#22c55e]/10"
                        onClick={onShareInvite}
                      >
                        <Share2 size={10} className="inline -mt-0.5 mr-0.5" aria-hidden />
                        Invitar gym
                      </button>
                    )}
                  </div>
                )}
                {isDone && (
                  <span className="text-[10px] font-bold text-[#22c55e] shrink-0">Hecho</span>
                )}
              </div>
            )
          })}
        </div>
        <button type="button" className="post-register-guide__done" onClick={onPrimaryAction}>
          <MapPin size={16} className="inline mr-1.5 -mt-0.5" aria-hidden />
          {primaryLabel}
        </button>
      </div>
    </div>
  )
}
