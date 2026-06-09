import { Flame, Target, Dumbbell, Radio } from 'lucide-react'
import type { WeeklyPactProgress } from '../../services/weeklyPact'
import type { Workout } from '../../types'
import { resolveHomeHero } from '../../utils/homeHero'

export interface DailyHomeHeroCardProps {
  isLive: boolean
  weeklyPactProgress: WeeklyPactProgress
  entrenoRecentWorkouts?: Workout[]
  weekTrainedCount: number
  onToggleLive: () => void
  onOpenEntrenoLog?: () => void
  onRepeatYesterday?: () => void
  onOpenPact?: () => void
}

const ACTION_ICON = {
  live: Radio,
  log: Dumbbell,
  pact: Target,
  repeat: Flame,
} as const

export function DailyHomeHeroCard({
  isLive,
  weeklyPactProgress,
  entrenoRecentWorkouts = [],
  weekTrainedCount,
  onToggleLive,
  onOpenEntrenoLog,
  onRepeatYesterday,
  onOpenPact,
}: DailyHomeHeroCardProps) {
  const hero = resolveHomeHero({
    isLive,
    weeklyPactProgress,
    entrenoRecentWorkouts,
    weekTrainedCount,
  })
  const Icon = ACTION_ICON[hero.action]

  const handleCta = () => {
    if (hero.action === 'live') onToggleLive()
    else if (hero.action === 'pact') onOpenPact?.()
    else if (hero.action === 'repeat') onRepeatYesterday?.()
    else onOpenEntrenoLog?.()
  }

  return (
    <section
      className="rounded-2xl border border-[#FF671F]/35 bg-gradient-to-br from-[#FF671F]/12 via-[#141418] to-[#0f0f12] p-4"
      aria-label="Reto del día"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FF671F]/20 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-[#FF671F]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#FF671F]">
            Reto del día
          </p>
          <p className="text-sm font-black text-white mt-0.5">{hero.title}</p>
          <p className="text-[11px] text-[#9CA3AF] mt-1 leading-snug">{hero.subtitle}</p>
          {hero.progressPct != null && weeklyPactProgress.pledged && (
            <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#22c55e] rounded-full transition-all"
                style={{ width: `${Math.min(100, hero.progressPct)}%` }}
              />
            </div>
          )}
          <button
            type="button"
            onClick={handleCta}
            className="mt-3 text-[11px] font-bold px-4 py-2 rounded-full bg-[#FF671F] text-black active:brightness-90"
          >
            {hero.cta}
          </button>
        </div>
      </div>
    </section>
  )
}
