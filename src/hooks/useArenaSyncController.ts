/**
 * EntrenaSync / Arena controller — profile mirror, session listeners, map ripples,
 * sync lifecycle, and Arena actions (extracted from App.tsx).
 */

import { useCallback, useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from 'react'
import type { Firestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'
import { Capacitor } from '@capacitor/core'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import type { CurrentUser, Profile, ProfilePost, Tab } from '../types'
import { getDistanceKm } from '../utils'
import { mergeWeekStats } from '../services/localNetwork'
import { getWeekKey } from '../utils/weekLiveTracker'
import { updateUserProfile } from '../services/auth'
import { recordPilotSyncSession } from '../services/pilotSyncMetrics'
import { recordSyncShareMetric } from '../services/syncShareMetrics'
import { getSyncShareOptOut } from '../utils/syncSharePrefs'
import {
  attachIncomingSyncListener,
  attachActiveSyncSessionListener,
  buildSyncSessionId,
  buildSyncSessionAction,
  normalizeSyncActionsForUi,
} from '../services/syncSessions'
import { countExternalWitnesses, registerSyncWitness } from '../services/syncWitness'
import { uploadArenaPhotoUrl, postPartnerSyncStory } from '../services/arenaFormPhoto'
import {
  fetchRecentWorkouts,
  saveSyncWorkoutWithPost,
  buildWorkoutPreview,
  computeWorkoutStats,
} from '../services/workouts'
import { detectWorkoutPRs, formatWorkoutPRSummary } from '../utils/workoutPR'
import { loadExercisePRs, syncExercisePRs, topExercisePRs } from '../services/exercisePRs'
import { cloneExercises } from '../utils/workoutTemplates'
import { compareSyncWorkoutLogs } from '../utils/workoutSyncCompare'
import { computeWeeklyPactProgress, isPactForCurrentWeek } from '../services/weeklyPact'
import { toLocalDateStr } from '../utils/fuelCalculator'
import { ARENA_REST_MS, parseParticipantState } from '../utils/arenaSyncState'
import {
  createEmptySyncWorkoutLog,
  appendSetToLog,
  countLoggedSets,
  syncWorkoutHasData,
  formatSetLabel,
  toParticipantSyncPayload,
  type SyncWorkoutLogState,
} from '../utils/arenaWorkoutLog'
import { triggerHaptic } from '../utils/haptics'
import type { SyncWorkoutCompare } from '../utils/workoutSyncCompare'
import { useSyncSession } from './useSyncSession'

export type SyncDuelSummary = {
  partnerId: string
  partnerName: string
  minutes: number
  vibe: number
  witnessCount: number
  setsLogged: number
  actions: any[]
  isNetworkBond: boolean
  bondLevel?: number
  partnerPhoto?: string
  elapsedSec?: number
  weeklyMetaComplete?: boolean
  weeklyMetaLine?: string
  workoutCompare?: SyncWorkoutCompare | null
}

export type SyncDuelSummaryState = SyncDuelSummary | null

export interface UseArenaSyncControllerOptions {
  syncSession: ReturnType<typeof useSyncSession>
  isDemoMode: boolean
  db: Firestore | null
  isFirebaseConfigured: boolean
  firebaseUser: { uid: string } | null | undefined
  authBooting: boolean
  effectiveUserId: string
  currentUser: CurrentUser | null
  currentUserRef: RefObject<CurrentUser | null>
  realProfiles: Profile[]
  latestRealProfilesRef: RefObject<Profile[]>
  saveUser: (user: CurrentUser) => void
  pendingLiveWriteRef: RefObject<{ trainingNow: boolean; at: number } | null>
  activeTab: Tab
  setActiveTab: Dispatch<SetStateAction<Tab>>
  navigateTab: (tab: Tab) => void
  showLiveMap: boolean
  liveTrainingNow: any[]
  isUserLive: (id: string) => boolean
  userLocation: { lat: number; lng: number } | null
  liveUsersActive: Profile[]
  storage: FirebaseStorage | null
  saveUserWithRealSyncRef: RefObject<(user: CurrentUser) => Promise<unknown>>
  createProfilePostRef: RefObject<(text: string, photo?: string | null) => Promise<unknown>>
  addNotificationRef: RefObject<(n: any) => void>
  startSyncRef: RefObject<((partnerId: string, partnerName: string) => any) | null>
  setSyncBlockerPartnerName: Dispatch<SetStateAction<string | undefined>>
  setShowSyncLiveBlocker: Dispatch<SetStateAction<boolean>>
  setWitnessData: Dispatch<SetStateAction<any>>
  echoPins: any[]
  setEchoPins: Dispatch<SetStateAction<any[]>>
  dailyPulse: any
  checkAndUpdateDailyPulse: (forceUser?: CurrentUser) => void
  completeDailyChallenge: (progressInc?: number, baseUser?: CurrentUser) => Promise<void>
  awardConstancy: (amount: number, reason: string, baseUser?: CurrentUser) => void
  openEntrenoDeHoy: (opts?: any) => void | Promise<void>
  applyEntrenoSaveSideEffects: (minutes: number, opts?: any) => Promise<void>
  weekLiveDays: string[]
  homeLoggedSessionsCount: number
  homeWeekTrainedCount: number
  entrenoRecentWorkouts: any[]
  setProfilePosts: Dispatch<SetStateAction<Record<string, ProfilePost[]>>>
  profilePostsRef: RefObject<Record<string, ProfilePost[]>>
  subscribeCommentsForPosts: (posts: ProfilePost[]) => void
  loadGlobalFeed: () => Promise<void>
  setExercisePRRecords: Dispatch<SetStateAction<any[]>>
  setHomeCoachBanner: Dispatch<SetStateAction<any>>
  syncCityStatsBump: (liveMin: number, syncMin: number) => Promise<void>
  addDebugLog: (msg: string) => void
  capacitorCamera?: any
}

export function useArenaSyncController(opts: UseArenaSyncControllerOptions) {
  const optsRef = useRef(opts)
  optsRef.current = opts

  const { syncPartnerId, syncStartedAt, syncActions, syncWorkoutLog } = opts.syncSession

  const [replaySession, setReplaySession] = useState<any>(null)
  const [syncDuelSummary, setSyncDuelSummary] = useState<SyncDuelSummaryState>(null)
  const [publishingSyncFeed, setPublishingSyncFeed] = useState(false)
  const [activeSyncPairs, setActiveSyncPairs] = useState<any[]>([])
  const [isArenaVoiceRecording, setIsArenaVoiceRecording] = useState(false)

  const syncWorkoutLogRef = useRef<SyncWorkoutLogState>(syncWorkoutLog)
  useEffect(() => {
    syncWorkoutLogRef.current = syncWorkoutLog
  }, [syncWorkoutLog])

  const lastSyncActionToastRef = useRef<{ at: number; key: string } | null>(null)
  const arenaPhotoInputRef = useRef<HTMLInputElement>(null)
  const arenaPhotoResolverRef = useRef<((url: string | null) => void) | null>(null)
  const arenaVoiceRecorderRef = useRef<MediaRecorder | null>(null)
  const arenaVoiceChunksRef = useRef<Blob[]>([])

  const emitArenaMapRipple = (
    label: string,
    intensity: number,
    rippleOpts?: {
      vibe?: number
      actionsSnapshot?: any[]
      forceLegend?: boolean
      notifyNearby?: boolean
      skipCounter?: boolean
    }
  ) => {
    const o = optsRef.current
    const ss = o.syncSession

    if (!rippleOpts?.skipCounter) {
      ss.setArenaWaveCount((c) => c + 1)
      ss.setLastArenaWaveLabel(label)
      ss.setArenaWavePulseKey((k) => k + 1)
    }

    const partnerId = ss.syncPartnerIdRef.current || ss.syncPartnerId
    if (!partnerId) return

    const partner =
      o.liveTrainingNow.find((u: any) => u.id === partnerId) ||
      o.realProfiles.find((p: any) => p.id === partnerId)
    if (!partner?.lat || !partner?.lng) return

    const actionsSnap = rippleOpts?.actionsSnapshot ?? ss.syncActions
    const vibeNow = rippleOpts?.vibe ?? ss.syncVibe
    const logSnap = syncWorkoutLogRef.current
    const workoutWitness =
      syncWorkoutHasData(logSnap) && logSnap.exercises.length > 0
        ? buildWorkoutPreview(
            'EntrenaSync en vivo',
            'full',
            logSnap.exercises,
            computeWorkoutStats(
              logSnap.exercises,
              ss.syncStartedAt
                ? Math.max(1, Math.floor((Date.now() - ss.syncStartedAt) / 60000))
                : 1
            )
          )
        : undefined
    const partnerBond = ss.syncBonds[partner.id]
    const isHighlightRipple =
      rippleOpts?.forceLegend ||
      !!partner.isNetworkBond ||
      (partnerBond && ((partnerBond.totalMin || 0) >= 30 || (partnerBond.bondLevel || 0) >= 2))
    const finalIntensity = isHighlightRipple ? Math.max(intensity, 2.4) : intensity
    const rippleId = 'sync-' + Date.now()
    const rippleLabel = isHighlightRipple
      ? `⭐ HIGHLIGHT DE RED • ${label}`
      : intensity >= 1.5
        ? `⚡ Onda de Sync • ${label}`
        : `🌊 Onda de Sync • ${label}`

    ss.setSyncRipples((prev) => [
      ...prev,
      {
        id: rippleId,
        lat: partner.lat,
        lng: partner.lng,
        label: rippleLabel,
        intensity: finalIntensity,
        witnessData: {
          actions: actionsSnap.slice(0, 6).map((a: any) => ({ ...a })),
          vibe: vibeNow,
          partnerName: partner.name || partner.nombre || 'Gym partner',
          photoUrl: actionsSnap.find((a: any) => a.photoUrl)?.photoUrl || null,
          label: isHighlightRipple ? `⭐ ${label}` : `🌊 ${label}`,
          timestamp: Date.now(),
          minutes: ss.syncStartedAt ? Math.floor((Date.now() - ss.syncStartedAt) / 60000) : 0,
          workoutPreview: workoutWitness,
          loggedSets: countLoggedSets(logSnap),
        },
      },
    ])
    setTimeout(
      () => ss.setSyncRipples((r) => r.filter((x) => x.id !== rippleId)),
      isHighlightRipple ? 5200 : 3200
    )

    if (isHighlightRipple) {
      const pinId = 'echo-pin-' + rippleId
      o.setEchoPins((prev) => [
        ...prev,
        {
          id: pinId,
          lat: partner.lat,
          lng: partner.lng,
          label: `⭐ ${label}`,
          witnessData: {
            actions: actionsSnap.slice(0, 6).map((a: any) => ({ ...a })),
            vibe: vibeNow,
            partnerName: partner.name || partner.nombre || 'Gym partner',
            photoUrl: actionsSnap.find((a: any) => a.photoUrl)?.photoUrl || null,
            label: `⭐ ${label}`,
            timestamp: Date.now(),
            minutes: ss.syncStartedAt ? Math.floor((Date.now() - ss.syncStartedAt) / 60000) : 0,
            workoutPreview: workoutWitness,
            loggedSets: countLoggedSets(logSnap),
          },
        },
      ])
      setTimeout(() => o.setEchoPins((p) => p.filter((x) => x.id !== pinId)), 45 * 60 * 1000)
    }

    const shouldNotify = rippleOpts?.notifyNearby !== false && (isHighlightRipple || intensity >= 1.4)
    if (shouldNotify && o.userLocation) {
      const distToEvent = getDistanceKm(
        o.userLocation.lat,
        o.userLocation.lng,
        partner.lat,
        partner.lng
      )
      if (distToEvent < 8) {
        try {
          o.addNotificationRef.current?.({
            id: 'ripple-global-' + rippleId,
            type: 'session_join' as any,
            title: isHighlightRipple ? '⭐ Highlight de Sync cerca' : '⚡ Energía de Sync cerca',
            body: `${label} — alguien entrena en sync a ${distToEvent.toFixed(1)}km`,
            relatedId: partnerId,
          })
          if (distToEvent < 5 && isHighlightRipple) {
            toast(`⚡ Onda de Arena cerca`, { description: `${label} se sintió en tu zona` })
          }
        } catch {}
      }
    }
  }

  const persistSyncWorkoutLogToSession = async (log: SyncWorkoutLogState) => {
    const o = optsRef.current
    const ss = o.syncSession
    if (o.isDemoMode || !o.db || !ss.syncPartnerId) return
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      const sessionId = buildSyncSessionId(o.effectiveUserId, ss.syncPartnerId)
      await updateDoc(doc(o.db, 'syncSessions', sessionId), {
        [`participantState.${o.effectiveUserId}`]: toParticipantSyncPayload(log),
        updatedAt: Date.now(),
      })
    } catch (e) {
      console.warn('workoutLog persist failed', e)
    }
  }

  const doSyncAction = async (
    emoji: string,
    label: string,
    extras?: { voiceUrl?: string; photoUrl?: string }
  ) => {
    const o = optsRef.current
    const ss = o.syncSession
    if (!ss.syncPartnerId || !ss.syncStartedAt) return
    triggerHaptic('light')

    const isCombo = ss.syncActions.length > 0 && ss.syncActions[0].label === label
    const newCombo = isCombo ? Math.min(5, ss.syncCombo + 1) : 1
    ss.setSyncCombo(newCombo)
    const baseGain = 7
    const comboBonus = (newCombo - 1) * 6
    const vibeGain = baseGain + comboBonus

    const action = {
      id: 'sa' + Date.now(),
      ...buildSyncSessionAction({
        emoji,
        label,
        userId: o.effectiveUserId,
        combo: newCombo,
        voiceUrl: extras?.voiceUrl,
        photoUrl: extras?.photoUrl,
      }),
    }
    const newActions = [action, ...ss.syncActions].slice(0, 12)
    ss.setSyncActions(newActions)

    const flyId = 'fly' + Date.now()
    ss.setFlyingEmojis((prev) => [...prev.slice(-3), { id: flyId, emoji, label }])
    setTimeout(() => {
      ss.setFlyingEmojis((prev) => prev.filter((f) => f.id !== flyId))
    }, 1400)

    const updatedUser = { ...o.currentUser, syncActions: newActions }
    o.saveUser(updatedUser as any)
    if (!o.isDemoMode && o.firebaseUser?.uid) {
      try {
        await updateUserProfile(o.firebaseUser.uid, { syncActions: newActions.slice(-10) })
      } catch (e) {
        console.warn('sync action persist failed', e)
      }
    }

    if (!o.isDemoMode && o.db) {
      try {
        const { doc, updateDoc, arrayUnion } = await import('firebase/firestore')
        const uids = [o.effectiveUserId, ss.syncPartnerId].sort()
        const sessionId = `sync_${uids[0]}_${uids[1]}`
        const actionForSession = buildSyncSessionAction({
          emoji,
          label,
          userId: o.effectiveUserId,
          combo: newCombo,
          voiceUrl: extras?.voiceUrl,
          photoUrl: extras?.photoUrl,
        })
        let newVibe = Math.min(100, (ss.syncVibe || 0) + vibeGain)
        const isBondedAction = !!ss.syncBonds[ss.syncPartnerId]
        if (isBondedAction) {
          const bond = ss.syncBonds[ss.syncPartnerId]
          const netBonus = Math.floor((bond.bondLevel || 1) * 0.8)
          newVibe = Math.min(100, newVibe + netBonus)
        }
        await updateDoc(doc(o.db, 'syncSessions', sessionId), {
          actions: arrayUnion(actionForSession),
          vibe: newVibe,
          updatedAt: Date.now(),
        })
        ss.setSyncVibe(newVibe)

        const prevVibe = ss.syncVibe || 0
        const crossedLegend = newVibe >= 80 && prevVibe < 80
        const rippleIntensity = crossedLegend
          ? newVibe > 90
            ? 2.2
            : 1.8
          : newCombo >= 3
            ? 1.55
            : newCombo >= 2
              ? 1.25
              : 0.9
        emitArenaMapRipple(`${emoji} ${label}`, rippleIntensity, {
          vibe: newVibe,
          actionsSnapshot: newActions,
          forceLegend: crossedLegend,
          notifyNearby: crossedLegend || newCombo >= 2,
        })

        if (isBondedAction && (newCombo >= 2 || vibeGain > 10)) {
          const bondBoost = Math.max(1, Math.floor(vibeGain / 8))
          toast.success(`❤️ Alianza fortalecida +${bondBoost} con tu socio de sync`, {
            description:
              'Tu Fuerza del equipo sube. Se propaga en tu red, mapa y feed – la red te hace más fuerte.',
          })
        }

        if (crossedLegend) {
          const highAction = {
            id: 'hv' + Date.now(),
            emoji: '⚡',
            label: '¡Alta energía compartida!',
            userId: o.effectiveUserId,
            at: Date.now(),
          }
          ss.setSyncActions((prev) => [highAction, ...prev].slice(0, 30))
          toast.success('⚡ ¡Highlight de sync!', {
            description: 'La ciudad puede presenciarlo — momento destacado en mapa + replay',
          })
          triggerHaptic('medium')
          setTimeout(() => {
            ss.setFlyingEmojis((prev) => [
              ...prev.slice(-2),
              { id: 'fly-high' + Date.now(), emoji: '⚡', label: 'Alta!' },
            ])
            try {
              triggerHaptic('heavy')
            } catch {}
          }, 120)

          if (Capacitor.isNativePlatform() && o.capacitorCamera) {
            setTimeout(() => {
              toast('📸 ¿Capturar el pico de alta vibe?', {
                action: {
                  label: 'Capturar',
                  onClick: async () => {
                    try {
                      const photo = await o.capacitorCamera.getPhoto({
                        quality: 70,
                        allowEditing: true,
                        resultType: 'base64',
                      })
                      const dataUrl = `data:image/jpeg;base64,${photo.base64String}`
                      const path = `posts/${o.effectiveUserId}/arena-high-${Date.now()}.jpg`
                      const { ref, uploadString, getDownloadURL } = await import('firebase/storage')
                      const storageRef = ref(o.storage!, path)
                      const snap = await uploadString(storageRef, dataUrl, 'data_url')
                      const url = await getDownloadURL(snap.ref)
                      const photoAction = {
                        id: 'sa' + Date.now(),
                        emoji: '📸',
                        label: 'Alta vibe capturada',
                        userId: o.effectiveUserId,
                        at: Date.now(),
                        photoUrl: url,
                      }
                      ss.setSyncActions((prev) => [photoAction, ...prev].slice(0, 30))
                      await o.createProfilePostRef.current?.('⚡ Momento de alta energía en Arena', url)
                      toast.success('📸 Alta vibe inmortalizada')
                    } catch {
                      toast('Captura cancelada')
                    }
                  },
                },
              })
            }, 800)
          }
        }
      } catch (e) {
        console.warn('instant syncSession action failed (mirror will catch on next poll)', e)
      }
    } else {
      const newVibe = Math.min(100, (ss.syncVibe || 0) + vibeGain)
      ss.setSyncVibe(newVibe)
      const rippleIntensity = newCombo >= 2 ? 1.2 : 0.85
      emitArenaMapRipple(`${emoji} ${label}`, rippleIntensity, {
        vibe: newVibe,
        actionsSnapshot: newActions,
        notifyNearby: false,
      })
    }

    o.addDebugLog(`Sync action: ${emoji} ${label}${newCombo > 1 ? ` x${newCombo}` : ''}`)

    if (newCombo >= 3) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
      toast.success(`${emoji} RACHA x${newCombo}!`, {
        description: 'Onda fuerte en el mapa — quien esté en GymPulse lo presencia',
      })
      triggerHaptic('medium')
    } else if (newCombo >= 2) {
      toast.success(`${emoji} ${label} ×${newCombo}`, {
        description: 'La red siente la racha en el GymPulse',
      })
    } else {
      toast.success(`${emoji} ${label}`, {
        description: 'Visible en Arena y para tu compañero — no spam en el muro',
      })
    }
  }

  const startSyncWith = useCallback(async (partnerId: string, partnerName: string) => {
    const o = optsRef.current
    const ss = o.syncSession
    const myIds = [o.effectiveUserId, o.currentUser?.id, o.firebaseUser?.uid, 'me'].filter(Boolean)
    if (!partnerId || myIds.includes(partnerId)) return

    const me = o.currentUserRef.current ?? o.currentUser
    if (!me?.trainingNow) {
      o.setSyncBlockerPartnerName(partnerName)
      o.setShowSyncLiveBlocker(true)
      return
    }

    if (!o.isUserLive(partnerId)) {
      toast.error(`${partnerName || 'Tu compañero'} no está en vivo ahora`, {
        description:
          'Ambos deben tener live activo. Actualiza Explorar/mapa o espera a que encienda su GymPulse.',
      })
      return
    }

    if (ss.syncPartnerId) {
      toast.info('Ya tienes un EntrenaSync activo', {
        description: 'Termina la sesión actual o abre la Arena.',
      })
      return
    }
    if (ss.joiningSyncWith === partnerId) return

    if (!o.isDemoMode && !o.firebaseUser?.uid) {
      console.warn('startSyncWith: no real firebaseUser uid, cannot start real EntrenaSync')
      toast.error('Inicia sesión con cuenta real para usar EntrenaSync')
      return
    }

    ss.setJoiningSyncWith(partnerId)
    try {
      const syncAt = Date.now()
      ss.setSyncPartnerId(partnerId)
      ss.syncPartnerIdRef.current = partnerId
      ss.setSyncStartedAt(syncAt)
      ss.setSyncActions([])
      ss.setSyncCombo(0)
      ss.setFlyingEmojis([])
      ss.setSyncWorkoutLog(createEmptySyncWorkoutLog())
      ss.setSyncPartnerLiveState(null)
      ss.setSyncRestUntil(null)
      ss.setSyncRestStartedBy(null)
      ss.setSyncWitnessIds([])
      ss.setShowSyncArena(true)
      o.setActiveTab('explore')
      triggerHaptic('medium')

      const updated = {
        ...me,
        trainingNow: true,
        trainingSyncWith: partnerId,
        syncStartedAt: syncAt,
        syncActions: [],
      }
      o.saveUser(updated as any)
      if (me.trainingNow) {
        o.pendingLiveWriteRef.current = { trainingNow: true, at: Date.now() }
      }

      if (!o.isDemoMode && o.db && o.firebaseUser) {
        await o.saveUserWithRealSyncRef.current?.(updated as any)

        const { doc, setDoc } = await import('firebase/firestore')
        const uids = [o.firebaseUser.uid, partnerId].sort()
        const sessionId = `sync_${uids[0]}_${uids[1]}`
        const sessionRef = doc(o.db, 'syncSessions', sessionId)
        const baseVibe = 12
        await setDoc(
          sessionRef,
          {
            participants: uids,
            startedAt: syncAt,
            actions: [],
            vibe: baseVibe,
            witnesses: [],
            participantState: {
              [o.firebaseUser.uid]: toParticipantSyncPayload(createEmptySyncWorkoutLog()),
            },
            updatedAt: syncAt,
          },
          { merge: true }
        )
        ss.setSyncVibe(baseVibe)
      } else {
        ss.setSyncVibe(12)
      }

      setTimeout(() => {
        emitArenaMapRipple('Sync iniciado', 1.05, { vibe: 12, actionsSnapshot: [], notifyNearby: false })
      }, 400)
      toast.success(`EntrenaSync iniciado con ${partnerName}`, {
        description: 'Arena abierta — vuestra sync ondea en el GymPulse en vivo',
      })
      try {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } })
      } catch {}
      o.addDebugLog(`EntrenaSync started with ${partnerName}`)
    } catch (e: any) {
      console.warn('startSyncWith failed', e)
      const isPerm =
        e?.code === 'permission-denied' || `${e?.message || e}`.includes('permission')
      ss.setSyncPartnerId(null)
      ss.syncPartnerIdRef.current = null
      ss.setShowSyncArena(false)
      toast.error('No se pudo iniciar EntrenaSync', {
        description: isPerm
          ? 'Permisos Firestore en syncSessions — avisa al admin o reintenta en unos segundos.'
          : 'Revisa tu conexión e intenta de nuevo.',
      })
    } finally {
      ss.setJoiningSyncWith(null)
    }
  }, [])

  const endSync = useCallback(async () => {
    const o = optsRef.current
    const ss = o.syncSession
    if (!ss.syncPartnerId) return
    const partnerName =
      o.realProfiles.find((p) => p.id === ss.syncPartnerId)?.name || 'compañero'
    const minutes = ss.syncStartedAt
      ? Math.floor((Date.now() - ss.syncStartedAt) / 60000)
      : 0
    const syncStartedAtCapture = ss.syncStartedAt
    const oldPartner = ss.syncPartnerId
    const newSyncStreak = ((o.currentUser as any).syncStreak || 0) + 1
    const weekKey = getWeekKey()
    const syncMins = minutes >= 2 ? minutes : 0
    const newWeekStats =
      syncMins > 0
        ? mergeWeekStats(
            o.currentUser?.weekStats?.weekKey === weekKey ? o.currentUser.weekStats : undefined,
            weekKey,
            0,
            o.weekLiveDays.length,
            syncMins
          )
        : o.currentUser?.weekStats
    const updated = {
      ...o.currentUser,
      trainingSyncWith: null,
      syncStartedAt: null,
      syncActions: [],
      syncStreak: newSyncStreak,
      ...(newWeekStats ? { weekStats: newWeekStats } : {}),
    } as any
    o.saveUser(updated)
    ss.setSyncPartnerId(null)
    ss.syncPartnerIdRef.current = null
    ss.setSyncStartedAt(null)
    ss.setSyncActions([])
    ss.setSyncVibe(0)
    ss.setSyncCombo(0)
    ss.setFlyingEmojis([])
    ss.setArenaWaveCount(0)
    ss.setLastArenaWaveLabel('')
    ss.setArenaWavePulseKey(0)
    ss.setSyncRealWitnessCount(0)
    ss.setSyncWitnessIds([])
    const capturedPartnerExercises = ss.syncPartnerLiveState?.exercises?.length
      ? ss.syncPartnerLiveState.exercises.map((e) => ({
          name: e.name,
          sets: e.sets.map((s) => ({ reps: s.reps, weightKg: s.weightKg ?? 0 })),
        }))
      : []
    ss.setSyncPartnerLiveState(null)
    ss.setSyncRestUntil(null)
    ss.setSyncRestStartedBy(null)
    ss.setShowSyncArena(false)
    const capturedActions = [...ss.syncActions]
    const capturedVibe = ss.syncVibe
    const capturedWorkoutLog = {
      ...syncWorkoutLogRef.current,
      exercises: syncWorkoutLogRef.current.exercises.map((e) => ({
        ...e,
        sets: [...e.sets],
      })),
    }
    ss.setSyncWorkoutLog(createEmptySyncWorkoutLog())
    if (!o.isDemoMode && o.firebaseUser) {
      try {
        await o.saveUserWithRealSyncRef.current?.(updated as any)
      } catch (e) {
        console.warn('endSync self clear via resilient path failed', e)
      }
      if (syncMins > 0) o.syncCityStatsBump(0, syncMins).catch(() => {})
      if (minutes >= 2 && oldPartner) {
        const uids = [o.effectiveUserId, oldPartner].sort() as [string, string]
        const sid = `sync_${uids[0]}_${uids[1]}`
        const partnerCity = o.realProfiles.find((p) => p.id === oldPartner)?.city
        void recordPilotSyncSession(o.db, {
          sessionId: sid,
          weekKey,
          participantIds: uids,
          recorderUid: o.effectiveUserId,
          selfCity: o.currentUser?.city,
          partnerCity,
          durationMin: minutes,
        }).then((r) => {
          if (r.recorded) {
            console.info('[pilot] sync session recorded', sid, o.currentUser?.city)
          }
        })
      }
      if (o.db) {
        try {
          const { doc, updateDoc } = await import('firebase/firestore')
          if (oldPartner)
            await updateDoc(doc(o.db, 'profiles', oldPartner), {
              trainingSyncWith: null,
              syncStartedAt: null,
            }).catch(() => {})
          try {
            const { doc: doc2, updateDoc: upd2 } = await import('firebase/firestore')
            const uids = [o.effectiveUserId, oldPartner].sort()
            const sid = `sync_${uids[0]}_${uids[1]}`
            await upd2(doc2(o.db, 'syncSessions', sid), { endedAt: Date.now() }).catch(() => {})
          } catch {}
        } catch (e) {}
      }
    }
    const capturedWitness = ss.syncRealWitnessCount
    const bondAtEnd = ss.syncBonds[oldPartner!]
    const partnerProfileAtEnd = o.realProfiles.find((p) => p.id === oldPartner)

    if (
      minutes >= 2 &&
      syncWorkoutHasData(capturedWorkoutLog) &&
      !o.isDemoMode &&
      o.db &&
      o.firebaseUser &&
      oldPartner
    ) {
      try {
        const uids = [o.effectiveUserId, oldPartner].sort()
        const sid = `sync_${uids[0]}_${uids[1]}`
        const history = await fetchRecentWorkouts(o.db, o.effectiveUserId, 20)
        const prs = detectWorkoutPRs(capturedWorkoutLog.exercises, history)
        const prSummary = formatWorkoutPRSummary(prs)
        const { workout, postId, postText } = await saveSyncWorkoutWithPost(o.db, {
          userId: o.effectiveUserId,
          partnerId: oldPartner,
          partnerName,
          syncSessionId: sid,
          title: `Sync con ${partnerName.split(' ')[0]}`,
          type: 'full',
          exercises: capturedWorkoutLog.exercises,
          durationMin: Math.max(1, minutes),
          source: 'sync',
          startedAt: syncStartedAtCapture || undefined,
          prSummary: prSummary || undefined,
          prCount: prs.length || undefined,
          pinned: prs.length > 0,
        })
        if (prs.length) {
          await syncExercisePRs(o.db, o.effectiveUserId, prs, workout.id)
          o.setExercisePRRecords(topExercisePRs(await loadExercisePRs(o.db, o.effectiveUserId), 5))
        }
        const preview = buildWorkoutPreview(
          workout.title,
          workout.type,
          capturedWorkoutLog.exercises,
          workout.stats,
          { prCount: prs.length || undefined }
        )
        const post: ProfilePost = {
          id: postId,
          userId: o.effectiveUserId,
          text: postText,
          timestamp: Date.now(),
          pinned: prs.length > 0,
          likes: [],
          comments: [],
          postType: 'workout',
          workoutId: workout.id,
          workoutPreview: preview,
          reactions: {},
        }
        o.setProfilePosts((prev) => {
          const current = prev[o.effectiveUserId] || []
          const newState = { ...prev, [o.effectiveUserId]: [post, ...current].slice(0, 10) }
          o.profilePostsRef.current = newState
          return newState
        })
        o.subscribeCommentsForPosts([post])
        if (o.activeTab === 'home') o.loadGlobalFeed().catch(() => {})
        await o.applyEntrenoSaveSideEffects(Math.max(1, minutes), {
          prSummary: prSummary || undefined,
          workoutType: 'full',
          exercises: capturedWorkoutLog.exercises,
        })
      } catch (e) {
        console.warn('sync workout save failed', e)
      }
    } else if (syncWorkoutHasData(capturedWorkoutLog)) {
      void o.openEntrenoDeHoy({
        title: `Sync con ${partnerName.split(' ')[0]}`,
        exercises: cloneExercises(capturedWorkoutLog.exercises),
        type: 'full',
        durationMin: Math.max(1, minutes),
      })
      toast.info('Confirma tu Entreno de Hoy', {
        description: 'Revisa los sets del Sync y guarda la sesión',
      })
    }

    o.checkAndUpdateDailyPulse()
    if (
      o.dailyPulse?.currentChallenge?.type === 'bond' ||
      o.dailyPulse?.currentChallenge?.type === 'network'
    ) {
      o.completeDailyChallenge(1)
    } else {
      o.awardConstancy(15, 'Synergy completada')
    }

    if (oldPartner) {
      const elapsedSec = syncStartedAtCapture
        ? Math.max(0, Math.floor((Date.now() - syncStartedAtCapture) / 1000))
        : 0
      const pact = (o.currentUser as { weeklyPact?: import('../types').WeeklyPact })?.weeklyPact
      const projectedStats =
        syncMins > 0
          ? mergeWeekStats(
              o.currentUser?.weekStats?.weekKey === weekKey ? o.currentUser.weekStats : undefined,
              weekKey,
              0,
              o.weekLiveDays.length,
              syncMins
            )
          : o.currentUser?.weekStats
      const projectedLogged = (() => {
        let n = o.homeLoggedSessionsCount
        if (syncWorkoutHasData(capturedWorkoutLog)) {
          const today = toLocalDateStr()
          const hasToday = o.entrenoRecentWorkouts.some(
            (w) => toLocalDateStr(w.endedAt || w.startedAt) === today
          )
          if (!hasToday) n += 1
        }
        return n
      })()
      const projectedMeta = computeWeeklyPactProgress(
        isPactForCurrentWeek(pact) ? pact : null,
        o.homeWeekTrainedCount,
        projectedStats,
        projectedLogged
      )
      const workoutCompare = compareSyncWorkoutLogs(
        capturedWorkoutLog.exercises,
        capturedPartnerExercises,
        Math.max(1, minutes)
      )
      setSyncDuelSummary({
        partnerId: oldPartner,
        partnerName,
        minutes,
        elapsedSec,
        vibe: capturedVibe,
        witnessCount: capturedWitness,
        setsLogged: countLoggedSets(capturedWorkoutLog),
        actions: capturedActions.slice(0, 12),
        isNetworkBond: !!bondAtEnd,
        bondLevel: bondAtEnd?.bondLevel,
        partnerPhoto: partnerProfileAtEnd?.photos?.[0],
        weeklyMetaComplete: projectedMeta.isComplete,
        weeklyMetaLine: projectedMeta.pledged
          ? projectedMeta.isComplete
            ? 'Semana sellada — meta cumplida'
            : `${projectedMeta.liveDaysDone}/${projectedMeta.liveDaysTarget} live · ${projectedMeta.syncSessionsDone}/${projectedMeta.syncSessionsTarget} sync · ${projectedMeta.loggedSessionsDone}/${projectedMeta.loggedSessionsTarget} logs`
          : undefined,
        workoutCompare,
      })
      void recordSyncShareMetric(o.db, {
        uid: o.effectiveUserId,
        kind: 'offer',
        city: o.currentUser?.city,
        isDemoMode: o.isDemoMode,
      })
    } else {
      toast(`Sync finalizado: ${minutes}min`, {
        description: '¡Buen trabajo en equipo! +1 sync streak',
      })
    }
    if (minutes >= 2) {
      o.setHomeCoachBanner('post-sync')
      if (o.activeTab !== 'home') o.navigateTab('home')
    }
  }, [])

  const submitSyncRating = useCallback(
    async (
      rating: number,
      ctx?: {
        partnerId: string
        partnerName: string
        minutes: number
        vibe?: number
        actions?: any[]
        publishToFeed?: boolean
      }
    ) => {
      const o = optsRef.current
      const ss = o.syncSession
      const payload = ctx || ss.pendingSyncRating
      if (!payload) return
      triggerHaptic('success')
      const { partnerId, partnerName, minutes } = payload
      const sessionVibe = ctx?.vibe ?? ss.syncVibe
      if (!o.isDemoMode && o.db && o.firebaseUser) {
        try {
          const { doc, updateDoc, arrayUnion } = await import('firebase/firestore')
          await updateDoc(doc(o.db, 'profiles', o.effectiveUserId), {
            syncRatings: arrayUnion({ partnerId, rating, minutes, ts: Date.now() }),
          })
        } catch (e) {}
      }
      const prevBond = ss.syncBonds[partnerId] || {
        totalMin: 0,
        sessions: 0,
        avgRating: 0,
        bondLevel: 1,
      }
      const newTotalMin = prevBond.totalMin + minutes
      const newSessions = prevBond.sessions + 1
      const newAvg = Math.round((prevBond.avgRating * prevBond.sessions + rating) / newSessions)
      const newBondLevel = Math.min(
        5,
        Math.max(1, Math.floor(newTotalMin / 25) + (newAvg >= 4 ? 1 : 0))
      )
      const partnerProfile =
        o.realProfiles.find((p) => p.id === partnerId) ||
        o.liveUsersActive.find((p: any) => p.id === partnerId)
      const updatedBonds = {
        ...ss.syncBonds,
        [partnerId]: {
          totalMin: newTotalMin,
          sessions: newSessions,
          avgRating: newAvg,
          bondLevel: newBondLevel,
          ...(partnerProfile?.lat != null && partnerProfile?.lng != null
            ? { partnerLat: partnerProfile.lat, partnerLng: partnerProfile.lng }
            : {}),
        },
      }
      ss.setSyncBonds(updatedBonds)
      if (!o.isDemoMode && o.firebaseUser?.uid) {
        try {
          await updateUserProfile(o.firebaseUser.uid, { syncBonds: updatedBonds } as any)
        } catch {}
      }

      if (rating >= 4) {
        const boost = Math.min(2, Math.floor(minutes / 10))
        const newStreak = ((o.currentUser as any).syncStreak || 0) + boost
        const updated = { ...o.currentUser, syncStreak: newStreak }
        o.saveUser(updated as any)
        if (!o.isDemoMode && o.firebaseUser?.uid) {
          try {
            await updateUserProfile(o.firebaseUser.uid, { syncStreak: newStreak })
          } catch {}
        }
        if (!o.isDemoMode && o.db) {
          try {
            const { doc, updateDoc } = await import('firebase/firestore')
            const uids = [o.effectiveUserId, partnerId].sort()
            const sessionId = `sync_${uids[0]}_${uids[1]}`
            const bonus = Math.min(30, rating * 6 + Math.floor(minutes / 3))
            const finalVibe = Math.min(100, (sessionVibe || 50) + bonus)
            await updateDoc(doc(o.db, 'syncSessions', sessionId), { vibe: finalVibe })
            if (ss.syncPartnerId) ss.setSyncVibe(finalVibe)
          } catch {}
        }
      }

      const wantsPublish =
        ctx?.publishToFeed === true && !getSyncShareOptOut()
      if (
        wantsPublish &&
        minutes >= 3 &&
        (ctx?.actions?.length || replaySession || ss.syncActions.length > 1)
      ) {
        const actionsForStory = (ctx?.actions || replaySession?.actions || ss.syncActions).slice(0, 6)
        const actionSummary = actionsForStory
          .map((a: any) => `${a.emoji} ${a.label}${a.combo ? `x${a.combo}` : ''}`)
          .join(' · ')
        const isNet = !!ss.syncBonds[partnerId]
        const storyText = `🔄 ENTRENASYNC COMPLETADO\n${minutes} min sincronizados con ${partnerName}\nSync Score final: ${sessionVibe || 70}% • Calificación: ${rating}★\nAcciones clave: ${actionSummary}\n\nEntrenamos en sync real-time y subimos nuestro rendimiento. ${isNet ? `Esta fue una sesión de RED — Fuerza del equipo activada. Tu grafo gana +${Math.floor(minutes / 3)} de fuerza y visibilidad global.` : `Esta alianza ya genera +${Math.floor(minutes * 1.2)} min de alto rendimiento compartido.`} Queda en nuestra red para siempre. #EntrenaSync`
        o.createProfilePostRef.current?.(storyText, null).catch(() => {})
        void recordSyncShareMetric(o.db, {
          uid: o.effectiveUserId,
          kind: 'publish',
          city: o.currentUser?.city,
          isDemoMode: o.isDemoMode,
        })
        ss.setLastSyncStory({ partnerName, minutes, rating, vibe: sessionVibe, summary: actionSummary })
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } })
        toast.success('Resumen del sync publicado en tu muro', {
          description: 'Solo tú decidiste compartir — opt-out disponible en Perfil.',
        })
      }

      if (replaySession) {
        setReplaySession({ ...replaySession, rating })
      }

      toast.success(`Sync con ${partnerName} calificado ${rating}/5`, {
        description: '¡Gracias! Ayuda a mejorar el matching + tu alianza de sync creció.',
      })
      ss.setPendingSyncRating(null)
      setSyncDuelSummary(null)
    },
    [replaySession]
  )

  const handleArenaCapturePhoto = useCallback(async () => {
    const o = optsRef.current
    const ss = o.syncSession
    if (!ss.syncPartnerId || !o.currentUser) return
    const partner = o.realProfiles.find((p) => p.id === ss.syncPartnerId)
    const partnerName = partner?.name || 'Compañero'

    try {
      let dataUrl: string | null = null
      if (Capacitor.isNativePlatform() && o.capacitorCamera) {
        const photo = await o.capacitorCamera.getPhoto({
          quality: 75,
          allowEditing: true,
          resultType: 'base64',
        })
        dataUrl = `data:image/jpeg;base64,${photo.base64String}`
      } else {
        dataUrl = await new Promise<string | null>((resolve) => {
          arenaPhotoResolverRef.current = resolve
          arenaPhotoInputRef.current?.click()
        })
      }
      if (!dataUrl) return

      let url = dataUrl
      if (!o.isDemoMode && o.storage && o.firebaseUser?.uid && dataUrl.startsWith('data:')) {
        url = await uploadArenaPhotoUrl(o.storage, o.effectiveUserId, dataUrl)
      }

      const caption = 'Momento en Arena'
      const photoAction = {
        id: 'sa' + Date.now(),
        emoji: '📸',
        label: caption,
        userId: o.effectiveUserId,
        at: Date.now(),
        photoUrl: url,
      }
      ss.setSyncActions((prev) => [photoAction, ...prev].slice(0, 30))

      const photoText = `📸 ${caption} — con ${partnerName} en Arena (vibe ${ss.syncVibe}%)`
      await o.createProfilePostRef.current?.(photoText, url)
      if (!o.isDemoMode && o.db && ss.syncPartnerId) {
        await postPartnerSyncStory(o.db, ss.syncPartnerId, photoText, url).catch(() => {})
        const { doc, updateDoc, arrayUnion } = await import('firebase/firestore')
        const sessionId = buildSyncSessionId(o.effectiveUserId, ss.syncPartnerId)
        await updateDoc(doc(o.db, 'syncSessions', sessionId), {
          actions: arrayUnion({
            emoji: '📸',
            label: caption,
            userId: o.effectiveUserId,
            at: Date.now(),
            photoUrl: url,
          }),
        }).catch(() => {})
      }

      toast.success('📸 Momento capturado', {
        description: 'Timeline + muros de ambos + onda en el mapa',
      })
      emitArenaMapRipple('Foto en Arena', 1.65, {
        vibe: ss.syncVibe,
        actionsSnapshot: [photoAction, ...ss.syncActions].slice(0, 12),
        notifyNearby: true,
      })
      triggerHaptic('success')
    } catch {
      toast.error('No se pudo capturar la foto')
    }
  }, [])

  const startArenaVoicePing = useCallback(async () => {
    const o = optsRef.current
    const ss = o.syncSession
    if (!ss.syncPartnerId || isArenaVoiceRecording) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      arenaVoiceRecorderRef.current = rec
      arenaVoiceChunksRef.current = []
      const started = Date.now()
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) arenaVoiceChunksRef.current.push(e.data)
      }
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        setIsArenaVoiceRecording(false)
        arenaVoiceRecorderRef.current = null
        const duration = Math.min(3, Math.max(1, Math.round((Date.now() - started) / 1000)))
        let voiceUrl: string | undefined
        const blob = new Blob(arenaVoiceChunksRef.current, { type: rec.mimeType || 'audio/webm' })
        if (
          !o.isDemoMode &&
          o.storage &&
          o.firebaseUser?.uid &&
          ss.syncPartnerId &&
          blob.size > 0
        ) {
          try {
            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
            const sessionId = buildSyncSessionId(o.effectiveUserId, ss.syncPartnerId)
            const storageRef = ref(o.storage, `arena-voice/${sessionId}/${Date.now()}.webm`)
            await uploadBytes(storageRef, blob)
            voiceUrl = await getDownloadURL(storageRef)
          } catch (e) {
            console.warn('arena voice upload failed', e)
          }
        }
        await doSyncAction('🎙️', `Voz · ${duration}s`, voiceUrl ? { voiceUrl } : undefined)
        triggerHaptic('light')
        toast.success('Voz enviada', {
          description: voiceUrl
            ? `${duration}s — tu compañero puede reproducirla en la Arena`
            : `${duration}s enviado (sin URL de audio)`,
        })
      }
      rec.start()
      setIsArenaVoiceRecording(true)
      triggerHaptic('medium')
      setTimeout(() => {
        if (rec.state === 'recording') rec.stop()
      }, 3000)
    } catch {
      toast.error('No se pudo acceder al micrófono', {
        description: 'Activa el permiso de micrófono para EntrenaMatch en Ajustes del celular.',
      })
    }
  }, [isArenaVoiceRecording])

  const handleArenaSyncAction = useCallback(
    async (actionId: string, emoji: string, label: string) => {
      const o = optsRef.current
      const ss = o.syncSession
      if (actionId === 'rest' && ss.syncPartnerId) {
        const until = Date.now() + ARENA_REST_MS
        ss.setSyncRestUntil(until)
        ss.setSyncRestStartedBy(o.effectiveUserId)
        if (!o.isDemoMode && o.db) {
          try {
            const { doc, updateDoc } = await import('firebase/firestore')
            const sessionId = buildSyncSessionId(o.effectiveUserId, ss.syncPartnerId)
            await updateDoc(doc(o.db, 'syncSessions', sessionId), {
              restUntil: until,
              restStartedBy: o.effectiveUserId,
              updatedAt: Date.now(),
            })
          } catch {
            /* non-fatal */
          }
        }
        await doSyncAction(emoji, label)
        return
      }
      if ((actionId === 'set' || actionId === 'pr') && ss.syncPartnerId && ss.syncStartedAt) {
        const set = {
          reps: ss.syncWorkoutLog.pendingReps,
          weightKg: ss.syncWorkoutLog.pendingWeightKg,
        }
        let nextLog = appendSetToLog(ss.syncWorkoutLog, ss.syncWorkoutLog.activeExercise, set)
        if (actionId === 'pr') {
          nextLog = {
            ...nextLog,
            prs: [
              ...nextLog.prs,
              {
                exercise: ss.syncWorkoutLog.activeExercise,
                weightKg: ss.syncWorkoutLog.pendingWeightKg,
                reps: ss.syncWorkoutLog.pendingReps,
                at: Date.now(),
              },
            ],
          }
        }
        ss.setSyncWorkoutLog(nextLog)
        await persistSyncWorkoutLogToSession(nextLog)
        const detail = formatSetLabel(ss.syncWorkoutLog.activeExercise, set.reps, set.weightKg)
        const actionLabel = actionId === 'pr' ? `PR · ${detail}` : `Set · ${detail}`
        await doSyncAction(emoji, actionLabel)
        if (actionId === 'pr') {
          try {
            confetti({ particleCount: 160, spread: 90, origin: { y: 0.65 } })
          } catch {}
          o.createProfilePostRef
            .current?.(
              `🏆 PR en ${ss.syncWorkoutLog.activeExercise}: ${set.reps}×${set.weightKg}kg — EntrenaSync en vivo`,
              null
            )
            .catch(() => {})
          toast.success('PR registrado', { description: detail })
        }
        return
      }
      await doSyncAction(emoji, label)
    },
    []
  )

  const tryAutoStartSync = useCallback((targetId: string) => {
    const o = optsRef.current
    const ss = o.syncSession
    const target = (o.latestRealProfilesRef.current || o.realProfiles).find((p) => p.id === targetId)
    if (!target) {
      toast.error('Compañero no encontrado', {
        description: 'Actualiza perfiles reales e intenta de nuevo.',
      })
      return
    }
    const me = o.currentUserRef.current
    if (!me?.trainingNow) {
      toast.error('Activa tu live primero', {
        description: 'Perfil → "Entrenando Ahora (EN VIVO)" antes de EntrenaSync.',
      })
      return
    }
    if (!o.isUserLive(targetId)) {
      toast.error(`${target.name} no está en vivo`, {
        description: 'Espera a que active live en el GymPulse.',
      })
      return
    }
    if (ss.syncPartnerId || ss.joiningSyncWith) return
    startSyncWith(targetId, target.name)
      .then(() => o.setActiveTab('explore'))
      .catch(() => {})
  }, [startSyncWith])

  const witnessRipple = useCallback(
    (rippleId: string) => {
      const o = optsRef.current
      const ss = o.syncSession
      const r = ss.syncRipples.find((rr: any) => rr.id === rippleId)
      if (r && r.witnessData) {
        o.setWitnessData(r.witnessData)
        triggerHaptic('medium')
      } else {
        toast('El highlight de esta sesión ya no está disponible. Crea uno nuevo con un EntrenaSync fuerte.')
      }
    },
    []
  )

  const witnessEchoPin = useCallback(
    (pinId: string) => {
      const o = optsRef.current
      const pin = o.echoPins.find((p: any) => p.id === pinId)
      if (pin && pin.witnessData) {
        o.setWitnessData(pin.witnessData)
        triggerHaptic('medium')
      }
    },
    []
  )

  const loadActiveSyncCount = useCallback(async () => {
    const o = optsRef.current
    const ss = o.syncSession
    if (!o.isFirebaseConfigured) {
      ss.setActiveSyncCount(0)
      setActiveSyncPairs([])
      return
    }
    const seen = new Set<string>()
    let count = 0
    const pairs: any[] = []
    for (const p of o.realProfiles) {
      if (!p.trainingNow || !p.trainingSyncWith) continue
      const partner = o.realProfiles.find((pp) => pp.id === p.trainingSyncWith)
      if (!partner?.trainingNow || partner.trainingSyncWith !== p.id) continue
      const pairKey = [p.id, partner.id].sort().join('_')
      if (seen.has(pairKey)) continue
      seen.add(pairKey)
      count++
      if (pairs.length < 2) {
        const startedAt = p.syncStartedAt || partner.syncStartedAt
        const minutes =
          startedAt && startedAt > 0
            ? Math.max(0, Math.floor((Date.now() - startedAt) / 60000))
            : undefined
        pairs.push({
          names: `${(p.name || 'U').split(' ')[0]} + ${(partner.name || 'U').split(' ')[0]}`,
          vibe: 50,
          minutes,
        })
      }
    }
    ss.setActiveSyncCount(count)
    if (pairs.length) setActiveSyncPairs(pairs)
    else setActiveSyncPairs([])
  }, [])

  // EntrenaSync profile mirror (fallback only)
  useEffect(() => {
    const o = optsRef.current
    if (o.currentUser?.trainingSyncWith && o.currentUser.trainingNow) {
      const partner = o.realProfiles.find((p) => p.id === o.currentUser!.trainingSyncWith)
      if (partner && partner.trainingSyncWith === o.effectiveUserId) {
        const ss = o.syncSession
        if (partner.syncStartedAt) ss.setSyncStartedAt(partner.syncStartedAt)
        if (partner.syncActions && partner.syncActions.length > ss.syncActions.length) {
          ss.setSyncActions(partner.syncActions)
        }
      }
    }
  }, [
    opts.currentUser?.trainingSyncWith,
    opts.currentUser?.trainingNow,
    opts.realProfiles,
    opts.effectiveUserId,
    syncActions.length,
  ])

  // Incoming EntrenaSync listener
  useEffect(() => {
    const o = optsRef.current
    if (
      o.authBooting ||
      !o.firebaseUser?.uid ||
      !o.db ||
      o.isDemoMode ||
      !o.isFirebaseConfigured
    ) {
      return undefined
    }

    return attachIncomingSyncListener(o.db, o.firebaseUser.uid, {
      getHasActivePartner: () => !!o.syncSession.syncPartnerIdRef.current,
      getTrainingNow: () => !!o.currentUserRef.current?.trainingNow,
      findPartnerName: (partnerId) =>
        (o.latestRealProfilesRef.current || []).find((p) => p.id === partnerId)?.name || 'Compañero',
      onIncoming: (payload) => {
        const ss = o.syncSession
        ss.syncPartnerIdRef.current = payload.partnerId
        ss.setSyncPartnerId(payload.partnerId)
        ss.setSyncStartedAt(payload.startedAt)
        ss.setSyncActions(normalizeSyncActionsForUi(payload.actions))
        ss.setSyncWorkoutLog(createEmptySyncWorkoutLog())
        ss.setSyncPartnerLiveState(null)
        if (typeof payload.vibe === 'number') {
          ss.setSyncVibe(Math.max(0, Math.min(100, payload.vibe)))
        }
        ss.setShowSyncArena(true)
        o.setActiveTab('explore')
        triggerHaptic('medium')

        const updated = {
          ...o.currentUserRef.current,
          trainingSyncWith: payload.partnerId,
          syncStartedAt: payload.startedAt,
          syncActions: payload.actions || [],
        }
        o.saveUser(updated as any)
        o.saveUserWithRealSyncRef.current?.(updated as any).catch(() => {})

        o.addNotificationRef.current?.({
          type: 'sync_invite',
          title: ss.syncBondsRef.current[payload.partnerId]
            ? `${payload.partnerName} inició sync contigo`
            : `EntrenaSync con ${payload.partnerName}`,
          body: ss.syncBondsRef.current[payload.partnerId]
            ? 'Tu alianza de sync está en vivo — Arena abierta'
            : 'Tu compañero inició sync contigo — Arena abierta',
          relatedId: payload.partnerId,
        })

        toast.success(
          ss.syncBondsRef.current[payload.partnerId]
            ? `⭐ ${payload.partnerName} te invitó a sync`
            : `EntrenaSync con ${payload.partnerName}`,
          {
            description: ss.syncBondsRef.current[payload.partnerId]
              ? 'Tu alianza está en vivo — abrimos la Arena'
              : 'Tu compañero inició sync contigo',
          }
        )
      },
      onError: () => {},
    })
  }, [
    opts.isDemoMode,
    opts.db,
    opts.firebaseUser?.uid,
    opts.effectiveUserId,
    opts.isFirebaseConfigured,
    opts.authBooting,
  ])

  // Dedicated syncSessions listener for INSTANT actions across devices
  useEffect(() => {
    const o = optsRef.current
    const ss = o.syncSession
    if (
      !ss.syncPartnerId ||
      o.effectiveUserId === 'me' ||
      !o.firebaseUser?.uid ||
      !o.db ||
      o.isDemoMode ||
      !o.isFirebaseConfigured
    ) {
      return undefined
    }

    const sessionId = buildSyncSessionId(o.effectiveUserId, ss.syncPartnerId)
    return attachActiveSyncSessionListener(o.db, sessionId, o.effectiveUserId, {
      onUpdate: (data) => {
        const s = o.syncSession
        if (data.actions != null) {
          s.setSyncActions(normalizeSyncActionsForUi(data.actions))
        }
        if (data.startedAt) s.setSyncStartedAt(data.startedAt)
        if (typeof data.vibe === 'number') {
          s.setSyncVibe(Math.max(0, Math.min(100, data.vibe)))
        }
        if (s.syncPartnerId) {
          s.setSyncRealWitnessCount(
            countExternalWitnesses(data.witnesses, o.effectiveUserId, s.syncPartnerId)
          )
          const exclude = new Set([o.effectiveUserId, s.syncPartnerId, 'me'])
          s.setSyncWitnessIds(
            (Array.isArray(data.witnesses) ? data.witnesses : []).filter(
              (w): w is string => typeof w === 'string' && !exclude.has(w)
            )
          )
          s.setSyncPartnerLiveState(parseParticipantState(data.participantState, s.syncPartnerId))
        }
        if (typeof data.restUntil === 'number' && data.restUntil > Date.now()) {
          s.setSyncRestUntil(data.restUntil)
          s.setSyncRestStartedBy(
            typeof data.restStartedBy === 'string' ? data.restStartedBy : null
          )
        } else {
          s.setSyncRestUntil(null)
          s.setSyncRestStartedBy(null)
        }
      },
      onPartnerAction: (latest) => {
        const s = o.syncSession
        const key = `${latest.at || 0}-${latest.emoji || ''}-${latest.label || ''}`
        const prevToast = lastSyncActionToastRef.current
        if (prevToast?.key === key && Date.now() - prevToast.at < 4000) return
        lastSyncActionToastRef.current = { at: Date.now(), key }
        toast(`${latest.emoji} ${latest.label}`, {
          description: `${o.realProfiles.find((p) => p.id === s.syncPartnerId)?.name || 'Tu compañero'} lo hizo ahora`,
          duration: 2200,
        })
        triggerHaptic('light')
      },
      onError: () => {},
    })
  }, [
    syncPartnerId,
    opts.effectiveUserId,
    opts.firebaseUser?.uid,
    opts.db,
    opts.isDemoMode,
    opts.isFirebaseConfigured,
    opts.realProfiles,
  ])

  // Arena 2.0 — sync live exercise/reps to partner via participantState
  useEffect(() => {
    const o = optsRef.current
    const ss = o.syncSession
    if (!ss.syncPartnerId || !ss.syncStartedAt || o.isDemoMode || !o.db) return
    const t = setTimeout(() => {
      const log = syncWorkoutLogRef.current
      void (async () => {
        try {
          const { doc, updateDoc } = await import('firebase/firestore')
          const sessionId = buildSyncSessionId(o.effectiveUserId, ss.syncPartnerId!)
          await updateDoc(doc(o.db!, 'syncSessions', sessionId), {
            [`participantState.${o.effectiveUserId}`]: toParticipantSyncPayload(log),
            updatedAt: Date.now(),
          })
        } catch {
          /* non-fatal */
        }
      })()
    }, 200)
    return () => clearTimeout(t)
  }, [
    syncWorkoutLog,
    syncPartnerId,
    syncStartedAt,
    opts.effectiveUserId,
    opts.isDemoMode,
    opts.db,
  ])

  // Register as witness when viewing GymPulse/feed/explore while others are in EntrenaSync
  useEffect(() => {
    const o = optsRef.current
    const ss = o.syncSession
    if (o.isDemoMode || !o.db || !o.firebaseUser?.uid || o.effectiveUserId === 'me') return
    const uid = o.firebaseUser.uid
    const shouldScan =
      o.showLiveMap || o.activeTab === 'home' || o.activeTab === 'explore' || o.activeTab === 'map'
    if (!shouldScan) return

    o.liveTrainingNow.forEach((u: any) => {
      const partnerId = u.trainingSyncWith
      if (!partnerId) return
      if (uid === u.id || uid === partnerId) return
      const sessionId = buildSyncSessionId(u.id, partnerId)
      if (ss.witnessedSessionsRef.current.has(sessionId)) return
      ss.witnessedSessionsRef.current.add(sessionId)
      registerSyncWitness(o.db!, sessionId, uid).catch(() => {})
    })
  }, [
    opts.liveTrainingNow,
    opts.showLiveMap,
    opts.activeTab,
    opts.isDemoMode,
    opts.db,
    opts.firebaseUser?.uid,
    opts.effectiveUserId,
  ])

  useEffect(() => {
    const o = optsRef.current
    if (o.activeTab !== 'home' && o.activeTab !== 'explore') return
    loadActiveSyncCount().catch(() => {})
    const t = setInterval(() => loadActiveSyncCount().catch(() => {}), 45000)
    return () => clearInterval(t)
  }, [opts.activeTab, loadActiveSyncCount])

  useEffect(() => {
    opts.startSyncRef.current = startSyncWith
  }, [startSyncWith, opts.startSyncRef])

  useEffect(() => {
    ;(window as any).witnessRipple = witnessRipple
  }, [witnessRipple])

  useEffect(() => {
    ;(window as any).witnessEchoPin = witnessEchoPin
  }, [witnessEchoPin])

  return {
    startSyncWith,
    endSync,
    submitSyncRating,
    tryAutoStartSync,
    witnessRipple,
    witnessEchoPin,
    handleArenaSyncAction,
    handleArenaCapturePhoto,
    startArenaVoicePing,
    persistSyncWorkoutLogToSession,
    loadActiveSyncCount,
    arenaPhotoInputRef,
    arenaPhotoResolverRef,
    isArenaVoiceRecording,
    syncDuelSummary,
    setSyncDuelSummary,
    replaySession,
    setReplaySession,
    activeSyncPairs,
    publishingSyncFeed,
    setPublishingSyncFeed,
  }
}
