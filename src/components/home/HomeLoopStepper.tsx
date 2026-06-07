export type HomeLoopStep = 'live' | 'team' | 'sync'

export interface HomeLoopStepperProps {
  activeStep: HomeLoopStep
}

const STEPS: { id: HomeLoopStep; label: string; num: number }[] = [
  { id: 'live', label: 'Live', num: 1 },
  { id: 'team', label: 'Equipo', num: 2 },
  { id: 'sync', label: 'Sync', num: 3 },
]

export function HomeLoopStepper({ activeStep }: HomeLoopStepperProps) {
  const activeIdx = STEPS.findIndex((s) => s.id === activeStep)

  return (
    <div
      className="flex items-center gap-0.5 mb-3 mt-2"
      aria-label="Tu loop: Live, Equipo, Sync"
    >
      {STEPS.map((step, idx) => {
        const isActive = step.id === activeStep
        const isDone = idx < activeIdx
        return (
          <div key={step.id} className="contents">
            <div
              className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded-full text-[9px] font-bold tracking-wide min-w-0 transition-colors ${
                isActive
                  ? 'bg-[#FF671F] text-black ring-1 ring-[#FF671F]/60'
                  : isDone
                    ? 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30'
                    : 'bg-white/5 text-[#9CA3AF] border border-white/10'
              }`}
            >
              <span className="tabular-nums shrink-0">{isDone ? '✓' : step.num}</span>
              <span className="truncate">{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <span className="text-[#6B7280] text-[9px] shrink-0 px-0.5" aria-hidden>
                →
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function resolveHomeLoopStep(opts: {
  isLive: boolean
  teamCount: number
  liveTeamCount: number
  syncCount: number
}): HomeLoopStep {
  if (!opts.isLive) return 'live'
  if (opts.teamCount === 0) return 'team'
  return 'sync'
}
