import type { Tab } from '../types'

const VALID_TABS: Tab[] = [
  'home',
  'map',
  'explore',
  'red',
  'squads',
  'sesiones',
  'profile',
  'matches',
  'messages',
]

/** Parse ?tab= from URL (fase 176). Legacy matches/messages → red. */
export function parseTabFromUrl(search = window.location.search): Tab | null {
  try {
    const tab = new URLSearchParams(search).get('tab')
    if (!tab || !VALID_TABS.includes(tab as Tab)) return null
    if (tab === 'messages' || tab === 'matches') return 'red'
    return tab as Tab
  } catch {
    return null
  }
}

/** Keep shareable deep links in sync without full page reload. */
export function syncTabToUrl(tab: Tab, opts?: { map?: boolean }) {
  try {
    const url = new URL(window.location.href)
    const navTab = tab === 'messages' || tab === 'matches' ? 'red' : tab
    url.searchParams.set('tab', navTab)
    if (opts?.map || tab === 'map') {
      url.searchParams.set('map', '1')
    } else {
      url.searchParams.delete('map')
    }
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  } catch {
    /* ignore */
  }
}

export { VALID_TABS }
