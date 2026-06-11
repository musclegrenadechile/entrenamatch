import type { Profile } from '../types'
import { isDeletedProfileData } from './deletedProfile'
import { normalizeTrainingSince } from './gymPulseLive'

export const PROFILE_LIST_LIMIT = 80

export function parseProfileFromFirestoreDoc(
  docId: string,
  data: Record<string, unknown> | null | undefined
): Profile | null {
  if (!data || !data.name || isDeletedProfileData(data)) return null
  return {
    id: docId,
    name: String(data.name),
    age: (data.age as number) || 25,
    gender: (data.gender as Profile['gender']) || 'hombre',
    city: String(data.city || ''),
    country: String(data.country || 'Chile'),
    lat: (data.lat as number) || -33.0,
    lng: (data.lng as number) || -71.0,
    bio: String(data.bio || ''),
    photos: (data.photos as string[]) || [],
    trainingTypes: (data.trainingTypes as string[]) || [],
    goals: (data.goals as string[]) || [],
    level: (data.level as Profile['level']) || 'Intermedio',
    availability: (data.availability as string[]) || ['Tarde'],
    intensity: data.intensity as Profile['intensity'],
    verificationStatus: data.verificationStatus as Profile['verificationStatus'],
    verificationDate: data.verificationDate as number | undefined,
    trainingNow: data.trainingNow === true,
    trainingNowSince: normalizeTrainingSince(data.trainingNowSince),
    liveStreak: data.liveStreak != null ? (data.liveStreak as number) : undefined,
    lastLiveDate: data.lastLiveDate != null ? (data.lastLiveDate as number) : undefined,
    liveJoins: data.liveJoins != null ? (data.liveJoins as number) : undefined,
    joinedLiveStreak:
      data.joinedLiveStreak != null ? (data.joinedLiveStreak as number) : undefined,
    accountStatus: data.accountStatus === 'deleted' ? 'deleted' : undefined,
    dailyTrainingStreak:
      data.dailyTrainingStreak != null ? (data.dailyTrainingStreak as number) : undefined,
    dailySynergyStreak:
      data.dailySynergyStreak != null ? (data.dailySynergyStreak as number) : undefined,
    dailyVoiceStreak:
      data.dailyVoiceStreak != null ? (data.dailyVoiceStreak as number) : undefined,
    dailyPulseStreak:
      data.dailyPulseStreak != null ? (data.dailyPulseStreak as number) : undefined,
    momentumPoints: data.momentumPoints != null ? (data.momentumPoints as number) : undefined,
    lastDailyPulseDate:
      data.lastDailyPulseDate != null ? (data.lastDailyPulseDate as number) : undefined,
    streakProtectedDate: (data.streakProtectedDate as string | null) || null,
    pulseAmplifiedDate: (data.pulseAmplifiedDate as string | null) || null,
    currentDailyChallenge: data.currentDailyChallenge as Profile['currentDailyChallenge'],
    retentionLevel: (data.retentionLevel as number) || 1,
    retentionXp: (data.retentionXp as number) || 0,
    trainingSyncWith: data.trainingSyncWith as string | undefined,
    syncStreak: data.syncStreak != null ? (data.syncStreak as number) : undefined,
    syncBonds: (data.syncBonds as Profile['syncBonds']) || {},
    weekStats: data.weekStats as Profile['weekStats'],
    showOnLeaderboard: data.showOnLeaderboard as boolean | undefined,
    gymCheckIn: data.gymCheckIn as Profile['gymCheckIn'],
    isBetaBot: data.isBetaBot === true,
    communityAdmin: data.communityAdmin === true,
  }
}
