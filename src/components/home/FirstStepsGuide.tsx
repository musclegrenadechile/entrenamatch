import { X, Radio, Map, Users } from 'lucide-react'

const STORAGE_KEY = 'entrenamatch_first_steps_dismissed'

export function isFirstStepsDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function dismissFirstSteps(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {}
}

export interface FirstStepsGuideProps {
  isLive: boolean
  onToggleLive: () => void
  onOpenMap: () => void
  onOpenExplore: () => void
  onDismiss: () => void
}

export function FirstStepsGuide({
  isLive,
  onToggleLive,
  onOpenMap,
  onOpenExplore,
  onDismiss,
}: FirstStepsGuideProps) {
  const steps = [
    {
      id: 'live',
      icon: Radio,
      title: '1. Activa LIVE',
      desc: 'Cuando empieces a entrenar, enciende live. Cuenta para tu semana y te ven en el mapa.',
      done: isLive,
      action: isLive ? undefined : onToggleLive,
      actionLabel: 'Activar live',
    },
    {
      id: 'map',
      icon: Map,
      title: '2. Abre el mapa',
      desc: 'GymPulse muestra quién entrena cerca — únete o inicia un sync.',
      done: false,
      action: onOpenMap,
      actionLabel: 'Ver mapa',
    },
    {
      id: 'team',
      icon: Users,
      title: '3. Conecta con alguien',
      desc: 'Explora perfiles, haz match y entrena en sync con tu equipo.',
      done: false,
      action: onOpenExplore,
      actionLabel: 'Explorar',
    },
  ]

  return (
    <div className="rounded-3xl border border-[#FF671F]/35 bg-gradient-to-br from-[#FF671F]/10 to-[#141418] p-4 relative">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-full text-[#9CA3AF] hover:text-white hover:bg-white/10"
        aria-label="Cerrar guía"
      >
        <X size={16} />
      </button>
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#FF671F] font-bold mb-1">
        Primeros 3 pasos
      </p>
      <p className="text-sm font-semibold text-white mb-3 pr-6">
        Así se siente EntrenaMatch en 2 minutos
      </p>
      <div className="space-y-2.5">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <div
              key={step.id}
              className={`flex gap-3 items-start rounded-2xl p-2.5 ${
                step.done ? 'bg-[#22c55e]/10 border border-[#22c55e]/30' : 'bg-black/20'
              }`}
            >
              <div
                className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                  step.done ? 'bg-[#22c55e] text-black' : 'bg-[#FF671F]/20 text-[#FF671F]'
                }`}
              >
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-white">{step.title}</div>
                <p className="text-[10px] text-[#9CA3AF] leading-snug mt-0.5">{step.desc}</p>
                {step.action && !step.done && (
                  <button
                    type="button"
                    onClick={step.action}
                    className="mt-2 text-[10px] font-bold text-[#FF671F] active:opacity-70"
                  >
                    {step.actionLabel} →
                  </button>
                )}
                {step.done && (
                  <span className="mt-1 inline-block text-[10px] font-bold text-[#22c55e]">
                    ✓ Hecho
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
