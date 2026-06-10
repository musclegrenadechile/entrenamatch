import { useEffect, useMemo, useState } from 'react'
import { Activity, RefreshCw, Users } from 'lucide-react'
import type { Firestore } from 'firebase/firestore'
import { PILOT_CITY_OPTIONS, PILOT_TARGET_MAU_MIN } from '../../constants/pilotProgram'
import { getWeekKey } from '../../utils/weekLiveTracker'
import { attachPilotCohortListener, type PilotCohortDoc } from '../../services/pilotCohort'
import {
  attachPilotDensityListener,
  computePilotDensityHealth,
  type PilotDensityWeeklyDoc,
} from '../../services/pilotDensityMetrics'
import {
  attachPilotWeeklyMetricsListener,
  type PilotWeeklyMetricsDoc,
} from '../../services/pilotSyncMetrics'

export interface PilotMetricsPanelProps {
  db: Firestore | null
  liveNowTotal?: number
}

type CityRow = {
  cityLabel: string
  cityNorm: string
  cohort: PilotCohortDoc | null
  sync: PilotWeeklyMetricsDoc | null
  density: PilotDensityWeeklyDoc | null
}

export function PilotMetricsPanel({ db, liveNowTotal = 0 }: PilotMetricsPanelProps) {
  const weekKey = getWeekKey()
  const [rows, setRows] = useState<CityRow[]>(() =>
    PILOT_CITY_OPTIONS.map((c) => ({
      cityLabel: c.label,
      cityNorm: c.norm,
      cohort: null,
      sync: null,
      density: null,
    }))
  )

  useEffect(() => {
    if (!db) return
    const unsubs = PILOT_CITY_OPTIONS.map((city, idx) => {
      const patch = (patch: Partial<CityRow>) => {
        setRows((prev) => {
          const next = [...prev]
          next[idx] = { ...next[idx], ...patch }
          return next
        })
      }
      const u1 = attachPilotCohortListener(db, city.norm, (cohort) => patch({ cohort }))
      const u2 = attachPilotWeeklyMetricsListener(db, city.norm, weekKey, (sync) =>
        patch({ sync })
      )
      const u3 = attachPilotDensityListener(db, city.norm, weekKey, (density) =>
        patch({ density })
      )
      return () => {
        u1()
        u2()
        u3()
      }
    })
    return () => unsubs.forEach((u) => u())
  }, [db, weekKey])

  const totals = useMemo(() => {
    let members = 0
    let syncs = 0
    let invites = 0
    for (const r of rows) {
      members += r.cohort?.memberCount ?? 0
      syncs += r.sync?.realSyncCount ?? 0
      invites += r.density?.invitesShared ?? 0
    }
    return { members, syncs, invites }
  }, [rows])

  if (!db) {
    return (
      <p className="admin-ops__empty">
        Firebase no disponible — métricas piloto solo en cuentas reales.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="admin-ops__stat">
          <Users size={16} />
          <strong>{totals.members}</strong>
          <span>miembros</span>
        </div>
        <div className="admin-ops__stat">
          <RefreshCw size={16} />
          <strong>{totals.syncs}</strong>
          <span>syncs sem.</span>
        </div>
        <div className="admin-ops__stat">
          <Activity size={16} />
          <strong>{liveNowTotal}</strong>
          <span>LIVE ahora</span>
        </div>
      </div>

      <p className="text-[10px] text-[#9CA3AF]">
        Semana {weekKey} · meta {PILOT_TARGET_MAU_MIN} MAU/ciudad · {totals.invites} invitaciones
        compartidas
      </p>

      <div className="space-y-2">
        {rows.map((row) => {
          const members = row.cohort?.memberCount ?? 0
          const syncs = row.sync?.realSyncCount ?? 0
          const invites = row.density?.invitesShared ?? 0
          const qr = row.density?.gymQrOpens ?? 0
          const health = computePilotDensityHealth({
            memberCount: members,
            weeklySyncs: syncs,
            weeklyInvites: invites,
          })
          return (
            <article
              key={row.cityNorm}
              className="rounded-xl border border-white/10 bg-black/30 p-3 text-[11px]"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <strong className="text-white">{row.cityLabel}</strong>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    health.health === 'active'
                      ? 'bg-[#22c55e]/20 text-[#22c55e]'
                      : health.health === 'warming'
                        ? 'bg-[#FF671F]/20 text-[#FF671F]'
                        : 'bg-white/10 text-[#9CA3AF]'
                  }`}
                >
                  {health.health}
                </span>
              </div>
              <p className="text-[#9CA3AF] mb-2">{health.label}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[#d1d5db]">
                <span>Miembros: {members}</span>
                <span>Activos 7d: {row.cohort?.activeLast7d ?? 0}</span>
                <span>Syncs: {syncs}</span>
                <span>Min sync: {row.sync?.totalSyncMinutes ?? 0}</span>
                <span>Invites: {invites}</span>
                <span>QR gym: {qr}</span>
              </div>
            </article>
          )
        })}
      </div>

      <p className="text-[9px] text-[#6B7280] leading-snug">
        CLI: <code>node scripts/pilot-density-report.mjs</code>
      </p>
    </div>
  )
}
