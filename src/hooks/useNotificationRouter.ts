import { useCallback, useEffect, useRef, type RefObject } from 'react'
import type { Profile } from '../types'
import {
  resolveNotificationTarget,
  type NotificationNavTarget,
} from '../utils/notificationNavigation'
import { normalizeTabNavigation } from '../utils/tabNavigation'

export type NotificationRouterActions = {
  setShowNotifications: (open: boolean) => void
  setActiveTab: (tab: ReturnType<typeof normalizeTabNavigation>['tab']) => void
  setRedSubTab: (sub: 'matches' | 'messages') => void
  navigateTab: (tab: string) => void
  setShowDailyPulseBanner: (show: boolean) => void
  setShowLiveModal: (show: boolean) => void
  setActiveChat: (id: string | null) => void
  setChatUnreads: (fn: (prev: Record<string, number>) => Record<string, number>) => void
  setShowGroupChatModalFor: (id: string | null) => void
  setSessionUnreads: (fn: (prev: Record<string, number>) => Record<string, number>) => void
  setSelectedSquad: (id: string | null) => void
  setShowSyncArena: (show: boolean) => void
  setTrainerCoachInitialTab: (tab: 'explore' | 'now' | 'sessions' | 'trainer' | undefined) => void
  setShowTrainerCoach: (show: boolean) => void
  setMarketplaceScreenMode: (mode: 'shop' | 'orders') => void
  setShowMarketplace: (show: boolean) => void
  setShowFullProfile: (profile: Profile) => void
}

export type UseNotificationRouterOptions = {
  realProfiles: Profile[]
  seedProfiles: Profile[]
  knownSessionIds: Set<string>
  startSyncRef: RefObject<((partnerId: string, partnerName: string) => void) | null>
  actions: NotificationRouterActions
  /** Shared ref for deep-link effects registered before the hook runs. */
  navigationRef?: RefObject<
    ((target: NotificationNavTarget, partnerNameHint?: string) => void) | null
  >
}

/**
 * Fase 351 — central routing for push, in-app toasts, and notification panel deep links.
 */
export function useNotificationRouter({
  realProfiles,
  seedProfiles,
  knownSessionIds,
  startSyncRef,
  actions,
  navigationRef: externalNavigationRef,
}: UseNotificationRouterOptions) {
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  const internalNavigationRef = useRef<
    ((target: NotificationNavTarget, partnerNameHint?: string) => void) | null
  >(null)
  const applyNotificationNavigationRef = externalNavigationRef ?? internalNavigationRef

  const applyNotificationNavigation = useCallback(
    (target: NotificationNavTarget, partnerNameHint?: string) => {
      const a = actionsRef.current
      a.setShowNotifications(false)
      const { tab: resolved, redSubTab: sub } = normalizeTabNavigation(target.tab)
      a.setActiveTab(resolved)
      if (sub) a.setRedSubTab(sub)
      if (target.showDailyPulse) a.setShowDailyPulseBanner(true)
      if (target.showLiveMap) a.navigateTab('map')
      if (target.showLiveModal) a.setShowLiveModal(true)
      if (target.activeChat) {
        a.setRedSubTab('messages')
        a.setActiveChat(target.activeChat)
        a.setChatUnreads((prev) => {
          const c = { ...prev }
          c[target.activeChat!] = 0
          return c
        })
      }
      if (target.groupChatId) {
        a.setShowGroupChatModalFor(target.groupChatId)
        a.setSessionUnreads((prev) => {
          const c = { ...prev }
          c[target.groupChatId!] = 0
          return c
        })
      }
      if (target.selectedSquad) {
        a.setSelectedSquad(target.selectedSquad)
      }
      if (target.showSyncArena) {
        a.setShowSyncArena(true)
      }
      if (target.openTrainerCoach) {
        a.setTrainerCoachInitialTab(target.trainerCoachTab)
        a.setShowTrainerCoach(true)
      }
      if (target.openMarketplace) {
        a.setMarketplaceScreenMode(target.marketplaceOrdersTab ? 'orders' : 'shop')
        a.setShowMarketplace(true)
      }
      if (target.startSyncWith) {
        const { partnerId, partnerName } = target.startSyncWith
        const name =
          partnerName ||
          partnerNameHint ||
          realProfiles.find((p) => p.id === partnerId)?.name ||
          seedProfiles.find((p) => p.id === partnerId)?.name ||
          'Compañero'
        setTimeout(() => startSyncRef.current?.(partnerId, name), 80)
      }
      if (target.openProfileId) {
        const prof =
          realProfiles.find((p) => p.id === target.openProfileId) ||
          seedProfiles.find((p) => p.id === target.openProfileId)
        if (prof) a.setShowFullProfile(prof)
      }
    },
    [realProfiles, seedProfiles, startSyncRef]
  )

  useEffect(() => {
    applyNotificationNavigationRef.current = applyNotificationNavigation
  }, [applyNotificationNavigation, applyNotificationNavigationRef])

  const openMessageNotificationTarget = useCallback(
    (chatId: string, senderName?: string, isGroupHint?: boolean) => {
      const a = actionsRef.current
      const target = resolveNotificationTarget(
        { type: isGroupHint ? 'group_message' : 'message', relatedId: chatId },
        { sessionIds: knownSessionIds }
      )
      if (target) {
        applyNotificationNavigation(target, senderName)
        return
      }
      if (isGroupHint) {
        a.setActiveTab('sesiones')
        a.setShowGroupChatModalFor(chatId)
        a.setSessionUnreads((prev) => {
          const c = { ...prev }
          c[chatId] = 0
          return c
        })
      } else {
        a.navigateTab('red')
        a.setRedSubTab('messages')
        a.setActiveChat(chatId)
        a.setChatUnreads((prev) => {
          const c = { ...prev }
          c[chatId] = 0
          return c
        })
      }
    },
    [knownSessionIds, applyNotificationNavigation]
  )

  return {
    applyNotificationNavigation,
    applyNotificationNavigationRef,
    openMessageNotificationTarget,
  }
}
