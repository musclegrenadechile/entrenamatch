import { useEffect, useMemo, useState } from 'react'
import { MapPin, Share2, Users, RefreshCw, Activity } from 'lucide-react'
import { toast } from 'sonner'
import {
  isOpenPilotCity,
  PILOT_PROGRAM_TITLE,
  PILOT_TARGET_MAU_MIN,
} from '../../constants/pilotProgram'
import { resolveShareableAppBase, sanitizeShareUrl } from '../../utils/sparseCityDefaults'
import {
  attachPilotCohortListener,
  pilotCohortProgress,
  type PilotCohortDoc,
} from '../../services/pilotCohort'
import { normalizeCity } from '../../services/localNetwork'
import type { Firestore } from 'firebase/firestore'
import { getWeekKey } from '../../utils/weekLiveTracker'
import {
  attachPilotDensityListener,
  computePilotDensityHealth,
  recordPilotDensityEvent,
  type PilotDensityWeeklyDoc,
} from '../../services/pilotDensityMetrics'
import {
  attachPilotWeeklyMetricsListener,
  type PilotWeeklyMetricsDoc,
} from '../../services/pilotSyncMetrics'

export interface PilotProgramStripProps {
  cityLabel?: string
  db: Firestore | null
  isDemoMode?: boolean
  inviteLink?: string
  onOpenMap?: () => void
  liveCount?: number
}

export function PilotProgramStrip({
  cityLabel,
  db,
  isDemoMode,
  inviteLink,
  onOpenMap,
  liveCount = 0,
}: PilotProgramStripProps) {
  const [cohort, setCohort] = useState<PilotCohortDoc | null>(null)
  const [weeklySync, setWeeklySync] = useState<PilotWeeklyMetricsDoc | null>(null)
  const [density, setDensity] = useState<PilotDensityWeeklyDoc | null>(null)
  const cityNorm = normalizeCity(cityLabel)
  const weekKey = getWeekKey()

  useEffect(() => {
    if (!db || !cityNorm || !isOpenPilotCity(cityLabel)) return
    const u1 = attachPilotCohortListener(db, cityNorm, setCohort)
    const u2 = attachPilotWeeklyMetricsListener(db, cityNorm, weekKey, setWeeklySync)
    const u3 = attachPilotDensityListener(db, cityNorm, weekKey, setDensity)
    return () => {
      u1()
      u2()
      u3()
    }
  }, [db, cityNorm, cityLabel, weekKey])

  const progress = useMemo(
    () => pilotCohortProgress(cohort?.memberCount ?? 0),
    [cohort?.memberCount]
  )

  const health = useMemo(
    () =>
      computePilotDensityHealth({
        memberCount: cohort?.memberCount ?? 0,
        weeklySyncs: weeklySync?.realSyncCount ?? 0,
        weeklyInvites: density?.invitesShared ?? 0,
        liveNow: liveCount,
      }),
    [cohort?.memberCount, weeklySync?.realSyncCount, density?.invitesShared, liveCount]
  )

  if (!isOpenPilotCity(cityLabel)) return null

  const day = new Date().getDay()
  const isWeekendPush = day === 5 || day === 6 || day === 0

  const shareInvite = async () => {
    const url = sanitizeShareUrl(inviteLink || resolveShareableAppBase())
    const text = `Únete al piloto ${PILOT_PROGRAM_TITLE} en EntrenaMatch — entrena en sync con gente de ${cityLabel || 'tu ciudad'}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'EntrenaMatch Piloto', text, url })
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        toast.success('Invitación copiada')
      }
      void recordPilotDensityEvent(db, {
        city: cityLabel,
        kind: 'invite_shared',
        isDemoMode,
      })
    } catch {
      toast.error('No se pudo compartir')
    }
  }

  return (
    <section
      className="pilot-program-strip rounded-2xl border border-[#FF671F]/35 bg-gradient-to-r from-[#1a1208] to-[#0d1a12] p-4 mb-4"
      aria-label="Programa piloto"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-[#FF671F] font-bold">
            {PILOT_PROGRAM_TITLE}
          </p>
          <p className="text-sm font-semibold text-white mt-0.5">
            {cityLabel} · acceso anticipado
          </p>
          <p className="text-[11px] text-[#9CA3AF] mt-1">{progress.label}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[#22c55e] shrink-0">
          <Users size={16} aria-hidden />
          <span className="text-lg font-black tabular-nums">{cohort?.memberCount ?? '—'}</span>
        </div>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-[#2F2F35] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#FF671F] to-[#22c55e] transition-all"
          style={{ width: `${progress.pct}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-black/25 border border-white/8 px-2 py-2">
          <RefreshCw size={12} className="mx-auto text-[#60a5fa] mb-0.5" aria-hidden />
          <p className="text-sm font-black text-white tabular-nums">
            {weeklySync?.realSyncCount ?? 0}
          </p>
          <p className="text-[8px] text-[#9CA3AF]">syncs sem.</p>
        </div>
        <div className="rounded-xl bg-black/25 border border-white/8 px-2 py-2">
          <Share2 size={12} className="mx-auto text-[#22c55e] mb-0.5" aria-hidden />
          <p className="text-sm font-black text-white tabular-nums">
            {density?.invitesShared ?? 0}
          </p>
          <p className="text-[8px] text-[#9CA3AF]">invites</p>
        </div>
        <div className="rounded-xl bg-black/25 border border-white/8 px-2 py-2">
          <Activity size={12} className="mx-auto text-[#FF671F] mb-0.5" aria-hidden />
          <p className="text-sm font-black text-white tabular-nums">{liveCount}</p>
          <p className="text-[8px] text-[#9CA3AF]">LIVE ahora</p>
        </div>
      </div>

      <p
        className={`text-[10px] mt-2 font-semibold ${
          health.health === 'active'
            ? 'text-[#22c55e]'
            : health.health === 'warming'
              ? 'text-[#FF671F]'
              : 'text-[#9CA3AF]'
        }`}
      >
        {health.label}
      </p>

      <p className="text-[9px] text-[#6B7280] mt-1">
        Meta piloto: {PILOT_TARGET_MAU_MIN}–200 usuarios por ciudad · sync real semanal
      </p>

      {isWeekendPush && onOpenMap && (
        <button
          type="button"
          onClick={onOpenMap}
          className="mt-3 w-full py-2 rounded-xl border border-white/15 text-white text-[11px] font-semibold flex items-center justify-center gap-2 active:bg-white/10"
        >
          <MapPin size={14} className="text-[#22c55e]" />
          Ver mapa del piloto →
        </button>
      )}

      {!isDemoMode && (
        <button
          type="button"
          onClick={() => void shareInvite()}
          className="mt-2 w-full py-2.5 rounded-xl bg-[#22c55e] text-black text-xs font-bold flex items-center justify-center gap-2 active:brightness-90"
        >
          <Share2 size={14} />
          Invitar del gym — suma a {cityLabel?.split(' ')[0] || 'tu ciudad'}
        </button>
      )}
    </section>
  )
}
