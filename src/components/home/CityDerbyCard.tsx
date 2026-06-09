import { MapPin, Share2, Swords, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import type { CityDerbyState } from '../../services/cityDerby'
import { DERBY_AWAY, DERBY_HOME, derbyStatusLine, derbyTeamCta } from '../../services/cityDerby'
import { DerbyDefenderBadge } from './DerbyDefenderBadge'
import type { ProfileGender } from '../../utils/genderedCopy'
import { downloadDerbyStory } from '../../utils/derbyStoryShare'

export interface CityDerbyCardProps {
  derby: CityDerbyState | null
  onOpenMap?: () => void
  onGoLive?: () => void
  isLive?: boolean
  userGender?: ProfileGender
}

export function CityDerbyCard({ derby, onOpenMap, onGoLive, isLive, userGender }: CityDerbyCardProps) {
  if (!derby) return null

  const isEmpty = derby.home.totalMinutes === 0 && derby.away.totalMinutes === 0
  const homeWin = derby.leaderNorm === derby.home.cityNorm
  const awayWin = derby.leaderNorm === derby.away.cityNorm

  const shareStory = async () => {
    const ok = await downloadDerbyStory(derby)
    if (ok) toast.success('Story del derby guardada')
    else toast.error('No se pudo generar la imagen')
  }

  return (
    <section
      className="city-derby-card rounded-2xl border border-[#FF671F]/40 bg-gradient-to-br from-[#1a0f08] via-[#141418] to-[#0a1218] p-4 mb-4"
      aria-label={`Derby ${DERBY_HOME.label} vs ${DERBY_AWAY.label}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-[#FF671F]" aria-hidden />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#FF671F] font-bold">
              Derby semanal
            </p>
            <p className="text-xs font-black text-white">
              {DERBY_HOME.label} vs {DERBY_AWAY.label}
            </p>
            <p className="text-[9px] text-[#9CA3AF]">Índice por 100k habitantes</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {derby.leaderLabel && !derby.isTie && (
            <span className="text-[9px] px-2 py-1 rounded-lg bg-[#FFD700]/15 text-[#FFD700] font-bold flex items-center gap-1">
              <Trophy size={10} />
              {derby.leaderLabel.split(' ')[0]}
            </span>
          )}
          <DerbyDefenderBadge gender={userGender} />
        </div>
      </div>

      {isEmpty && (
        <p className="text-[11px] text-[#22c55e] font-semibold mb-3 bg-[#22c55e]/10 border border-[#22c55e]/25 rounded-xl px-3 py-2">
          0 vs 0 — sé el primero en entrenar LIVE y marcar la zona
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div
          className={`rounded-xl p-2.5 border ${
            homeWin ? 'border-[#22c55e]/50 bg-[#22c55e]/10' : 'border-white/10 bg-white/5'
          }`}
        >
          <p className="text-[10px] font-bold text-white truncate">{derby.home.cityLabel}</p>
          <p className="text-lg font-black text-[#22c55e] tabular-nums">{derby.home.indexPer100k}</p>
          <p className="text-[9px] text-[#9CA3AF]">
            {derby.home.totalMinutes} min · {derby.home.participantCount || 0} atletas
          </p>
        </div>
        <div
          className={`rounded-xl p-2.5 border text-right ${
            awayWin ? 'border-[#3b82f6]/50 bg-[#3b82f6]/10' : 'border-white/10 bg-white/5'
          }`}
        >
          <p className="text-[10px] font-bold text-white truncate">{derby.away.cityLabel}</p>
          <p className="text-lg font-black text-[#60a5fa] tabular-nums">{derby.away.indexPer100k}</p>
          <p className="text-[9px] text-[#9CA3AF]">
            {derby.away.totalMinutes} min · {derby.away.participantCount || 0} atletas
          </p>
        </div>
      </div>

      <div className="flex h-2.5 rounded-full overflow-hidden bg-black/40 mb-2">
        <div
          className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] transition-all"
          style={{ width: `${derby.homeBarPct}%` }}
        />
        <div
          className="h-full bg-gradient-to-r from-[#2563eb] to-[#60a5fa] transition-all"
          style={{ width: `${derby.awayBarPct}%` }}
        />
      </div>

      <p className="text-[11px] text-white font-semibold">{derbyStatusLine(derby)}</p>
      <p className="text-[10px] text-[#9CA3AF] mt-1">{derbyTeamCta(derby)}</p>

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
        {onGoLive && !isLive && (
          <button
            type="button"
            onClick={onGoLive}
            className="flex-1 py-2 rounded-xl bg-[#FF671F] text-black text-[10px] font-black"
          >
            Sumar con LIVE
          </button>
        )}
        {!isEmpty && (
          <button
            type="button"
            onClick={() => void shareStory()}
            className="py-2 px-3 rounded-xl border border-white/15 text-[10px] font-bold text-white"
            aria-label="Compartir story del derby"
          >
            <Share2 size={12} />
          </button>
        )}
      </div>
    </section>
  )
}
