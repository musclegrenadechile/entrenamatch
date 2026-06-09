import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { toast } from 'sonner'
import type { CurrentUser } from '../types'
import { getTodayStr, getUnlockedGadgets } from '../utils/dailyPulseCore'
import { gadgetDisplayName } from '../utils/genderedCopy'
import {
  advanceChallengeProgress,
  buildNewDayPulse,
  hydrateDailyPulseFromUser,
  type DailyPulseState,
} from '../utils/dailyPulseSession'
import { triggerHaptic } from '../utils/haptics'

export type { DailyPulseState } from '../utils/dailyPulseSession'

export interface DailyPulseBridge {
  dailyPulse: DailyPulseState | null
  dailyPulseRef: RefObject<DailyPulseState | null>
  setDailyPulse: React.Dispatch<React.SetStateAction<DailyPulseState | null>>
  checkAndUpdateDailyPulse: (forceUser?: CurrentUser) => void
  refreshDailyPulse: () => void
  completeDailyChallenge: (progressInc?: number, baseUser?: CurrentUser) => Promise<void>
  awardConstancy: (amount: number, reason: string, baseUser?: CurrentUser) => void
}

export interface UseDailyPulseOptions {
  currentUser: CurrentUser | null
  currentUserRef: RefObject<CurrentUser | null>
  syncBonds: Record<string, { bondLevel?: number }>
  networkPower: number
  saveUserWithRealSyncRef: RefObject<(user: CurrentUser) => Promise<unknown>>
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>
  createProfilePostRef: RefObject<
    (text: string, photo: string | null, type: string) => Promise<unknown>
  >
  triggerConfettiRef?: RefObject<(() => void) | undefined>
  bridgeRef?: RefObject<DailyPulseBridge | null>
}

/** Fase 224 — GymPulse Diario state + actions outside App.tsx */
export function useDailyPulse({
  currentUser,
  currentUserRef,
  syncBonds,
  networkPower,
  saveUserWithRealSyncRef,
  setNotifications,
  createProfilePostRef,
  triggerConfettiRef,
  bridgeRef,
}: UseDailyPulseOptions) {
  const [dailyPulse, setDailyPulse] = useState<DailyPulseState | null>(null)
  const [showDailyPulseBanner, setShowDailyPulseBanner] = useState(false)
  const dailyPulseRef = useRef<DailyPulseState | null>(null)
  useEffect(() => {
    dailyPulseRef.current = dailyPulse
  }, [dailyPulse])

  const checkAndUpdateDailyPulse = useCallback(
    (forceUser?: CurrentUser) => {
      const u = forceUser || currentUser
      if (!u) return

      const today = getTodayStr()
      const last =
        dailyPulse?.lastDate || (u as any).lastDailyPulseDate || null

      if (last !== today) {
        const { pulse, userUpdate } = buildNewDayPulse(
          u as any,
          dailyPulse,
          syncBonds,
          networkPower,
          today
        )
        setDailyPulse(pulse)
        saveUserWithRealSyncRef.current?.({ ...u, ...userUpdate } as CurrentUser).catch((e) =>
          console.warn('[DailyPulse] sync failed', e)
        )

        toast.success('¡Nuevo GymPulse Diario!', {
          description: `${pulse.currentChallenge?.icon || '🔥'} ${pulse.currentChallenge?.title} • +${pulse.currentChallenge?.reward} Constancia para tu red fitness`,
        })

        const notif = {
          id: 'pulse-' + today,
          type: 'daily_pulse',
          title: 'GymPulse Diario listo',
          body: `${pulse.currentChallenge?.icon || '🔥'} ${pulse.currentChallenge?.title} — completalo hoy para tu Red`,
          timestamp: Date.now(),
          read: false,
          data: { challengeId: pulse.currentChallenge?.id },
        }
        setNotifications((prev) => [notif, ...prev].slice(0, 50))
      } else if (!dailyPulse) {
        setDailyPulse(hydrateDailyPulseFromUser(u as any, syncBonds, networkPower))
      }
    },
    [currentUser, dailyPulse, syncBonds, networkPower, saveUserWithRealSyncRef, setNotifications]
  )

  const refreshDailyPulse = useCallback(
    () => checkAndUpdateDailyPulse(),
    [checkAndUpdateDailyPulse]
  )

  const awardConstancy = useCallback(
    (amount: number, reason: string, baseUser?: CurrentUser) => {
      if (!dailyPulse) return
      const base = baseUser ?? currentUserRef.current ?? currentUser
      if (!base) return
      const newM = (dailyPulse.momentum || 0) + amount
      const up = { ...dailyPulse, momentum: newM }
      setDailyPulse(up)
      saveUserWithRealSyncRef.current?.({
        ...(base as any),
        momentumPoints: newM,
        streakProtectedDate: dailyPulse?.streakProtectedDate,
        pulseAmplifiedDate: dailyPulse?.pulseAmplifiedDate,
      } as CurrentUser).catch((e) => console.warn('[Constancy] sync failed', e))
      toast(`+${amount} Constancia`, { description: reason })
    },
    [dailyPulse, currentUser, currentUserRef, saveUserWithRealSyncRef]
  )

  const completeDailyChallenge = useCallback(
    async (progressInc = 1, baseUser?: CurrentUser) => {
      if (!dailyPulse || !dailyPulse.currentChallenge) return

      const { updatedPulse, justCompleted, levelBonus, prevLevel, computedLevel } =
        advanceChallengeProgress(dailyPulse, progressInc, networkPower)
      setDailyPulse(updatedPulse)

      if (justCompleted && computedLevel > prevLevel) {
        try {
          triggerHaptic('success')
        } catch {}
        try {
          triggerConfettiRef?.current?.()
        } catch {}
        const newGadgets = getUnlockedGadgets(computedLevel).filter((g) => g.level > prevLevel)
        const gender = user.gender
        const gadgetText =
          newGadgets.length > 0
            ? ` + ${newGadgets.map((g) => gadgetDisplayName(g.name, gender)).join(', ')} disponible(s)!`
            : ''
        toast.success(`¡Subiste a NIVEL ${computedLevel}!`, {
          description: `Perk permanente: +8% Constancia en desafíos. ${gadgetText} ¡Tu constancia sube!`,
        })
        createProfilePostRef.current?.(
          `⭐ ¡NIVEL ${computedLevel} DE RETENCIÓN! Mi constancia diaria hace fuerte a toda la Red.${newGadgets.length ? ' Gadget: ' + gadgetDisplayName(newGadgets[0].name, gender) : ''}`,
          null,
          'dailyPulse'
        ).catch(() => {})
      }

      const u = (baseUser ?? currentUserRef.current ?? currentUser) as CurrentUser | null
      if (!u) return
      const update: Record<string, unknown> = {
        momentumPoints: updatedPulse.momentum,
        currentDailyChallenge: updatedPulse.currentChallenge,
        dailyTrainingStreak: updatedPulse.trainingStreak,
        dailySynergyStreak: updatedPulse.synergyStreak,
        dailyVoiceStreak: updatedPulse.voiceStreak,
        dailyPulseStreak: updatedPulse.pulseStreak,
        retentionLevel: updatedPulse.level,
        retentionXp: updatedPulse.xp,
        streakProtectedDate: updatedPulse.streakProtectedDate || null,
        pulseAmplifiedDate: updatedPulse.pulseAmplifiedDate || null,
      }
      saveUserWithRealSyncRef.current?.({ ...u, ...update } as CurrentUser)

      if (justCompleted) {
        const ch = updatedPulse.currentChallenge!
        try {
          triggerHaptic('success')
        } catch {}
        toast.success(`¡GymPulse completado! +${levelBonus} Constancia`, {
          description: `${ch.icon || '✅'} ${ch.title} • Nivel ${dailyPulse.level} • Tu Red se fortalece`,
        })

        const postText = `✅ Completé mi reto diario: ${ch.title}. ${ch.description || ''} — Constancia para mi red fitness 🔥`
        try {
          await createProfilePostRef.current?.(postText, null, 'dailyPulse')
        } catch {}

        if (ch.type === 'bond' || ch.type === 'network') {
          const partnerId = Object.keys(syncBonds || {})[0]
          if (partnerId) {
            const bonus = Math.floor(ch.reward / 2)
            toast(`+${bonus} Constancia compartida con tu Red`, {
              description: 'El impacto se multiplica',
            })
          }
        }

        let pulseAfter = updatedPulse
        if (pulseAfter.synergyStreak < pulseAfter.trainingStreak) {
          const newSyn = pulseAfter.synergyStreak + 1
          pulseAfter = { ...pulseAfter, synergyStreak: newSyn }
          setDailyPulse(pulseAfter)
          saveUserWithRealSyncRef.current?.({
            ...(currentUser as any),
            dailySynergyStreak: newSyn,
            streakProtectedDate: pulseAfter.streakProtectedDate,
            pulseAmplifiedDate: pulseAfter.pulseAmplifiedDate,
          } as CurrentUser)
        }

        const newPulseSt = (pulseAfter.pulseStreak || 0) + 1
        const pUpdate = {
          ...pulseAfter,
          pulseStreak: newPulseSt,
          longestPulse: Math.max(pulseAfter.longestPulse || 0, newPulseSt),
        }
        setDailyPulse(pUpdate)
        saveUserWithRealSyncRef.current?.({
          ...(currentUser as any),
          dailyPulseStreak: newPulseSt,
          streakProtectedDate: pulseAfter.streakProtectedDate,
          pulseAmplifiedDate: pulseAfter.pulseAmplifiedDate,
        } as CurrentUser)

        const streak = pUpdate.trainingStreak
        if (streak > 0 && streak % 7 === 0) {
          const bonus = 150
          const milUpdate = { ...pUpdate, momentum: (pUpdate.momentum || 0) + bonus }
          setDailyPulse(milUpdate)
          saveUserWithRealSyncRef.current?.({
            ...(currentUser as any),
            momentumPoints: milUpdate.momentum,
            streakProtectedDate: pulseAfter.streakProtectedDate,
            pulseAmplifiedDate: pulseAfter.pulseAmplifiedDate,
          } as CurrentUser)
          toast.success(`¡Milestone de Streak! +${bonus} Constancia`, {
            description: `${streak}d de racha activa — ¡Sigue así!`,
          })
          createProfilePostRef.current?.(
            `🔥 RACHA ${streak}d — Mi red fitness me hace imparable. Reto diario completado.`,
            null,
            'dailyPulse'
          ).catch(() => {})
        }
      } else {
        toast(`+${progressInc} progreso en el GymPulse`)
      }
    },
    [
      dailyPulse,
      networkPower,
      syncBonds,
      currentUser,
      currentUserRef,
      saveUserWithRealSyncRef,
      createProfilePostRef,
    ]
  )

  useEffect(() => {
    if (currentUser) {
      const t = setTimeout(() => {
        checkAndUpdateDailyPulse()
        const today = getTodayStr()
        const last = dailyPulse?.lastDate
        if (
          last !== today ||
          (dailyPulse && dailyPulse.trainingStreak > 0 && !currentUser.trainingNow)
        ) {
          setShowDailyPulseBanner(true)
          setTimeout(() => setShowDailyPulseBanner(false), 8000)
        }
      }, 600)
      return () => clearTimeout(t)
    }
  }, [currentUser?.id, Object.keys(syncBonds).length, dailyPulse?.lastDate, checkAndUpdateDailyPulse])

  useEffect(() => {
    if (!dailyPulse || !currentUser) return
    const hour = new Date().getHours()
    if (
      hour >= 18 &&
      dailyPulse.trainingStreak > 0 &&
      !currentUser.trainingNow &&
      dailyPulse.streakProtectedDate !== getTodayStr()
    ) {
      const timer = setTimeout(() => {
        toast.error('¡Streak en riesgo esta noche!', {
          description: `Tu ${dailyPulse.trainingStreak}d training streak se resetea si no entrenas. Protege con Constancia o 20min ya.`,
        })
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [dailyPulse?.lastDate, currentUser?.trainingNow, dailyPulse?.trainingStreak, currentUser])

  const bridge: DailyPulseBridge = {
    dailyPulse,
    dailyPulseRef,
    setDailyPulse,
    checkAndUpdateDailyPulse,
    refreshDailyPulse,
    completeDailyChallenge,
    awardConstancy,
  }

  useEffect(() => {
    if (bridgeRef) bridgeRef.current = bridge
  })

  return {
    dailyPulse,
    setDailyPulse,
    dailyPulseRef,
    showDailyPulseBanner,
    setShowDailyPulseBanner,
    checkAndUpdateDailyPulse,
    refreshDailyPulse,
    completeDailyChallenge,
    awardConstancy,
  }
}
