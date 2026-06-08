import type { PartnerLocation } from '../../types'

export type GymPulsePopupState =
  | { kind: 'live'; user: Record<string, unknown> }
  | { kind: 'partner'; partner: PartnerLocation; liveAtGym: number; checkedInUsers: Array<{ id: string; name?: string; photos?: string[] }> }
  | { kind: 'cluster'; count: number; lat: number; lng: number; clusterId?: number }
  | { kind: 'sync'; nameA: string; nameB: string; syncMins: number; inRed: boolean }
