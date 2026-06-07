import { MapPin, MessageCircle, Users } from 'lucide-react'
import { FuelDayCard } from '../fuel/FuelDayCard'

export type TeamMemberStatus = 'live' | 'recent' | 'this_week' | 'inactive'

export interface TeamMemberView {
  id: string
  name: string
  status: TeamMemberStatus
  lastLiveLabel?: string
  isBond: boolean
}

export interface DailyRitualHomeProps {
  userName: string
  weekDays: Array<{ label: string; trained: boolean; isToday: boolean }>
  weekTrainedCount: number
  teamMembers: TeamMemberView[]
  liveCount: number
  syncCount: number
  isLive: boolean
  isTogglingLive: boolean
  onToggleLive: () => void
  onOpenExplore: () => void
  onOpenMap: () => void
  onJoinMember?: (id: string, name: string) => void
  onMessageMember?: (id: string) => void
  onOpenMatches?: () => void
  onOpenEntrenaLog?: () => void
  fuelProfile?: import('../../types').FuelProfile | null
  fuelTotals?: import('../../types').FuelDayTotals
  fuelPostWorkoutTip?: string
  onOpenFuelSetup?: () => void
  onOpenFuelLog?: () => void
  cityLabel?: string
}

function statusLine(member: TeamMemberView): string {
  if (member.status === 'live') return 'Entrenando ahora'
  if (member.lastLiveLabel) return member.lastLiveLabel
  if (member.status === 'this_week') return 'Entrenó esta semana'
  return 'Sin actividad esta semana'
}

export function DailyRitualHome({
  userName,
  weekDays,
  weekTrainedCount,
  teamMembers,
  liveCount,
  syncCount,
  isLive,
  isTogglingLive,
  onToggleLive,
  onOpenExplore,
  onOpenMap,
  onJoinMember,
  onMessageMember,
  onOpenMatches,
  onOpenEntrenaLog,
  fuelProfile,
  fuelTotals,
  fuelPostWorkoutTip,
  onOpenFuelSetup,
  onOpenFuelLog,
  cityLabel,
}: DailyRitualHomeProps) {
  const firstName = (userName || 'Atleta').split(' ')[0]
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="daily-ritual-home mb-4 -mx-1 px-1 space-y-3">
      <div className="rounded-3xl p-4 bg-gradient-to-br from-[#141418] via-[#12121a] to-[#0f0f12] border border-[#2F2F35] shadow-lg">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#9CA3AF] font-bold">
          Hoy
        </p>
        <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">
          {greeting}, {firstName}
        </h2>
        <p className="text-[12px] text-[#9CA3AF] mt-1 leading-snug">
          {isLive
            ? 'Estás en vivo — tu equipo puede unirse contigo.'
            : weekTrainedCount > 0
              ? `Esta semana llevas ${weekTrainedCount} día${weekTrainedCount === 1 ? '' : 's'} de entreno.`
              : 'Activa live cuando empieces a entrenar — cuenta para tu semana.'}
        </p>

        {/* Tu semana — simple 7 dots */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-white">Tu semana</span>
            <span className="text-[10px] text-[#9CA3AF] tabular-nums">
              {weekTrainedCount}/7 días
            </span>
          </div>
          <div className="flex justify-between gap-1">
            {weekDays.map((d) => (
              <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-full max-w-[36px] aspect-square rounded-xl flex items-center justify-center transition-all ${
                    d.trained
                      ? 'bg-[#22c55e] text-black shadow-[0_0_12px_rgba(34,197,94,0.35)]'
                      : d.isToday && isLive
                        ? 'bg-[#22c55e]/25 border-2 border-[#22c55e] text-[#22c55e] animate-pulse'
                        : d.isToday
                          ? 'bg-[#FF671F]/15 border-2 border-[#FF671F]/50 text-[#FF671F]'
                          : 'bg-white/5 border border-white/10 text-[#6B7280]'
                  }`}
                  title={d.trained ? 'Entrenaste' : d.isToday ? 'Hoy' : ''}
                >
                  {d.trained ? '✓' : ''}
                </div>
                <span
                  className={`text-[9px] font-bold ${d.isToday ? 'text-[#FF671F]' : 'text-[#6B7280]'}`}
                >
                  {d.label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-[#6B7280] mt-2 leading-snug">
            Cuenta un día si entrenas en vivo al menos 20 minutos.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleLive}
          disabled={isTogglingLive}
          className={`mt-4 w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-[0.985] ${
            isLive
              ? 'bg-[#E11D48] text-white ring-1 ring-[#E11D48]/60'
              : 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black ring-1 ring-[#22c55e]/50'
          } ${isTogglingLive ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isTogglingLive
            ? 'Un momento…'
            : isLive
              ? '⏹ Terminar entrenamiento'
              : '🟢 Empezar a entrenar (LIVE)'}
        </button>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            type="button"
            onClick={onOpenMap}
            className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-white/90 active:bg-white/10 flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-[#22c55e]" />
            Mapa {liveCount > 0 ? `(${liveCount})` : ''}
          </button>
          <button
            type="button"
            onClick={onOpenExplore}
            className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-white/90 active:bg-white/10 flex items-center justify-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-[#FF671F]" />
            Buscar partner
          </button>
        </div>

        {onOpenEntrenaLog && (
          <button
            type="button"
            onClick={onOpenEntrenaLog}
            className="mt-2 w-full py-2.5 rounded-xl border border-[#FF671F]/35 bg-[#FF671F]/10 text-[11px] font-bold text-[#FF671F] active:bg-[#FF671F]/20"
          >
            🏋️ Registrar entreno (EntrenaLog)
          </button>
        )}

        {(liveCount > 0 || syncCount > 0) && (
          <p className="text-[10px] text-[#22c55e]/90 mt-3 font-medium text-center">
            {liveCount} entrenando ahora
            {syncCount > 0 ? ` · ${syncCount} en sync` : ''}
            {cityLabel ? ` · ${cityLabel}` : ''}
          </p>
        )}
      </div>

      {(onOpenFuelSetup || onOpenFuelLog) && (
        <FuelDayCard
          profile={fuelProfile ?? null}
          totals={
            fuelTotals ?? { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, entryCount: 0 }
          }
          postWorkoutTip={fuelPostWorkoutTip}
          onSetup={onOpenFuelSetup ?? (() => {})}
          onLogMeal={onOpenFuelLog ?? (() => {})}
        />
      )}

      {/* Tu equipo */}
      <div className="rounded-3xl p-4 bg-[#141418] border border-[#2F2F35]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-bold text-white">Tu equipo</p>
            <p className="text-[10px] text-[#9CA3AF]">Matches y socios con los que ya entrenaste</p>
          </div>
          {onOpenMatches && (
            <button
              type="button"
              onClick={onOpenMatches}
              className="text-[10px] text-[#FF671F] font-bold underline active:opacity-70"
            >
              Ver todos
            </button>
          )}
        </div>

        {teamMembers.length === 0 ? (
          <div className="text-center py-4 px-2">
            <p className="text-sm text-[#9CA3AF]">Aún no tienes equipo.</p>
            <button
              type="button"
              onClick={onOpenExplore}
              className="mt-2 text-[11px] px-4 py-2 rounded-xl bg-[#FF671F]/15 text-[#FF671F] font-bold active:bg-[#FF671F]/25"
            >
              Encontrar gym partner →
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {teamMembers.map((member) => (
              <li
                key={member.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border ${
                  member.status === 'live'
                    ? 'bg-[#22c55e]/8 border-[#22c55e]/35'
                    : 'bg-white/[0.03] border-white/8'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                    member.status === 'live'
                      ? 'bg-[#22c55e] text-black'
                      : 'bg-[#2F2F35] text-white'
                  }`}
                >
                  {(member.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-white truncate">
                      {member.name.split(' ')[0]}
                    </span>
                    {member.isBond && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#FFD700]/20 text-[#FFD700] font-bold">
                        SYNC
                      </span>
                    )}
                    {member.status === 'live' && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#22c55e] text-black font-black animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#9CA3AF] truncate">{statusLine(member)}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {member.status === 'live' && onJoinMember && (
                    <button
                      type="button"
                      onClick={() => onJoinMember(member.id, member.name)}
                      className="text-[10px] px-3 py-1.5 rounded-xl bg-[#22c55e] text-black font-extrabold active:scale-95"
                    >
                      Unirme
                    </button>
                  )}
                  {member.status !== 'live' && onMessageMember && (
                    <button
                      type="button"
                      onClick={() => onMessageMember(member.id)}
                      className="text-[10px] px-2.5 py-1.5 rounded-xl border border-white/15 text-white/80 font-semibold active:bg-white/10 flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Chat
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
