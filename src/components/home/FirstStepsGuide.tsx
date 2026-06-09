import { X, Radio, Users, RefreshCw, Target } from 'lucide-react'

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
  hasTeam: boolean
  hasPact?: boolean
  onToggleLive: () => void
  onOpenMatches?: () => void
  onOpenExplore: () => void
  onStartSync: () => void
  onDismiss: () => void
}

export function FirstStepsGuide({
  isLive,
  hasTeam,
  hasPact = false,
  onToggleLive,
  onOpenMatches,
  onOpenExplore,
  onStartSync,
  onDismiss,
}: FirstStepsGuideProps) {
  const steps = [
    {
      id: 'live',
      icon: Radio,
      title: '1. Live',
      desc: 'Enciende live cuando entrenes. Apareces en el mapa y cuenta para tu semana.',
      done: isLive,
      action: isLive ? undefined : onToggleLive,
      actionLabel: 'Activar live',
    },
    {
      id: 'team',
      icon: Users,
      title: '2. Equipo',
      desc: 'Matches y socios con los que ya entrenaste — tu red fitness.',
      done: hasTeam,
      action: hasTeam ? onOpenMatches : onOpenExplore,
      actionLabel: hasTeam ? 'Ver mi equipo' : 'Buscar partner',
    },
    {
      id: 'sync',
      icon: RefreshCw,
      title: '3. Sync',
      desc: 'EntrenaSync en tiempo real con alguien de tu equipo o del mapa.',
      done: false,
      action: onStartSync,
      actionLabel: 'Iniciar sync',
    },
    {
      id: 'pact',
      icon: Target,
      title: '4. Semana',
      desc: 'Define tu meta semanal de live + sync y cierra la semana con tu equipo.',
      done: hasPact,
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
        Loop Live → Equipo → Sync → Semana
      </p>
      <p className="text-sm font-semibold text-white mb-3 pr-6">
        Tu rutina en EntrenaMatch
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
