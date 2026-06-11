import type { Tab } from '../types'

/** Tabs that need the city-scoped profiles listener. */
export const PROFILES_REALTIME_TABS: Tab[] = ['home', 'map', 'explore', 'red', 'squads']

export function shouldRunProfilesListener(activeTab: Tab, appVisible: boolean): boolean {
  if (!appVisible) return false
  return PROFILES_REALTIME_TABS.includes(activeTab)
}

export function shouldRunLiveListeners(
  activeTab: Tab,
  showLiveMap: boolean,
  trainingNow: boolean,
  appVisible: boolean
): boolean {
  if (!appVisible) return false
  if (trainingNow || showLiveMap) return true
  return activeTab === 'home' || activeTab === 'map' || activeTab === 'explore'
}

export function shouldRunOwnProfileListener(
  activeTab: Tab,
  trainingNow: boolean,
  appVisible: boolean
): boolean {
  if (!appVisible) return false
  if (trainingNow) return true
  return activeTab === 'home' || activeTab === 'map'
}

export function shouldRunCityEngagementListeners(activeTab: Tab, appVisible: boolean): boolean {
  if (!appVisible) return false
  return activeTab === 'home'
}

export function shouldRunSquadsListener(activeTab: Tab, appVisible: boolean): boolean {
  if (!appVisible) return false
  return activeTab === 'squads'
}

export function shouldRunIncomingLikesListener(activeTab: Tab, appVisible: boolean): boolean {
  if (!appVisible) return false
  return activeTab === 'explore' || activeTab === 'red'
}

export function shouldRunBackgroundProfilePoll(
  activeTab: Tab,
  trainingNow: boolean,
  appVisible: boolean
): boolean {
  if (!appVisible || trainingNow) return false
  return activeTab === 'explore'
}
