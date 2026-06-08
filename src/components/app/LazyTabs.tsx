import { lazy } from 'react'

export const LazyHomeTab = lazy(() =>
  import('../home/HomeTab').then((m) => ({ default: m.HomeTab }))
)
export const LazyExploreTab = lazy(() =>
  import('../explore/ExploreTab').then((m) => ({ default: m.ExploreTab }))
)
export const LazySquadsTab = lazy(() =>
  import('../squads/SquadsTab').then((m) => ({ default: m.SquadsTab }))
)
export const LazySessionsTab = lazy(() =>
  import('../sessions/SessionsTab').then((m) => ({ default: m.SessionsTab }))
)
export const LazyMatchesTab = lazy(() =>
  import('../matches/MatchesTab').then((m) => ({ default: m.MatchesTab }))
)
export const LazyProfileTab = lazy(() =>
  import('../profile/ProfileTab').then((m) => ({ default: m.ProfileTab }))
)

export const TAB_LOADING = (
  <div className="flex items-center justify-center p-8 text-sm text-[#9CA3AF]">Cargando…</div>
)
