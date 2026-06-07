import { MapPin, MessageCircle, RefreshCw, Users } from 'lucide-react'
import { useState } from 'react'
import { FuelDayCard } from '../fuel/FuelDayCard'
import { LocalNetworkCard } from './LocalNetworkCard'
import { FirstStepsGuide, isFirstStepsDismissed, dismissFirstSteps } from './FirstStepsGuide'
import { HomeLoopStepper, resolveHomeLoopStep } from './HomeLoopStepper'
import { formatRedSyncFomoLine } from '../../utils/syncFomo'
import type { LocalNetworkCardProps } from './LocalNetworkCard'

export type TeamMemberStatus = 'live' | 'recent' | 'this_week' | 'inactive'

export interface TeamMemberView {
  id: string
  name: string
  status: TeamMemberStatus
  lastLiveLabel?: string
  isBond: boolean
}

export interface ActiveSyncPairView {
  names: string
  vibe?: number
  minutes?: number
}

export interface DailyHomeProps {
  userName: string
  weekDays: Array<{ label: string; trained: boolean; isToday: boolean }>
  weekTrainedCount: number
  teamMembers: TeamMemberView[]
  liveCount: number
  redLiveCount?: number
  syncCount: number
  activeSyncPairs?: ActiveSyncPairView[]
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
  fuelTodayLogs?: import('../../types').FuelLogEntry[]
  fuelWeekDays?: import('../../services/fuel').FuelWeekDay[]
  fuelPostWorkoutTip?: string
  onOpenFuelSetup?: () => void
  onOpenFuelLog?: () => void
  onEditFuelLog?: (log: import('../../types').FuelLogEntry) => void
  onDeleteFuelLog?: (logId: string) => void
  deletingFuelLogId?: string | null
  cityLabel?: string
  localNetwork?: Omit<LocalNetworkCardProps, 'cityLabel'> & { cityLabel?: string }
}

function statusLine(member: TeamMemberView): string {
  if (member.status === 'live') return 'Entrenando ahora'
  if (member.lastLiveLabel) return member.lastLiveLabel
  if (member.status === 'this_week') return 'Entrenó esta semana'
  return 'Sin actividad esta semana'
}

function SectionLabel({ step, title, hint }: { step: number; title: string; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-2 mb-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#FF671F]/20 text-[#FF671F] text-[10px] font-black flex items-center justify-center">
            {step}
          </span>
          <p className="text-[12px] font-bold text-white">{title}</p>
        </div>
        {hint && <p className="text-[10px] text-[#9CA3AF] mt-0.5 ml-7">{hint}</p>}
      </div>
    </div>
  )
}

export function DailyHome({
  userName,
  weekDays,
  weekTrainedCount,
  teamMembers,
  liveCount,
  redLiveCount = 0,
  syncCount,
  activeSyncPairs = [],
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
  fuelTodayLogs,
  fuelWeekDays,
  fuelPostWorkoutTip,
  onOpenFuelSetup,
  onOpenFuelLog,
  onEditFuelLog,
  onDeleteFuelLog,
  deletingFuelLogId,
  cityLabel,
  localNetwork,
}: DailyHomeProps) {
  const firstName = (userName || 'Atleta').split(' ')[0]
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  const [showFirstSteps, setShowFirstSteps] = useState(() => !isFirstStepsDismissed())

  const liveTeamMembers = teamMembers.filter((m) => m.status === 'live')
  const loopStep = resolveHomeLoopStep({
    isLive,
    teamCount: teamMembers.length,
    liveTeamCount: liveTeamMembers.length,
    syncCount,
  })
  const syncFomoLine = formatRedSyncFomoLine(redLiveCount, syncCount)

  return (
    <div className="daily-home mb-4 -mx-1 px-1 space-y-3">
      {showFirstSteps && (
        <FirstStepsGuide
          isLive={isLive}
          hasTeam={teamMembers.length > 0}
          onToggleLive={onToggleLive}
          onOpenMatches={onOpenMatches}
          onOpenExplore={onOpenExplore}
          onStartSync={
            liveTeamMembers[0] && onJoinMember
              ? () => onJoinMember(liveTeamMembers[0].id, liveTeamMembers[0].name)
              : onOpenMap
          }
          onDismiss={() => {
            dismissFirstSteps()
            setShowFirstSteps(false)
          }}
        />
      )}

      {/* Header */}
      <div className="px-0.5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#9CA3AF] font-bold">Hoy</p>
        <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">
          {greeting}, {firstName}
        </h2>
        <p className="text-[11px] text-[#9CA3AF] mt-1 leading-snug">
          Live → Equipo → Sync: entrena visible, con tu red, en tiempo real.
        </p>
        <HomeLoopStepper activeStep={loopStep} />
      </div>

      {/* 1 · LIVE */}
      <section
        className={`rounded-3xl p-4 border shadow-lg transition-colors ${
          loopStep === 'live'
            ? 'bg-gradient-to-br from-[#141418] via-[#12121a] to-[#0f0f12] border-[#22c55e]/40 ring-1 ring-[#22c55e]/20'
            : 'bg-gradient-to-br from-[#141418] via-[#12121a] to-[#0f0f12] border-[#2F2F35]'
        }`}
        aria-label="Paso Live"
      >
        <SectionLabel
          step={1}
          title="Live"
          hint={
            isLive
              ? 'Estás en el mapa — tu equipo puede verte.'
              : 'Enciende live cuando empieces a entrenar.'
          }
        />

        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-white">Tu semana</span>
          <span className="text-[10px] text-[#9CA3AF] tabular-nums">{weekTrainedCount}/7 días</span>
        </div>
        <div className="flex justify-between gap-1 mb-2">
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
        <p className="text-[9px] text-[#6B7280] mb-3">20+ min en live cuentan para tu semana.</p>

        <button
          type="button"
          onClick={onToggleLive}
          disabled={isTogglingLive}
          className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-[0.985] ${
            isLive
              ? 'bg-[#E11D48] text-white ring-1 ring-[#E11D48]/60'
              : 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black ring-1 ring-[#22c55e]/50'
          } ${isTogglingLive ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isTogglingLive
            ? 'Un momento…'
            : isLive
              ? '⏹ Terminar live'
              : '🟢 Empezar live'}
        </button>

        <button
          type="button"
          onClick={onOpenMap}
          className="mt-2 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-white/90 active:bg-white/10 flex items-center justify-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5 text-[#22c55e]" />
          Ver GymPulse {liveCount > 0 ? `· ${liveCount} en vivo` : ''}
          {cityLabel ? ` · ${cityLabel}` : ''}
        </button>
      </section>

      {/* 2 · EQUIPO */}
      <section
        className={`rounded-3xl p-4 border ${
          loopStep === 'team'
            ? 'bg-[#141418] border-[#FF671F]/40 ring-1 ring-[#FF671F]/20'
            : 'bg-[#141418] border-[#2F2F35]'
        }`}
        aria-label="Paso Equipo"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#FF671F]/20 text-[#FF671F] text-[10px] font-black flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <p className="text-[12px] font-bold text-white">Tu equipo</p>
              <p className="text-[10px] text-[#9CA3AF]">Matches y socios con los que ya entrenaste.</p>
            </div>
          </div>
          {onOpenMatches && (
            <button
              type="button"
              onClick={onOpenMatches}
              className="text-[10px] text-[#FF671F] font-bold underline active:opacity-70 shrink-0"
            >
              Ver todos
            </button>
          )}
        </div>

        {teamMembers.length === 0 ? (
          <div className="text-center py-4 px-2">
            <p className="text-sm text-[#9CA3AF]">Sin equipo aún — el sync empieza aquí.</p>
            <button
              type="button"
              onClick={onOpenExplore}
              className="mt-2 text-[11px] px-4 py-2 rounded-xl bg-[#FF671F]/15 text-[#FF671F] font-bold active:bg-[#FF671F]/25 inline-flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" />
              Buscar gym partner
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {teamMembers.slice(0, 5).map((member) => (
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
                        BOND
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
                      Sync
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
      </section>

      {/* 3 · SYNC */}
      <section
        className={`rounded-3xl p-4 border ${
          loopStep === 'sync'
            ? 'bg-gradient-to-br from-[#0a1f14] to-[#141418] border-[#22c55e]/40 ring-1 ring-[#22c55e]/25'
            : 'bg-gradient-to-br from-[#0a1f14]/80 to-[#141418] border-[#22c55e]/20'
        }`}
        aria-label="Paso Sync"
      >
        <SectionLabel
          step={3}
          title="EntrenaSync"
          hint={
            isLive
              ? 'Entrena en sync con alguien de tu equipo o del mapa.'
              : 'Primero activa live — luego invita a un sync.'
          }
        />

        {syncFomoLine && (
          <p className="text-[10px] text-[#22c55e]/90 font-semibold mb-3 ml-7">{syncFomoLine}</p>
        )}

        {!isLive && (
          <div className="mb-3 p-3 rounded-2xl bg-black/30 border border-white/10 text-center">
            <p className="text-[11px] text-[#9CA3AF]">Activa live para iniciar un EntrenaSync.</p>
            <button
              type="button"
              onClick={onToggleLive}
              disabled={isTogglingLive}
              className="mt-2 text-[11px] px-4 py-2 rounded-xl bg-[#22c55e] text-black font-bold active:scale-95"
            >
              Ir a Live →
            </button>
          </div>
        )}

        {activeSyncPairs.length > 0 && (
          <div className="mb-3">
            <p className="text-[9px] uppercase tracking-wider text-[#22c55e] font-bold mb-1.5">
              🔄 {activeSyncPairs.length} sync activo{activeSyncPairs.length > 1 ? 's' : ''} ahora
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {activeSyncPairs.slice(0, 4).map((pair, i) => (
                <span
                  key={i}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-[#22c55e]/10 text-[#22c55e] text-[10px] font-medium border border-[#22c55e]/25"
                >
                  {pair.names}
                  {pair.minutes != null && pair.minutes > 0 ? ` · ${pair.minutes} min` : ''}
                  {pair.vibe != null ? ` · ${pair.vibe}%` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {liveTeamMembers.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[10px] text-[#9CA3AF]">De tu equipo, en live ahora:</p>
            {liveTeamMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => onJoinMember?.(member.id, member.name)}
                className="w-full flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/35 active:scale-[0.99] text-left"
              >
                <span className="text-sm font-bold text-white">{member.name.split(' ')[0]}</span>
                <span className="text-[10px] font-extrabold text-[#22c55e] flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Iniciar sync
                </span>
              </button>
            ))}
          </div>
        ) : isLive ? (
          <div className="text-center py-3 px-2 rounded-2xl bg-black/25 border border-dashed border-[#22c55e]/30">
            <p className="text-[11px] text-[#9CA3AF] mb-2">
              Nadie de tu equipo está en live. Busca en el mapa o explora.
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                type="button"
                onClick={onOpenMap}
                className="text-[10px] px-3 py-1.5 rounded-xl bg-[#22c55e]/15 text-[#22c55e] font-bold"
              >
                Abrir mapa
              </button>
              <button
                type="button"
                onClick={onOpenExplore}
                className="text-[10px] px-3 py-1.5 rounded-xl border border-[#FF671F]/40 text-[#FF671F] font-bold"
              >
                Explorar
              </button>
            </div>
          </div>
        ) : null}

        {syncCount > 0 && (
          <p className="text-[10px] text-[#22c55e]/80 mt-3 text-center font-medium">
            {syncCount} persona{syncCount === 1 ? '' : 's'} en sync en la red
          </p>
        )}
      </section>

      {/* Secundario — después del loop */}
      {onOpenEntrenaLog && (
        <button
          type="button"
          onClick={onOpenEntrenaLog}
          className="w-full py-2.5 rounded-xl border border-[#FF671F]/35 bg-[#FF671F]/10 text-[11px] font-bold text-[#FF671F] active:bg-[#FF671F]/20"
        >
          🏋️ Registrar entreno (EntrenaLog)
        </button>
      )}

      {(onOpenFuelSetup || onOpenFuelLog) && (
        <FuelDayCard
          profile={fuelProfile ?? null}
          totals={
            fuelTotals ?? { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, entryCount: 0 }
          }
          todayLogs={fuelTodayLogs}
          weekDays={fuelWeekDays}
          postWorkoutTip={fuelPostWorkoutTip}
          onSetup={onOpenFuelSetup ?? (() => {})}
          onLogMeal={onOpenFuelLog ?? (() => {})}
          onEditLog={onEditFuelLog}
          onDeleteLog={onDeleteFuelLog}
          deletingLogId={deletingFuelLogId}
        />
      )}

      {localNetwork && <LocalNetworkCard cityLabel={cityLabel} {...localNetwork} />}
    </div>
  )
}
