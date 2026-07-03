import { useMemo } from 'react'
import { ArrowRight, MapPin, Radio, RefreshCw, Share2, Users, X } from 'lucide-react'
import { BRAND_COPY } from '../../constants/brandCopy'

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

const STEPS = [
  {
    id: 'live' as const,
    icon: Radio,
    title: BRAND_COPY.activation.stepLive,
    desc: BRAND_COPY.activation.stepLiveDesc,
    demoDesc: 'Prueba LIVE en modo demo — visible solo en este dispositivo.',
  },
  {
    id: 'explore' as const,
    icon: Users,
    title: BRAND_COPY.activation.stepExplore,
    desc: BRAND_COPY.activation.stepExploreDesc,
    demoDesc: 'Explora perfiles demo y simula una conexión.',
  },
  {
    id: 'sync' as const,
    icon: RefreshCw,
    title: BRAND_COPY.activation.stepSync,
    desc: BRAND_COPY.activation.stepSyncDesc,
    demoDesc: 'Prueba EntrenaSync con perfiles demo.',
  },
]

/** Oleada 352 — guía post-registro alineada a Visual v2. */
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
  const doneCount = STEPS.filter((s) => done.has(s.id)).length

  return (
    <div className="em-v2-activation" role="dialog" aria-label="Primeros pasos en EntrenaMatch">
      <div className="em-v2-activation__card">
        <button type="button" className="em-v2-activation__close" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>
        <p className="em-v2-activation__kicker">{BRAND_COPY.activation.kicker}</p>
        <h2 className="em-v2-activation__title">{BRAND_COPY.activation.title}</h2>
        <p className="em-v2-activation__sub">
          {isDemoMode ? BRAND_COPY.activation.subtitleDemo : BRAND_COPY.activation.subtitle}
        </p>
        <div className="em-v2-activation__progress" aria-hidden>
          <div
            className="em-v2-activation__progress-fill"
            style={{ width: `${Math.round((doneCount / STEPS.length) * 100)}%` }}
          />
        </div>
        <div className="em-v2-activation__steps">
          {STEPS.map((s) => {
            const Icon = s.icon
            const isDone = done.has(s.id)
            const desc = isDemoMode && s.demoDesc ? s.demoDesc : s.desc
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
                  <p>{desc}</p>
                </div>
                {!isDone && (
                  <div className="em-v2-activation__step-actions">
                    <button
                      type="button"
                      className="em-v2-activation__go"
                      onClick={() => onStep(s.id)}
                    >
                      Ir <ArrowRight size={14} />
                    </button>
                    {s.id === 'explore' && onShareInvite && (
                      <button
                        type="button"
                        className="em-v2-activation__invite"
                        onClick={onShareInvite}
                      >
                        <Share2 size={10} aria-hidden />
                        {BRAND_COPY.explore.inviteTitle}
                      </button>
                    )}
                  </div>
                )}
                {isDone && (
                  <span className="em-v2-activation__done-badge">Hecho</span>
                )}
              </div>
            )
          })}
        </div>
        <button type="button" className="em-v2-activation__cta" onClick={onPrimaryAction}>
          <MapPin size={16} aria-hidden />
          {primaryLabel}
        </button>
      </div>
    </div>
  )
}