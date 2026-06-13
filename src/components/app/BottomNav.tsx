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
  /** Oculta Squads — 5 tabs más legibles (Squads desde Matches/sesiones). */
  compactNav?: boolean
  onNavigate: (tab: Tab) => void
  onRedNavigate: () => void
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
      className={`bottom-nav h-[62px] grid ${colClass} z-50 text-xs pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_20px_-6px_rgb(0,0,0,0.4)]`}
      aria-label="Navegación principal"
    >
      {items.map(({ id, label, sublabel, icon: Icon, badge, liveDot, tourId, ariaLabel }) => {
        const isActive = id === 'red' ? isRedTabActive(activeTab) : activeTab === id
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
            className={`nav-item ${isActive ? 'active' : ''} relative flex-1 min-w-0`}
          >
            <Icon size={20} aria-hidden />
            <span className="mt-0.5 leading-none truncate max-w-full px-0.5">{label}</span>
            {sublabel && (
              <span className="text-[10px] text-[#6B7280] leading-none -mt-0.5">{sublabel}</span>
            )}
            {badge != null && badge > 0 && (
              <span className="absolute -top-0.5 right-1 min-w-[15px] h-[15px] px-1 text-[9px] font-extrabold rounded-full bg-[#FF4F79] text-black flex items-center justify-center ring-1 ring-black/30">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
            {id === 'map' && liveDot && (
              <span
                className="absolute top-1 right-2 w-2 h-2 bg-[#22c55e] rounded-full ring-1 ring-black/40"
                style={{ animation: 'live-pulse-green 2.2s ease-in-out infinite' }}
                aria-hidden
              />
            )}
            {id === 'explore' && liveCountForUI > 0 && (
              <span
                className="absolute -top-0.5 right-0.5 w-3 h-3 bg-[#22c55e] rounded-full animate-pulse ring-1 ring-black/30 flex items-center justify-center text-[6px] text-black font-bold"
                aria-hidden
              >
                {currentUserIsLive && currentUserLiveStreak
                  ? Math.min(9, currentUserLiveStreak)
                  : ''}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
