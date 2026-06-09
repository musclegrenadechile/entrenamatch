import { useEffect, useMemo, useState } from 'react'
import { MapPin, Share2, Users } from 'lucide-react'
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

export interface PilotProgramStripProps {
  cityLabel?: string
  db: Firestore | null
  isDemoMode?: boolean
  inviteLink?: string
  onOpenMap?: () => void
}

export function PilotProgramStrip({
  cityLabel,
  db,
  isDemoMode,
  inviteLink,
  onOpenMap,
}: PilotProgramStripProps) {
  const [cohort, setCohort] = useState<PilotCohortDoc | null>(null)
  const cityNorm = normalizeCity(cityLabel)

  useEffect(() => {
    if (!db || !cityNorm || !isOpenPilotCity(cityLabel)) return
    return attachPilotCohortListener(db, cityNorm, setCohort)
  }, [db, cityNorm, cityLabel])

  const progress = useMemo(
    () => pilotCohortProgress(cohort?.memberCount ?? 0),
    [cohort?.memberCount]
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
        return
      }
      await navigator.clipboard.writeText(`${text}\n${url}`)
      toast.success('Invitación copiada')
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
