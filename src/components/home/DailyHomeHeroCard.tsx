import { Flame, Target, Dumbbell, Radio, MapPin } from 'lucide-react'
import type { WeeklyPactProgress } from '../../services/weeklyPact'
import type { Workout } from '../../types'
import { resolveHomeHero } from '../../utils/homeHero'

export interface DailyHomeHeroCardProps {
  isLive: boolean
  weeklyPactProgress: WeeklyPactProgress
  entrenoRecentWorkouts?: Workout[]
  weekTrainedCount: number
  onOpenMap?: () => void
  onOpenEntrenoLog?: () => void
  onRepeatYesterday?: () => void
  onOpenPact?: () => void
}

const ACTION_ICON = {
  live: Radio,
  log: Dumbbell,
  pact: Target,
  repeat: Flame,
  map: MapPin,
} as const

export function DailyHomeHeroCard({
  isLive,
  weeklyPactProgress,
  entrenoRecentWorkouts = [],
  weekTrainedCount,
  onOpenMap,
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
    if (hero.action === 'map') onOpenMap?.()
    else if (hero.action === 'pact') onOpenPact?.()
    else if (hero.action === 'repeat') onRepeatYesterday?.()
    else onOpenEntrenoLog?.()
  }

  return (
    <section className="em-v2-hero-card" aria-label="Reto del día">
      <div className="flex items-start gap-3">
        <div className="em-v2-hero-card__icon">
          <Icon className="w-5 h-5 text-[#FF671F]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="em-v2-hero-card__kicker">Reto del día</p>
          <p className="em-v2-hero-card__title">{hero.title}</p>
          <p className="em-v2-hero-card__sub">{hero.subtitle}</p>
          {hero.progressPct != null && weeklyPactProgress.pledged && (
            <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#22c55e] rounded-full transition-all"
                style={{ width: `${Math.min(100, hero.progressPct)}%` }}
              />
            </div>
          )}
          <button type="button" onClick={handleCta} className="em-v2-hero-card__cta">
            {hero.cta}
          </button>
        </div>
      </div>
    </section>
  )
}
