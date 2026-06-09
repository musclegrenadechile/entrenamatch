/** Pure GymPulse session helpers (fase 224 — extracted from App.tsx). */

import {
  computeRetentionLevel,
  generateDailyChallenge,
  getTodayStr,
} from './dailyPulseCore'

export interface DailyChallenge {
  id: string
  type: string
  title: string
  description?: string
  target: number
  progress?: number
  completed?: boolean
  reward: number
  icon?: string
}

export interface DailyPulseState {
  trainingStreak: number
  synergyStreak: number
  voiceStreak: number
  pulseStreak: number
  momentum: number
  lastDate: string | null
  currentChallenge: DailyChallenge | null
  longestTraining: number
  longestSynergy: number
  longestVoice: number
  longestPulse: number
  level: number
  xp: number
  streakProtectedDate?: string | null
  pulseAmplifiedDate?: string | null
}

export interface DailyPulseUserFields {
  lastDailyPulseDate?: string | null
  dailyTrainingStreak?: number
  dailySynergyStreak?: number
  dailyVoiceStreak?: number
  dailyPulseStreak?: number
  momentumPoints?: number
  longestDailyTraining?: number
  longestDailySynergy?: number
  longestDailyVoice?: number
  longestDailyPulse?: number
  currentDailyChallenge?: DailyChallenge | null
  streakProtectedDate?: string | null
  pulseAmplifiedDate?: string | null
  retentionLevel?: number
  retentionXp?: number
}

export function readPulseFieldsFromUser(
  u: DailyPulseUserFields,
  dailyPulse: DailyPulseState | null
) {
  return {
    last: dailyPulse?.lastDate || u.lastDailyPulseDate || null,
    currentStreak: dailyPulse?.trainingStreak ?? u.dailyTrainingStreak ?? 0,
    currentSynergy: dailyPulse?.synergyStreak ?? u.dailySynergyStreak ?? 0,
    currentVoice: dailyPulse?.voiceStreak ?? u.dailyVoiceStreak ?? 0,
    currentPulse: dailyPulse?.pulseStreak ?? u.dailyPulseStreak ?? 0,
    mom: dailyPulse?.momentum ?? u.momentumPoints ?? 0,
    longTrain: dailyPulse?.longestTraining ?? u.longestDailyTraining ?? 0,
    longSyn: dailyPulse?.longestSynergy ?? u.longestDailySynergy ?? 0,
    longVoice: dailyPulse?.longestVoice ?? u.longestDailyVoice ?? 0,
    longPulse: dailyPulse?.longestPulse ?? u.longestDailyPulse ?? 0,
    streakProtectedDate:
      dailyPulse?.streakProtectedDate ?? u.streakProtectedDate ?? null,
    pulseAmplifiedDate: dailyPulse?.pulseAmplifiedDate ?? u.pulseAmplifiedDate ?? null,
  }
}

export function rollTrainingStreak(
  last: string | null,
  today: string,
  currentStreak: number,
  isProtected: boolean
): number {
  if (last === today) return currentStreak
  if (!last) return 1

  const lastD = new Date(`${last}T12:00:00`)
  const todayD = new Date(`${today}T12:00:00`)
  const yest = new Date(todayD)
  yest.setDate(yest.getDate() - 1)

  if (lastD.toDateString() === yest.toDateString() && !isProtected) {
    return currentStreak + 1
  }
  if (isProtected) return currentStreak
  return 1
}

export function buildNewDayPulse(
  u: { id?: string } & DailyPulseUserFields,
  dailyPulse: DailyPulseState | null,
  syncBonds: Record<string, unknown>,
  networkPower: number,
  today = getTodayStr()
): { pulse: DailyPulseState; userUpdate: Record<string, unknown> } {
  const fields = readPulseFieldsFromUser(u, dailyPulse)
  const isProtected = fields.streakProtectedDate === today
  const newStreak = rollTrainingStreak(
    fields.last,
    today,
    fields.currentStreak,
    isProtected
  )
  const challenge = generateDailyChallenge(u, syncBonds, [], networkPower)
  const { level, xp } = computeRetentionLevel(
    fields.mom,
    newStreak,
    fields.currentSynergy,
    fields.currentVoice,
    fields.currentPulse,
    networkPower
  )

  const pulse: DailyPulseState = {
    trainingStreak: newStreak,
    synergyStreak: fields.currentSynergy,
    voiceStreak: fields.currentVoice,
    pulseStreak: fields.currentPulse,
    momentum: fields.mom,
    lastDate: today,
    currentChallenge: challenge,
    longestTraining: Math.max(fields.longTrain, newStreak),
    longestSynergy: fields.longSyn,
    longestVoice: Math.max(fields.longVoice, fields.currentVoice),
    longestPulse: Math.max(fields.longPulse, fields.currentPulse),
    level,
    xp,
    streakProtectedDate: fields.streakProtectedDate,
    pulseAmplifiedDate: fields.pulseAmplifiedDate,
  }

  const userUpdate = {
    dailyTrainingStreak: newStreak,
    dailySynergyStreak: fields.currentSynergy,
    dailyVoiceStreak: fields.currentVoice,
    dailyPulseStreak: fields.currentPulse,
    momentumPoints: fields.mom,
    lastDailyPulseDate: today,
    currentDailyChallenge: challenge,
    retentionLevel: level,
    retentionXp: xp,
    streakProtectedDate: fields.streakProtectedDate,
    pulseAmplifiedDate: fields.pulseAmplifiedDate,
  }

  return { pulse, userUpdate }
}

export function hydrateDailyPulseFromUser(
  u: DailyPulseUserFields,
  syncBonds: Record<string, unknown>,
  networkPower: number
): DailyPulseState {
  const fields = readPulseFieldsFromUser(u, null)
  const existingChallenge = u.currentDailyChallenge
  const { level, xp } = computeRetentionLevel(
    fields.mom,
    fields.currentStreak,
    fields.currentSynergy,
    fields.currentVoice,
    fields.currentPulse,
    networkPower
  )
  return {
    trainingStreak: fields.currentStreak,
    synergyStreak: fields.currentSynergy,
    voiceStreak: fields.currentVoice,
    pulseStreak: fields.currentPulse,
    momentum: fields.mom,
    lastDate: fields.last,
    currentChallenge:
      existingChallenge || generateDailyChallenge(u, syncBonds, [], networkPower),
    longestTraining: fields.longTrain,
    longestSynergy: fields.longSyn,
    longestVoice: fields.longVoice,
    longestPulse: fields.longPulse,
    level,
    xp,
    streakProtectedDate: fields.streakProtectedDate,
    pulseAmplifiedDate: fields.pulseAmplifiedDate,
  }
}

export function advanceChallengeProgress(
  pulse: DailyPulseState,
  progressInc: number,
  networkPower: number
) {
  if (!pulse.currentChallenge) {
    return { updatedPulse: pulse, justCompleted: false, levelBonus: 0, prevLevel: pulse.level || 1 }
  }
  const ch = { ...pulse.currentChallenge }
  ch.progress = Math.min(ch.target, (ch.progress || 0) + progressInc)
  const justCompleted = ch.progress >= ch.target && !ch.completed
  const prevLevel = pulse.level || 1
  const levelBonus = justCompleted ? Math.round(ch.reward * (1 + (prevLevel - 1) * 0.08)) : 5
  const newMomentum = pulse.momentum + levelBonus
  const updatedPulse: DailyPulseState = {
    ...pulse,
    momentum: newMomentum,
    currentChallenge: { ...ch, completed: justCompleted ? true : ch.completed },
  }
  const { level, xp } = computeRetentionLevel(
    newMomentum,
    updatedPulse.trainingStreak,
    updatedPulse.synergyStreak,
    updatedPulse.voiceStreak,
    updatedPulse.pulseStreak,
    networkPower
  )
  updatedPulse.level = level
  updatedPulse.xp = xp
  return { updatedPulse, justCompleted, levelBonus, prevLevel, computedLevel: level }
}
