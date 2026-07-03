import { Plus, Users, Star } from 'lucide-react'
import type { Squad } from '../../types'
import { EmV2EmptyState } from '../ui/EmV2EmptyState'

export interface SquadsTabProps {
  squads: Squad[]
  isDemoMode: boolean
  effectiveUserId: string
  isUserLive: (userId: string) => boolean
  resolveMemberName: (memberId: string) => string
  onCreateSquad: () => void
  onJoinSquad: (squadId: string) => void
  onOpenSquad: (squadId: string) => void
  onOpenSessions?: () => void
  sessionUnreads?: number
  userCity?: string
  onCreateSquadWithName?: (suggestedName: string) => void
  /** Phase 79 — user weekly fuel + burn summary for squad context */
  squadFuelSummary?: { weeklyKcal: number; weeklyBurnKcal: number; targetKcal: number }
}

export function SquadsTab({
  squads,
  isDemoMode,
  effectiveUserId,
  isUserLive,
  resolveMemberName,
  onCreateSquad,
  onJoinSquad,
  onOpenSquad,
  onOpenSessions,
  sessionUnreads = 0,
  userCity,
  onCreateSquadWithName,
  squadFuelSummary,
}: SquadsTabProps) {
  const suggestedName = userCity ? `Squad ${userCity}` : 'Squad Viña del Mar'
  return (
    <div className="em-v2-squads flex-1 overflow-auto px-4 pb-28">
      {squadFuelSummary && squadFuelSummary.weeklyKcal > 0 && (
        <div className="mb-4 rounded-2xl border border-[#a855f7]/25 bg-[#1C1C20] p-3">
          <p className="text-[10px] uppercase tracking-wider text-[#c084fc] font-bold">Squad Fuel · tu semana</p>
          <p className="text-xs text-white mt-1">
            {Math.round(squadFuelSummary.weeklyKcal)} kcal consumidas · ~{squadFuelSummary.weeklyBurnKcal} kcal en entrenos
          </p>
          <p className="text-[10px] text-[#9CA3AF]">Target dinámico hoy ~{squadFuelSummary.targetKcal} kcal</p>
        </div>
      )}
      <header className="em-v2-squads__header pt-2 mb-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="em-v2-squads__eyebrow">Crew</p>
          <h2 className="em-v2-squads__title">Tus Squads</h2>
          <p className="em-v2-squads__sub">
            {isDemoMode
              ? 'Grupos fijos de entrenamiento (demo)'
              : 'Grupos fijos en vivo — chat cross-device'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenSessions && (
            <button
              type="button"
              onClick={onOpenSessions}
              className="relative flex items-center gap-1.5 bg-[#1C1C20] text-[#FFD700] px-3 py-2 rounded-2xl text-xs font-semibold border border-[#FFD700]/30 active:bg-[#25252A]"
            >
              <Star size={14} />
              Sesiones
              {sessionUnreads > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 text-[9px] font-extrabold rounded-full bg-[#FF4F79] text-black flex items-center justify-center">
                  {sessionUnreads > 9 ? '9+' : sessionUnreads}
                </span>
              )}
            </button>
          )}
        <button
          type="button"
          onClick={onCreateSquad}
          className="flex items-center gap-2 bg-[#FF671F] text-black px-4 py-2 rounded-2xl text-sm font-semibold active:bg-[#E55A1A]"
        >
          <Plus size={16} /> Crear Squad
        </button>
        </div>
      </div>
      </header>

      {squads.length === 0 ? (
        <EmV2EmptyState
          className="mt-4 em-v2-fade-in"
          icon={<Users className="text-[#FF671F]" size={32} />}
          title="Sé el primero en crear un Squad"
          body="Grupos fijos de 3-4 personas para entrenar consistentemente."
        >
          <button
            type="button"
            onClick={() => {
              if (onCreateSquadWithName) onCreateSquadWithName(suggestedName)
              else onCreateSquad()
            }}
            className="em-v2-hero-card__cta"
          >
            Crear {suggestedName}
          </button>
          <button
            type="button"
            onClick={onCreateSquad}
            className="py-2 text-xs border border-[#2F2F35] rounded-2xl text-[#9CA3AF] active:bg-[#25252A]"
          >
            Otro nombre…
          </button>
        </EmV2EmptyState>
      ) : (
        <div className="space-y-3">
          {squads.map((squad) => {
            const isMember = squad.members.includes(effectiveUserId)
            const spots = 4 - squad.members.length
            const membersLive = squad.members.filter((mid) => isUserLive(mid)).length

            return (
              <div
                key={squad.id}
                role="button"
                tabIndex={0}
                className="card card-glass session-card rounded-3xl p-4 active:bg-[#25252A] border border-[#FF671F]/20 cursor-pointer"
                onClick={() => onOpenSquad(squad.id)}
                onKeyDown={(e) => e.key === 'Enter' && onOpenSquad(squad.id)}
              >
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold text-lg flex items-center gap-2 tracking-tight flex-wrap">
                      {squad.name}
                      <span className="text-[9px] bg-[#FF671F]/10 text-[#FF671F] px-1.5 py-0.5 rounded font-medium">
                        SQUAD
                      </span>
                      {membersLive > 0 && (
                        <span className="text-[9px] bg-[#22c55e] text-black px-1.5 py-0.5 rounded font-black animate-pulse">
                          🟢 {membersLive} LIVE
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[#FF671F] font-medium mt-0.5">{squad.focus}</div>
                    {squad.weeklyRoutine?.label && (
                      <div className="text-[10px] text-[#9CA3AF] mt-1 leading-snug">
                        📋 {squad.weeklyRoutine.label}
                        {squad.weeklyRoutine.schedule
                          ? ` · ${squad.weeklyRoutine.schedule}`
                          : ''}
                      </div>
                    )}
                    {squad.weeklyChallenge && (
                      <div className="squad-challenge-bar mt-2">
                        <div className="squad-challenge-bar__label">
                          🎯 {squad.weeklyChallenge.label}
                        </div>
                        <div className="squad-challenge-bar__track">
                          <div
                            className="squad-challenge-bar__fill"
                            style={{
                              width: `${Math.min(100, Math.round((squad.weeklyChallenge.progressSessions / squad.weeklyChallenge.targetSessions) * 100))}%`,
                            }}
                          />
                        </div>
                        <span className="squad-challenge-bar__count">
                          {squad.weeklyChallenge.progressSessions}/{squad.weeklyChallenge.targetSessions}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-[#22c55e] font-medium">{squad.members.length}/4</div>
                    {!isMember && spots > 0 && (
                      <div className="text-[#9CA3AF] mt-0.5">cupos</div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex justify-between items-center text-sm">
                  <div className="text-[#9CA3AF] text-xs">
                    Creado por {resolveMemberName(squad.createdBy)}
                  </div>
                  {!isMember && spots > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onJoinSquad(squad.id)
                      }}
                      className="bg-[#FF671F] text-black text-xs px-4 py-1.5 rounded-2xl font-medium active:bg-[#E55A1A]"
                    >
                      Unirme
                    </button>
                  )}
                  {isMember && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenSquad(squad.id)
                      }}
                      className="text-xs border border-[#FF671F] text-[#FF671F] px-3 py-1.5 rounded-2xl font-medium active:bg-[#FF671F] active:text-black"
                    >
                      Abrir chat
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
