import { Plus, Users } from 'lucide-react'
import type { Squad } from '../../types'

export interface SquadsTabProps {
  squads: Squad[]
  isDemoMode: boolean
  effectiveUserId: string
  isUserLive: (userId: string) => boolean
  resolveMemberName: (memberId: string) => string
  onCreateSquad: () => void
  onJoinSquad: (squadId: string) => void
  onOpenSquad: (squadId: string) => void
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
}: SquadsTabProps) {
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-header">Tus Squads</div>
          <div className="text-[#9CA3AF] text-sm">
            {isDemoMode
              ? 'Grupos fijos de entrenamiento (demo)'
              : 'Grupos fijos en vivo — chat cross-device'}
          </div>
        </div>
        <button
          type="button"
          onClick={onCreateSquad}
          className="flex items-center gap-2 bg-[#FF671F] text-black px-4 py-2 rounded-2xl text-sm font-semibold active:bg-[#E55A1A]"
        >
          <Plus size={16} /> Crear Squad
        </button>
      </div>

      {squads.length === 0 ? (
        <div className="card p-8 rounded-3xl text-center mt-8">
          <Users className="mx-auto text-[#FF671F] mb-3" size={42} />
          <div className="font-semibold mb-2">Sé el primero en crear un Squad</div>
          <p className="text-sm text-[#9CA3AF] mb-4 max-w-[280px] mx-auto">
            Los squads son grupos fijos de 3-4 personas para entrenar consistentemente.
          </p>
          <button
            type="button"
            onClick={onCreateSquad}
            className="px-6 py-2.5 bg-[#FF671F] text-black rounded-2xl text-sm font-semibold active:bg-[#E55A1A]"
          >
            Crear mi primer Squad
          </button>
        </div>
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
