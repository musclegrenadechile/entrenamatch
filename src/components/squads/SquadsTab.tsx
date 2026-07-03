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
        <div className="em-v2-squads__fuel">
          <p className="em-v2-squads__fuel-kicker">Squad Fuel · tu semana</p>
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
            <button type="button" onClick={onOpenSessions} className="em-v2-squads__sessions-btn">
              <Star size={14} />
              Sesiones
              {sessionUnreads > 0 && (
                <span className="em-v2-squads__sessions-badge">
                  {sessionUnreads > 9 ? '9+' : sessionUnreads}
                </span>
              )}
            </button>
          )}
        <button
          type="button"
          onClick={onCreateSquad}
          className="em-v2-sessions__create flex items-center gap-2"
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
          <button type="button" onClick={onCreateSquad} className="em-v2-cta-secondary">
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
                className={`em-v2-card em-v2-card--squad em-v2-card--tap ${membersLive > 0 ? 'em-v2-card--live' : ''}`}
                onClick={() => onOpenSquad(squad.id)}
                onKeyDown={(e) => e.key === 'Enter' && onOpenSquad(squad.id)}
              >
                <div className="flex justify-between">
                  <div>
                    <div className="em-v2-card__title">
                      {squad.name}
                      <span className="em-v2-card__badge em-v2-card__badge--brand">SQUAD</span>
                      {membersLive > 0 && (
                        <span className="em-v2-card__badge em-v2-card__badge--live animate-pulse">
                          🟢 {membersLive} LIVE
                        </span>
                      )}
                    </div>
                    <div className="em-v2-card__focus">{squad.focus}</div>
                    {squad.weeklyRoutine?.label && (
                      <div className="em-v2-card__hint">
                        📋 {squad.weeklyRoutine.label}
                        {squad.weeklyRoutine.schedule
                          ? ` · ${squad.weeklyRoutine.schedule}`
                          : ''}
                      </div>
                    )}
                    {squad.weeklyChallenge && (
                      <div className="em-v2-card__challenge">
                        <div className="em-v2-card__challenge-label">
                          🎯 {squad.weeklyChallenge.label}
                        </div>
                        <div className="em-v2-card__challenge-track">
                          <div
                            className="em-v2-card__challenge-fill"
                            style={{
                              width: `${Math.min(100, Math.round((squad.weeklyChallenge.progressSessions / squad.weeklyChallenge.targetSessions) * 100))}%`,
                            }}
                          />
                        </div>
                        <span className="em-v2-card__challenge-count">
                          {squad.weeklyChallenge.progressSessions}/{squad.weeklyChallenge.targetSessions}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="em-v2-card__stat">
                    <div className="em-v2-card__stat-value">{squad.members.length}/4</div>
                    {!isMember && spots > 0 && (
                      <div className="em-v2-card__stat-label">cupos</div>
                    )}
                  </div>
                </div>

                <div className="em-v2-card__footer">
                  <div className="em-v2-card__footer-meta">
                    Creado por {resolveMemberName(squad.createdBy)}
                  </div>
                  {!isMember && spots > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onJoinSquad(squad.id)
                      }}
                      className="em-v2-card__cta"
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
                      className="em-v2-card__cta em-v2-card__cta--outline"
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
