import { Clock, Radio } from 'lucide-react'
import { BRAND_COPY } from '../../constants/brandCopy'
import { getSyncHourState, shouldShowSyncHourBanner } from '../../services/syncHour'
import { recordPilotDensityEvent } from '../../services/pilotDensityMetrics'
import type { Firestore } from 'firebase/firestore'

export interface SyncHourBannerProps {
  isLive?: boolean
  onOpenMap?: () => void
  onActivateLive?: () => void
  compact?: boolean
  db?: Firestore | null
  city?: string | null
  isDemoMode?: boolean
}

export function SyncHourBanner({
  isLive = false,
  onOpenMap,
  onActivateLive,
  compact = false,
  db = null,
  city = null,
  isDemoMode = false,
}: SyncHourBannerProps) {
  if (!shouldShowSyncHourBanner()) return null

  const state = getSyncHourState()

  const body = state.active
    ? BRAND_COPY.syncHour.activeBody
    : state.nextSlotLabel
      ? BRAND_COPY.syncHour.upcomingBody(state.nextSlotLabel)
      : BRAND_COPY.syncHour.activeBody

  const ctaLabel = state.active || isLive ? BRAND_COPY.syncHour.cta : BRAND_COPY.syncHour.ctaExplore
  const onCta = () => {
    void recordPilotDensityEvent(db, {
      city,
      kind: 'sync_hour_cta',
      isDemoMode,
    })
    if (state.active || isLive) onOpenMap?.()
    else onActivateLive?.()
  }

  return (
    <div
      className={`rounded-2xl border border-[#22c55e]/35 bg-gradient-to-r from-[#0a1f14]/90 to-[#141418] ${
        compact ? 'p-3 mb-3' : 'p-4 mb-4'
      }`}
      role="status"
      aria-label={BRAND_COPY.syncHour.title}
    >
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
            state.active ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#FF671F]/15 text-[#FF671F]'
          }`}
        >
          {state.active ? <Radio size={18} aria-hidden /> : <Clock size={18} aria-hidden />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-[#22c55e] font-bold">
            {BRAND_COPY.syncHour.title}
            {state.active && state.endsInMinutes != null && (
              <span className="text-[#9CA3AF] font-semibold normal-case tracking-normal ml-1.5">
                · {state.endsInMinutes} min restantes
              </span>
            )}
          </p>
          <p className={`text-white font-semibold mt-0.5 ${compact ? 'text-[11px]' : 'text-xs'} leading-snug`}>
            {body}
          </p>
        </div>
      </div>
      {(onOpenMap || onActivateLive) && (
        <button
          type="button"
          onClick={onCta}
          className={`mt-2.5 w-full py-2 rounded-xl bg-[#22c55e] text-black font-bold active:opacity-90 ${
            compact ? 'text-[11px]' : 'text-xs'
          }`}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
