import { lazy, type ComponentType } from 'react'
import { TabLoadingShell } from './TabLoadingShell'
import { isStaleChunkError, reloadForNewBuild } from '../../utils/chunkReload'

function lazyTab<T extends Record<string, ComponentType<unknown>>>(
  importer: () => Promise<T>,
  exportName: keyof T
) {
  return lazy(async () => {
    try {
      const mod = await importer()
      const component = mod?.[exportName]
      if (!component) {
        if (reloadForNewBuild()) return new Promise(() => {})
        throw new Error(`Lazy tab export missing: ${String(exportName)}`)
      }
      return { default: component }
    } catch (err) {
      if (isStaleChunkError(err)) reloadForNewBuild()
      throw err
    }
  })
}

export const LazyHomeTab = lazyTab(() => import('../home/HomeTab'), 'HomeTab')
export const LazyExploreTab = lazyTab(() => import('../explore/ExploreTab'), 'ExploreTab')
export const LazySquadsTab = lazyTab(() => import('../squads/SquadsTab'), 'SquadsTab')
export const LazySessionsTab = lazyTab(() => import('../sessions/SessionsTab'), 'SessionsTab')
export const LazyMatchesTab = lazyTab(() => import('../matches/MatchesTab'), 'MatchesTab')
export const LazyProfileTab = lazyTab(() => import('../profile/ProfileTab'), 'ProfileTab')
export const LazyExploreLivePanel = lazyTab(
  () => import('../explore/ExploreLivePanel'),
  'ExploreLivePanel'
)

export const TAB_LOADING = <TabLoadingShell />
