import type { LucideIcon } from 'lucide-react'
import { Dumbbell, Heart, MapPin, Sparkles, User, Users } from 'lucide-react'
import type { Tab } from '../../types'
import { BRAND_COPY } from '../../constants/brandCopy'
import { isRedTabActive } from '../../utils/tabNavigation'

export type BottomNavItem = {
  id: Tab
  label: string
  sublabel?: string
  icon: LucideIcon
  badge?: number
  liveDot?: boolean
  tourId?: string
  ariaLabel?: string
}

type BottomNavProps = {
  activeTab: Tab
  liveCountForUI: number
  currentUserLiveStreak?: number
  currentUserIsLive?: boolean
  chatUnreads: number
  openSessionsCount: number
  compactNav?: boolean
  onNavigate: (tab: Tab) => void
  onRedNavigate: () => void
}

const TAB_MODIFIER: Partial<Record<Tab, string>> = {
  home: 'em-v2-bottom-nav__item--home',
  map: 'em-v2-bottom-nav__item--map',
  explore: 'em-v2-bottom-nav__item--explore',
  red: 'em-v2-bottom-nav__item--red',
  profile: 'em-v2-bottom-nav__item--profile',
}

export function BottomNav({
  activeTab,
  liveCountForUI,
  currentUserLiveStreak,
  currentUserIsLive,
  chatUnreads,
  openSessionsCount,
  compactNav = true,
  onNavigate,
  onRedNavigate,
}: BottomNavProps) {
  const allItems: BottomNavItem[] = [
    { id: 'home', label: 'Hoy', icon: Sparkles, tourId: 'bottom-nav-home', ariaLabel: 'Hoy — mi día y muro' },
    {
      id: 'map',
      label: BRAND_COPY.liveMapLabel,
      icon: MapPin,
      liveDot: liveCountForUI > 0,
      tourId: 'bottom-nav-map',
      ariaLabel: 'Mapa en vivo — quién entrena cerca ahora',
    },
    {
      id: 'explore',
      label: 'Explorar',
      icon: Dumbbell,
      tourId: 'bottom-nav-explore',
      ariaLabel: 'Explorar perfiles y swipe',
    },
    {
      id: 'red',
      label: 'Matches',
      sublabel: 'y chat',
      icon: Heart,
      badge: chatUnreads,
      tourId: 'bottom-nav-red',
      ariaLabel: 'Matches y chat',
    },
    {
      id: 'squads',
      label: 'Squads',
      icon: Users,
      badge: openSessionsCount > 0 ? openSessionsCount : undefined,
      ariaLabel:
        openSessionsCount > 0
          ? `Squads, ${openSessionsCount} sesiones abiertas`
          : 'Squads y sesiones',
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      tourId: 'bottom-nav-profile',
      ariaLabel: 'Perfil y live toggle',
    },
  ]

  const items = compactNav ? allItems.filter((i) => i.id !== 'squads') : allItems
  const colClass = items.length === 5 ? 'grid-cols-5' : 'grid-cols-6'

  return (
    <nav
      className={`em-v2-bottom-nav bottom-nav h-[62px] grid ${colClass} z-50 text-xs pb-[env(safe-area-inset-bottom)]`}
      aria-label="Navegación principal"
    >
      {items.map(({ id, label, sublabel, icon: Icon, badge, liveDot, tourId, ariaLabel }) => {
        const isActive = id === 'red' ? isRedTabActive(activeTab) : activeTab === id
        const modifier = TAB_MODIFIER[id] || ''
        return (
          <button
            key={id}
            type="button"
            data-tour={tourId}
            aria-label={ariaLabel || label}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => {
              if (id === 'red') onRedNavigate()
              else onNavigate(id)
            }}
            className={`em-v2-bottom-nav__item nav-item${isActive ? ' em-v2-bottom-nav__item--active active' : ''}${modifier ? ` ${modifier}` : ''} relative flex-1 min-w-0`}
          >
            {isActive && <span className="em-v2-bottom-nav__indicator" aria-hidden />}
            <span className="em-v2-bottom-nav__icon-wrap">
              <Icon size={20} aria-hidden className="em-v2-bottom-nav__icon" />
              {badge != null && badge > 0 && (
                <span className="em-v2-bottom-nav__badge">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
              {id === 'map' && liveDot && (
                <span className="em-v2-bottom-nav__live-dot em-v2-bottom-nav__live-dot--map" aria-hidden />
              )}
              {id === 'explore' && liveCountForUI > 0 && (
                <span className="em-v2-bottom-nav__live-dot em-v2-bottom-nav__live-dot--explore" aria-hidden>
                  {currentUserIsLive && currentUserLiveStreak
                    ? Math.min(9, currentUserLiveStreak)
                    : ''}
                </span>
              )}
            </span>
            <span className="em-v2-bottom-nav__label">{label}</span>
            {sublabel && (
              <span className="em-v2-bottom-nav__sublabel">{sublabel}</span>
            )}
          </button>
        )
      })}
    </nav>
  )
}