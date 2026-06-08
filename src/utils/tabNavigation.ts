import type { Tab } from '../types'

export type RedSubTab = 'matches' | 'messages'

export function normalizeTabNavigation(
  tab: Tab
): { tab: Tab; redSubTab?: RedSubTab } {
  if (tab === 'messages') return { tab: 'red', redSubTab: 'messages' }
  if (tab === 'matches') return { tab: 'red', redSubTab: 'matches' }
  if (tab === 'map') return { tab: 'map' }
  return { tab }
}

export function isRedTabActive(activeTab: Tab): boolean {
  return activeTab === 'red' || activeTab === 'matches' || activeTab === 'messages'
}

export function resolveRedSubTab(activeTab: Tab, redSubTab: RedSubTab): RedSubTab {
  if (activeTab === 'messages') return 'messages'
  if (activeTab === 'matches') return 'matches'
  return redSubTab
}
