/** Daily Pulse / retention / sync graph types (shared across App + profile modules). */

export interface DailyChallenge {
  id: string
  type: 'solo' | 'bond' | 'pulse' | string
  title: string
  description: string
  icon?: string
  target: number
  progress?: number
  reward: number
  actionLabel?: string
  completed?: boolean
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

export interface SyncBond {
  totalMin: number
  sessions: number
  avgRating: number
  bondLevel: number
  name?: string
}

export interface NetworkStats {
  networkPower: number
  totalMin: number
  totalSessions: number
  estimatedImpact: number
  numPartners: number
}

export interface RetentionGadget {
  level: number
  name: string
  icon: string
  desc: string
  effect: string
}
