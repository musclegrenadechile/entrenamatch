import { MapPin, Share2, Shield, Swords, Trophy, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import type { CityDerbyState } from '../../services/cityDerby'
import { buildCityDerby, DERBY_AWAY, DERBY_HOME } from '../../services/cityDerby'
import { DerbyDefenderBadge } from './DerbyDefenderBadge'
import type { ProfileGender } from '../../utils/genderedCopy'
import { shareDerbyStory } from '../../utils/derbyStoryShare'
import { BRAND_COPY } from '../../constants/brandCopy'
import { DerbyCityTooltip } from './DerbyCityTooltip'
import { recordPilotDensityEvent } from '../../services/pilotDensityMetrics'
import type { Firestore } from 'firebase/firestore'
import {
  getZoneEventCountdown,
  getZoneEventPhase,
  isZoneScoringActive,
  zoneEventPhaseKicker,
  zoneEventStatusLine,
  zoneEventTeamCta,
  type ZoneEventPhase,
} from '../../services/zoneEventPhase'

export interface CityDerbyCardProps {
  derby: CityDerbyState | null
  onOpenMap?: () => void
  userGender?: ProfileGender
  userCity?: string | null
  inviteLink?: string
  db?: Firestore | null
  isDemoMode?: boolean
}

function phaseCardClass(phase: ZoneEventPhase): string {
  if (phase === 'celebration') {
    return 'border-[#FFD700]/45 bg-gradient-to-br from-[#1f1a08] via-[#141418] to-[#0a1218]'
  }
  if (phase === 'armistice') {
    return 'border-[#60a5fa]/35 bg-gradient-to-br from-[#0a1018] via-[#141418] to-[#0a1218]'
  }
  return 'border-[#FF671F]/40 bg-gradient-to-br from-[#1a0f08] via-[#141418] to-[#0a1218]'
}

function phaseIcon(phase: ZoneEventPhase) {
  if (phase === 'celebration') return Shield
  return Swords
}

export function CityDerbyCard({
  derby,
  onOpenMap,
  userGender,
  userCity,
  inviteLink,
  db = null,
  isDemoMode = false,
}: CityDerbyCardProps) {
  const phase = getZoneEventPhase()
  const countdown = getZoneEventCountdown()
  const scoringActive = isZoneScoringActive()
  const state = derby ?? buildCityDerby(null, null, {}, userCity)
  const PhaseIcon = phaseIcon(phase)

  const isEmpty = state.home.totalMinutes === 0 && state.away.totalMinutes === 0
  const homeWin = state.leaderNorm === state.home.cityNorm
  const awayWin = state.leaderNorm === state.away.cityNorm

  const shareStory = async () => {
    const outcome = await shareDerbyStory(state)
    if (outcome === 'downloaded') {
      toast.success('Imagen guardada — compártela desde tu galería o descargas')
    } else if (outcome === 'failed') {
      toast.error('No se pudo generar la imagen')
    }
  }

  const shareInvite = async () => {
    if (!inviteLink) return
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'EntrenaMatch',
          text: BRAND_COPY.explore.inviteShareText,
          url: inviteLink,
        })
        void recordPilotDensityEvent(db, {
          city: userCity,
          kind: 'invite_shared',
          isDemoMode,
        })
        return
      }
      await navigator.clipboard.writeText(inviteLink)
      toast.success(BRAND_COPY.explore.inviteToastCopied)
      void recordPilotDensityEvent(db, {
        city: userCity,
        kind: 'invite_shared',
        isDemoMode,
      })
    } catch {
      toast.error('No se pudo compartir')
    }
  }

  return (
    <section
      className={`city-derby-card rounded-2xl border p-4 mb-4 ${phaseCardClass(phase)}`}
      aria-label={`Copa Zona ${DERBY_HOME.label} vs ${DERBY_AWAY.label}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF671F] px-2 py-0.5 rounded-lg bg-[#FF671F]/10">
          {zoneEventPhaseKicker(phase)}
        </span>
        <span className="text-[9px] text-[#9CA3AF] tabular-nums">{countdown.shortLabel}</span>
      </div>

      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <PhaseIcon className="w-4 h-4 text-[#FF671F]" aria-hidden />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#FF671F] font-bold">
              {BRAND_COPY.copaZona.weeklyLabel}
            </p>
            <p className="text-xs font-black text-white">{BRAND_COPY.copaZona.title}</p>
            <p className="text-[9px] text-[#9CA3AF]">
              {DERBY_HOME.label} vs {DERBY_AWAY.label} · índice / 100k hab
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {state.leaderLabel && !state.isTie && (
            <span className="text-[9px] px-2 py-1 rounded-lg bg-[#FFD700]/15 text-[#FFD700] font-bold flex items-center gap-1">
              <Trophy size={10} />
              {state.leaderLabel.split(' ')[0]}
            </span>
          )}
          <DerbyDefenderBadge city={userCity} gender={userGender} />
        </div>
      </div>

      <p className="text-[10px] text-center text-[#9CA3AF] mb-2 tabular-nums">{countdown.label}</p>

      {!scoringActive && (
        <p className="text-[10px] text-[#FFD700]/90 font-semibold mb-2 bg-[#FFD700]/10 border border-[#FFD700]/25 rounded-xl px-3 py-1.5 text-center">
          {BRAND_COPY.copaZona.frozenHint}
        </p>
      )}

      {isEmpty && scoringActive && (
        <p className="text-[11px] text-[#22c55e] font-semibold mb-3 bg-[#22c55e]/10 border border-[#22c55e]/25 rounded-xl px-3 py-2">
          {BRAND_COPY.copaZona.emptyLine}
        </p>
      )}

      <DerbyCityTooltip userCity={userCity} />
      <p className="text-[9px] text-[#6B7280] mb-2">{BRAND_COPY.copaZona.pilotHint}</p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div
          className={`rounded-xl p-2.5 border ${
            homeWin ? 'border-[#22c55e]/50 bg-[#22c55e]/10' : 'border-white/10 bg-white/5'
          }`}
        >
          <p className="text-[10px] font-bold text-white truncate">{state.home.cityLabel}</p>
          <p className="text-lg font-black text-[#22c55e] tabular-nums">{state.home.indexPer100k}</p>
          <p className="text-[9px] text-[#9CA3AF]">
            {state.home.totalMinutes} min · {state.home.participantCount || 0} atletas
          </p>
        </div>
        <div
          className={`rounded-xl p-2.5 border text-right ${
            awayWin ? 'border-[#3b82f6]/50 bg-[#3b82f6]/10' : 'border-white/10 bg-white/5'
          }`}
        >
          <p className="text-[10px] font-bold text-white truncate">{state.away.cityLabel}</p>
          <p className="text-lg font-black text-[#60a5fa] tabular-nums">{state.away.indexPer100k}</p>
          <p className="text-[9px] text-[#9CA3AF]">
            {state.away.totalMinutes} min · {state.away.participantCount || 0} atletas
          </p>
        </div>
      </div>

      <div className="flex h-2.5 rounded-full overflow-hidden bg-black/40 mb-2">
        <div
          className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] transition-all"
          style={{ width: `${state.homeBarPct}%` }}
        />
        <div
          className="h-full bg-gradient-to-r from-[#2563eb] to-[#60a5fa] transition-all"
          style={{ width: `${state.awayBarPct}%` }}
        />
      </div>

      <p className="text-[11px] text-white font-semibold">{zoneEventStatusLine(state, phase)}</p>
      <p className="text-[10px] text-[#9CA3AF] mt-1">{zoneEventTeamCta(state, userCity, phase)}</p>

      <div className="flex gap-2 mt-3">
        {onOpenMap && (
          <button
            type="button"
            onClick={onOpenMap}
            className="flex-1 py-2 rounded-xl border border-white/15 text-[10px] font-bold text-white flex items-center justify-center gap-1.5"
          >
            <MapPin size={12} />
            Ver en mapa
          </button>
        )}
        {inviteLink && scoringActive && (isEmpty || state.home.participantCount + state.away.participantCount < 6) && (
          <button
            type="button"
            onClick={() => void shareInvite()}
            className="flex-1 py-2 rounded-xl bg-[#22c55e] text-black text-[10px] font-bold flex items-center justify-center gap-1.5"
          >
            <UserPlus size={12} />
            {BRAND_COPY.copaZona.inviteCta}
          </button>
        )}
        {!isEmpty && (phase === 'celebration' || !scoringActive) && (
          <button
            type="button"
            onClick={() => void shareStory()}
            className="flex-1 py-2 rounded-xl bg-[#FFD700] text-black text-[10px] font-bold flex items-center justify-center gap-1.5"
          >
            <Share2 size={12} />
            {BRAND_COPY.liveMap.zoneCtaCelebrate}
          </button>
        )}
        {!isEmpty && scoringActive && phase === 'war' && (
          <button
            type="button"
            onClick={() => void shareStory()}
            className="py-2 px-3 rounded-xl border border-white/15 text-[10px] font-bold text-white"
            aria-label="Compartir Copa Zona"
          >
            <Share2 size={12} />
          </button>
        )}
      </div>
    </section>
  )
}
