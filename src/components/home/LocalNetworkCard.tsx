import { MapPin, Trophy, Users, Zap } from 'lucide-react'
import type { CityChallenge, LeaderboardEntry, PartnerGym } from '../../services/localNetwork'
import { formatLeaderboardMinutes } from '../../services/localNetwork'
import type { GymCheckIn } from '../../types'

export interface LocalNetworkCardProps {
  cityLabel?: string
  challenge: CityChallenge | null
  leaderboard: LeaderboardEntry[]
  nearestGym: (PartnerGym & { distanceKm: number }) | null
  gymCheckIn?: GymCheckIn | null
  gymLiveCount?: number
  showOnLeaderboard: boolean
  onToggleLeaderboard: (visible: boolean) => void
  onGymCheckIn: (gym: PartnerGym) => void
  onOpenMap: () => void
}

export function LocalNetworkCard({
  cityLabel,
  challenge,
  leaderboard,
  nearestGym,
  gymCheckIn,
  gymLiveCount = 0,
  showOnLeaderboard,
  onToggleLeaderboard,
  onGymCheckIn,
  onOpenMap,
}: LocalNetworkCardProps) {
  if (!cityLabel && !challenge && leaderboard.length === 0 && !nearestGym) return null

  const activeCheckIn = gymCheckIn?.gymName

  return (
    <div className="rounded-3xl p-4 bg-[#141418] border border-[#2F2F35]">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#9CA3AF] font-bold">
            Tu zona
          </p>
          <h3 className="text-sm font-black text-white mt-0.5">
            {cityLabel ? `Red en ${cityLabel}` : 'Red local'}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onToggleLeaderboard(!showOnLeaderboard)}
          className={`text-[9px] px-2 py-1 rounded-lg border font-bold shrink-0 ${
            showOnLeaderboard
              ? 'border-[#22c55e]/40 text-[#22c55e] bg-[#22c55e]/10'
              : 'border-white/15 text-[#9CA3AF] bg-white/5'
          }`}
        >
          {showOnLeaderboard ? 'Visible' : 'Oculto'}
        </button>
      </div>

      {challenge && (
        <div className="mb-3 p-3 rounded-2xl bg-gradient-to-br from-[#FF671F]/12 to-[#FFD700]/8 border border-[#FF671F]/25">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#FFD700]" />
              Reto semanal de la ciudad
            </p>
            <span className="text-[10px] text-[#FFD700] font-black">{challenge.progressPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-black/40 overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF671F] to-[#FFD700] transition-all"
              style={{ width: `${challenge.progressPct}%` }}
            />
          </div>
          <p className="text-[10px] text-[#9CA3AF] leading-snug">
            {challenge.currentMinutes} / {challenge.targetMinutes} min (live + sync) en{' '}
            {challenge.cityLabel}
            {challenge.participants > 0 ? ` · ${challenge.participants} atletas` : ''}
          </p>
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-bold text-[#9CA3AF] mb-2 flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            Top esta semana
          </p>
          <ul className="space-y-1.5">
            {leaderboard.map((entry, idx) => (
              <li
                key={entry.userId}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11px] ${
                  entry.isMe
                    ? 'bg-[#22c55e]/10 border border-[#22c55e]/30'
                    : 'bg-white/[0.03] border border-white/8'
                }`}
              >
                <span
                  className={`w-5 text-center font-black shrink-0 ${
                    idx === 0 ? 'text-[#FFD700]' : idx === 1 ? 'text-[#C0C0C0]' : idx === 2 ? 'text-[#CD7F32]' : 'text-[#6B7280]'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="flex-1 font-bold text-white truncate">
                  {entry.isMe ? 'Tú' : entry.name.split(' ')[0]}
                </span>
                <span className="text-[#22c55e] font-bold shrink-0">
                  {formatLeaderboardMinutes(entry.totalMinutes)}
                </span>
                <span className="text-[9px] text-[#6B7280] shrink-0">
                  {entry.liveDays}d
                  {entry.liveStreak > 1 ? ` · 🔥${entry.liveStreak}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {leaderboard.length === 0 && showOnLeaderboard && (
        <p className="text-[10px] text-[#6B7280] mb-3 leading-snug">
          Sé el primero en aparecer: entrena en vivo ≥20 min y suma minutos para tu ciudad.
        </p>
      )}

      {(nearestGym || activeCheckIn) && (
        <div className="pt-1 border-t border-white/8">
          {activeCheckIn ? (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] text-[#22c55e] font-semibold flex items-center gap-1.5 min-w-0">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">En {gymCheckIn!.gymName}</span>
                </p>
                <button
                  type="button"
                  onClick={onOpenMap}
                  className="text-[9px] text-[#FF671F] font-bold underline shrink-0"
                >
                  Mapa
                </button>
              </div>
              {gymLiveCount > 0 && (
                <p className="text-[10px] text-[#FFD700] font-bold flex items-center gap-1.5">
                  <Zap className="w-3 h-3" />
                  {gymLiveCount} entrenando en este gym ahora
                </p>
              )}
            </div>
          ) : nearestGym ? (
            <button
              type="button"
              onClick={() => onGymCheckIn(nearestGym)}
              className="mt-2 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold text-white active:bg-white/10 flex items-center justify-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-[#22c55e]" />
              Check-in en {nearestGym.name}
              <span className="text-[#6B7280] font-normal">
                ({Math.round(nearestGym.distanceKm * 1000)} m)
              </span>
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
