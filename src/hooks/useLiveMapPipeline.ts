/**
 * GymPulse live map pipeline (fases 121 + 126).
 *
 * Source-of-truth order for cross-user visibility (fase 126 / oleada 4):
 * 1. livePresence/{uid} — PRIMARY when listener is healthy (no duplicate pins)
 * 2. profiles where trainingNow==true — fallback ONLY if livePresence listener errors
 * 3. Optimistic self entry while toggle write is in flight
 *
 * profiles.trainingNow remains for deck/feed filters; map pins use livePresence when healthy.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from 'react'
import type { Firestore } from 'firebase/firestore'
import type { CurrentUser, Profile, Tab } from '../types'
import { getDistanceKm } from '../utils'
import {
  enrichLiveUser as buildEnrichedLiveUser,
  isActiveLiveUser,
  isUserLiveInSnapshot,
  mergeLiveUsersById,
  normalizeTrainingSince,
  profileDocToLiveUser,
} from '../utils/gymPulseLive'
import { attachLivePresenceListener } from '../services/livePresence'
import { attachLiveUsersListener, patchRealProfilesWithLiveSnapshot } from '../services/liveUsers'
import { resolveLiveMapMerge } from '../utils/liveMapSources'
import { liveUsersSnapshotSignature } from '../utils/liveMapSnapshot'
import { toast } from 'sonner'

export interface UseLiveMapPipelineOptions {
  isDemoMode: boolean
  db: Firestore | null
  isFirebaseConfigured: boolean
  firebaseUserUid: string | null | undefined
  effectiveUserId: string
  currentUser: CurrentUser | null
  userLocation: { lat: number; lng: number } | null
  blockedUsers: string[]
  syncBonds: Record<string, { totalMin?: number; sessions?: number; avgRating?: number; bondLevel?: number }>
  isDeveloper: boolean
  showLiveMap: boolean
  activeTab: Tab
  showPartners: boolean
  partnerLocationsLength: number
  mapForceTick: number
  setMapForceTick: Dispatch<SetStateAction<number>>
  realProfiles: Profile[]
  setRealProfiles: Dispatch<SetStateAction<Profile[]>>
  SEED_PROFILES: Profile[]
  saveUser: (user: CurrentUser) => void
  gymPulseMapRef: RefObject<{ invalidateSize?: () => void } | null>
  latestRealProfilesRef: RefObject<Profile[]>
  currentUidRef: RefObject<string | null>
  blockedUsersRef: RefObject<string[]>
  liveUsersActiveRef: RefObject<Profile[]>
  isTogglingLiveRef: RefObject<boolean>
  pendingLiveWriteRef: RefObject<{ trainingNow: boolean; at: number } | null>
  currentUserRef: RefObject<CurrentUser | null>
}

export function useLiveMapPipeline(opts: UseLiveMapPipelineOptions) {
  const {
    isDemoMode,
    db,
    isFirebaseConfigured,
    firebaseUserUid,
    effectiveUserId,
    currentUser,
    userLocation,
    blockedUsers,
    syncBonds,
    isDeveloper,
    showLiveMap,
    activeTab,
    showPartners,
    partnerLocationsLength,
    mapForceTick,
    setMapForceTick,
    realProfiles,
    setRealProfiles,
    SEED_PROFILES,
    saveUser,
    gymPulseMapRef,
    latestRealProfilesRef,
    currentUidRef,
    blockedUsersRef,
    liveUsersActiveRef,
    isTogglingLiveRef,
    pendingLiveWriteRef,
    currentUserRef,
  } = opts

  const [mapNearOnly, setMapNearOnly] = useState(false)
  const [mapMyGymOnly, setMapMyGymOnly] = useState(false)
  const [selectedMapZone, setSelectedMapZone] = useState<string | null>(null)
  const [showOnlyNetwork, setShowOnlyNetwork] = useState(false)
  const [devTestLives, setDevTestLives] = useState<Profile[]>([])
  const [liveUsersFromDedicated, setLiveUsersFromDedicated] = useState<Profile[]>([])

  const liveFromPresenceRef = useRef<Profile[]>([])
  const liveFromProfilesQueryRef = useRef<Profile[]>([])
  /** When true, profiles.trainingNow query is ignored for map merge (prevents duplicate pins). */
  const presenceHealthyRef = useRef(false)
  const presenceEverConnectedRef = useRef(false)
  const liveUsersFromDedicatedRef = useRef<Profile[]>([])
  const userLocationRef = useRef(userLocation)
  const showLiveMapRef = useRef(showLiveMap)
  const activeTabRef = useRef(activeTab)
  const lastLiveSnapshotSigRef = useRef('')

  useEffect(() => {
    liveUsersFromDedicatedRef.current = liveUsersFromDedicated
  }, [liveUsersFromDedicated])
  useEffect(() => {
    userLocationRef.current = userLocation
  }, [userLocation])
  useEffect(() => {
    showLiveMapRef.current = showLiveMap
  }, [showLiveMap])
  useEffect(() => {
    activeTabRef.current = activeTab
  }, [activeTab])

  useEffect(() => {
    if (!showLiveMap) return
    setMapForceTick((t) => t + 1)
  }, [showPartners, partnerLocationsLength, showLiveMap, setMapForceTick])

  useEffect(() => {
    const mapActive = showLiveMap || activeTab === 'map'
    if (mapActive && gymPulseMapRef.current) {
      const force = () => {
        try {
          gymPulseMapRef.current?.invalidateSize?.()
        } catch {}
      }
      force()
      const t1 = setTimeout(force, 80)
      const t2 = setTimeout(force, 220)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }
    return undefined
  }, [showLiveMap, activeTab, gymPulseMapRef])

  const buildSelfLiveEntry = useCallback((): Profile | null => {
    if (!currentUser?.trainingNow) return null
    return {
      id: effectiveUserId,
      name: currentUser.name,
      age: currentUser.age,
      gender: currentUser.gender,
      city: currentUser.city,
      country: currentUser.country,
      lat: Number.isFinite(Number(currentUser.lat))
        ? Number(currentUser.lat)
        : Number.isFinite(Number(userLocation?.lat))
          ? Number(userLocation!.lat)
          : -33.02,
      lng: Number.isFinite(Number(currentUser.lng))
        ? Number(currentUser.lng)
        : Number.isFinite(Number(userLocation?.lng))
          ? Number(userLocation!.lng)
          : -71.55,
      bio: currentUser.bio,
      photos: currentUser.photos,
      trainingTypes: currentUser.trainingTypes,
      goals: currentUser.goals,
      level: currentUser.level,
      availability: currentUser.availability || [],
      trainingNow: true,
      trainingNowSince: normalizeTrainingSince(currentUser.trainingNowSince) || Date.now(),
      liveStreak: currentUser.liveStreak,
      joinedLiveStreak: currentUser.joinedLiveStreak,
      liveJoins: currentUser.liveJoins,
      trainingSyncWith: currentUser.trainingSyncWith,
      retentionLevel: (currentUser as Profile & { retentionLevel?: number }).retentionLevel || 1,
      _isSelf: true,
    } as Profile
  }, [currentUser, effectiveUserId, userLocation])

  const enrichLiveUser = useCallback(
    (p: Profile, now: number, bonds: typeof syncBonds) => {
      return buildEnrichedLiveUser(p, now, {
        userLocation,
        syncBonds: bonds,
        getDistanceKm,
      })
    },
    [userLocation]
  )

  const publishLiveSnapshot = useCallback(
    (presence: Profile[], profilesQuery: Profile[]) => {
      liveFromPresenceRef.current = presence
      liveFromProfilesQueryRef.current = profilesQuery
      const { mode, profilesForMerge, merged } = resolveLiveMapMerge({
        presenceHealthy: presenceHealthyRef.current,
        presenceUsers: presence,
        profilesQueryUsers: profilesQuery,
      })
      if (import.meta.env.DEV && mode !== 'presence' && presenceHealthyRef.current) {
        console.debug('[LiveMap] merge mode:', mode)
      }

      const sig = liveUsersSnapshotSignature(merged)
      if (sig === lastLiveSnapshotSigRef.current) return
      lastLiveSnapshotSigRef.current = sig

      liveUsersFromDedicatedRef.current = merged
      setLiveUsersFromDedicated(merged)
      if (showLiveMapRef.current || activeTabRef.current === 'map') {
        setMapForceTick((t) => t + 1)
      }
      setRealProfiles((prev) => {
        const next = patchRealProfilesWithLiveSnapshot(prev, merged, {
          selfUid: currentUidRef.current,
        })
        if (next === prev) return prev
        latestRealProfilesRef.current = next
        return next
      })
      void profilesForMerge
    },
    [setRealProfiles, latestRealProfilesRef, currentUidRef, setMapForceTick]
  )

  useEffect(() => {
    if (isDemoMode || !db || !isFirebaseConfigured) {
      liveFromPresenceRef.current = []
      liveFromProfilesQueryRef.current = []
      lastLiveSnapshotSigRef.current = ''
      setLiveUsersFromDedicated([])
      return undefined
    }

    const blocked = () => blockedUsersRef.current
    const onPresenceErr = () => {
      presenceHealthyRef.current = false
      const fallback = mergeLiveUsersById([
        liveFromPresenceRef.current,
        (latestRealProfilesRef.current || [])
          .filter((p) => p?.trainingNow === true)
          .map((p) => profileDocToLiveUser(p.id, p, { forceLive: true }) as Profile),
      ])
      publishLiveSnapshot(fallback, liveFromProfilesQueryRef.current)
    }

    const onProfilesErr = () => {
      if (presenceHealthyRef.current) return
      publishLiveSnapshot(liveFromPresenceRef.current, liveFromProfilesQueryRef.current)
    }

    const unsubPresence = attachLivePresenceListener(
      db,
      (users) => {
        presenceHealthyRef.current = true
        presenceEverConnectedRef.current = true
        publishLiveSnapshot(users as Profile[], liveFromProfilesQueryRef.current)
      },
      { getBlockedIds: blocked, onError: onPresenceErr }
    )

    const unsubProfiles = attachLiveUsersListener(
      db,
      (users) => {
        // Always keep profiles query for GymSound enrichment on livePresence rows.
        publishLiveSnapshot(liveFromPresenceRef.current, users as Profile[])
      },
      { getBlockedIds: blocked, onError: onProfilesErr }
    )

    return () => {
      unsubPresence()
      unsubProfiles()
    }
  }, [
    isDemoMode,
    db,
    isFirebaseConfigured,
    firebaseUserUid,
    publishLiveSnapshot,
    blockedUsersRef,
    latestRealProfilesRef,
  ])

  useEffect(() => {
    if (!isDemoMode) return
    const now = Date.now()
    const demoLives: Profile[] = []
    const self = buildSelfLiveEntry()
    if (self) demoLives.push(self)
    SEED_PROFILES.slice(0, 5).forEach((p, i) => {
      if (p.id === effectiveUserId) return
      demoLives.push({
        ...p,
        trainingNow: true,
        trainingNowSince: now - (i + 1) * 12 * 60000,
      })
    })
    setLiveUsersFromDedicated(demoLives)
  }, [isDemoMode, buildSelfLiveEntry, effectiveUserId, SEED_PROFILES])

  useEffect(() => {
    if (isDemoMode || !db || !isFirebaseConfigured || !firebaseUserUid) return undefined
    let unsubOwn: (() => void) | null = null
    ;(async () => {
      try {
        const { doc, onSnapshot } = await import('firebase/firestore')
        const ownRef = doc(db, 'profiles', firebaseUserUid)
        unsubOwn = onSnapshot(ownRef, (snap) => {
          if (!snap.exists()) return
          const data = snap.data() as Record<string, unknown>
          if (!data) return
          if (isTogglingLiveRef.current) return

          const newTrainingNow = !!data.trainingNow
          const newSince = normalizeTrainingSince(data.trainingNowSince)
          const pending = pendingLiveWriteRef.current
          const base = currentUserRef.current

          if (pending && newTrainingNow !== pending.trainingNow) return

          if (
            base &&
            (base.trainingNow !== newTrainingNow ||
              normalizeTrainingSince(base.trainingNowSince) !== newSince)
          ) {
            const merged = {
              ...base,
              trainingNow: newTrainingNow,
              trainingNowSince: newSince,
              liveStreak: data.liveStreak != null ? (data.liveStreak as number) : base.liveStreak,
            }
            saveUser(merged as CurrentUser)
            setMapForceTick((t) => t + 1)
          }
        })
      } catch (e) {
        console.warn('own profile listener failed', e)
      }
    })()
    return () => {
      if (unsubOwn) unsubOwn()
    }
  }, [
    isDemoMode,
    db,
    isFirebaseConfigured,
    firebaseUserUid,
    currentUser?.id,
    saveUser,
    isTogglingLiveRef,
    pendingLiveWriteRef,
    currentUserRef,
  ])

  const liveUsersMerged = useMemo(() => {
    const selfEntry = buildSelfLiveEntry()
    const fromRealFallback =
      !presenceEverConnectedRef.current && liveUsersFromDedicated.length === 0
        ? (realProfiles || []).filter((p) => p?.trainingNow === true)
        : []
    return mergeLiveUsersById([
      liveUsersFromDedicated || [],
      fromRealFallback,
      selfEntry ? [selfEntry] : [],
    ])
  }, [liveUsersFromDedicated, realProfiles, buildSelfLiveEntry])

  const liveUsersActive = useMemo(() => {
    const now = Date.now()
    let active = liveUsersMerged
      .filter((p) => isActiveLiveUser(p, now))
      .filter((p) => !blockedUsers.includes(p.id))
      .map((p) => enrichLiveUser(p, now, syncBonds))

    if (isDemoMode && active.filter((p) => p.id !== effectiveUserId && p.id !== 'me').length === 0) {
      active = [
        ...active.filter((p) => p.id === effectiveUserId || p.id === 'me'),
        ...SEED_PROFILES.slice(0, 5)
          .filter((p) => p.id !== effectiveUserId)
          .map((p, i) =>
            enrichLiveUser(
              {
                ...p,
                trainingNow: true,
                trainingNowSince: now - (i + 1) * 12 * 60000,
                joinCount: i + 1,
              } as Profile,
              now,
              syncBonds
            )
          ),
      ]
    }
    return active.sort((a, b) => ((a as Profile & { distance?: number }).distance || 999) - ((b as Profile & { distance?: number }).distance || 999))
  }, [liveUsersMerged, blockedUsers, isDemoMode, effectiveUserId, enrichLiveUser, syncBonds, SEED_PROFILES])

  const liveTrainingNow = useMemo(
    () => liveUsersActive.filter((p) => p.id !== effectiveUserId && p.id !== 'me'),
    [liveUsersActive, effectiveUserId]
  )

  const mapLiveTrainingNow = useMemo(() => {
    const all = [...liveUsersActive]
    if (isDeveloper && devTestLives.length > 0) all.push(...devTestLives)
    return all
  }, [liveUsersActive, isDeveloper, devTestLives])

  const liveCountForUI = liveUsersActive.length

  useEffect(() => {
    liveUsersActiveRef.current = liveUsersActive
  }, [liveUsersActive, liveUsersActiveRef])

  const isUserLive = useCallback(
    (userId: string): boolean => {
      if (!userId) return false
      if (
        userId === effectiveUserId ||
        userId === 'me' ||
        (firebaseUserUid && userId === firebaseUserUid)
      ) {
        return !!currentUserRef.current?.trainingNow
      }
      if (isUserLiveInSnapshot(userId, liveUsersActiveRef.current)) return true
      const fromDedicated = (liveUsersFromDedicatedRef.current || []).find((p) => p.id === userId)
      if (fromDedicated && isActiveLiveUser(fromDedicated)) return true
      const fromProfiles = (latestRealProfilesRef.current || []).find((p) => p.id === userId)
      return fromProfiles?.trainingNow === true
    },
    [effectiveUserId, firebaseUserUid, liveUsersActiveRef, latestRealProfilesRef, currentUserRef]
  )

  const zoneLiveCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    liveUsersActive.forEach((u) => {
      if (u.city) counts[u.city] = (counts[u.city] || 0) + 1
    })
    return counts
  }, [liveUsersActive])

  // Re-derive motion-idle pins as timestamps age (fase B).
  useEffect(() => {
    if (!showLiveMap || activeTab !== 'map') return
    const id = setInterval(() => setMapForceTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [showLiveMap, activeTab, setMapForceTick])

  const spawnDevTestLives = useCallback(
    (count = 3) => {
      if (!isDeveloper || !userLocation) {
        toast.error('Necesitas GPS y modo dev')
        return
      }
      const fakes: Profile[] = []
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
        const distKm = 0.3 + Math.random() * 2.2
        const dLat = (distKm / 111) * Math.cos(angle)
        const dLng = (distKm / (111 * Math.cos((userLocation.lat * Math.PI) / 180))) * Math.sin(angle)
        fakes.push({
          id: 'devtest-' + Date.now() + '-' + i,
          name: `TestDev${i + 1}`,
          lat: userLocation.lat + dLat,
          lng: userLocation.lng + dLng,
          trainingNow: true,
          trainingNowSince: Date.now() - (i + 1) * 4 * 60 * 1000,
          trainingTypes: ['Pesas/Gym', 'Running'],
          level: i % 2 === 0 ? 'Avanzado' : 'Intermedio',
          _devTest: true,
          distance: distKm,
        } as Profile)
      }
      setDevTestLives((prev) => [...prev.filter((p) => !(p as Profile & { _devTest?: boolean })._devTest), ...fakes])
      setMapForceTick((t) => t + 1)
      toast.success(`+${count} test lives cerca de ti`)
      setTimeout(() => {
        setDevTestLives((prev) => prev.filter((p) => !(p as Profile & { _devTest?: boolean })._devTest))
        setMapForceTick((t) => t + 1)
      }, 5 * 60 * 1000)
    },
    [isDeveloper, userLocation]
  )

  const clearDevTestLives = useCallback(() => {
    setDevTestLives([])
    setMapForceTick((t) => t + 1)
    toast('Vidas de test limpiadas')
  }, [])

  return {
    mapNearOnly,
    setMapNearOnly,
    mapMyGymOnly,
    setMapMyGymOnly,
    selectedMapZone,
    setSelectedMapZone,
    showOnlyNetwork,
    setShowOnlyNetwork,
    mapForceTick,
    setMapForceTick,
    devTestLives,
    setDevTestLives,
    liveUsersFromDedicated,
    liveFromPresenceRef,
    liveFromProfilesQueryRef,
    publishLiveSnapshot,
    buildSelfLiveEntry,
    enrichLiveUser,
    liveUsersMerged,
    liveUsersActive,
    liveTrainingNow,
    mapLiveTrainingNow,
    liveCountForUI,
    isUserLive,
    zoneLiveCounts,
    spawnDevTestLives,
    clearDevTestLives,
  }
}
