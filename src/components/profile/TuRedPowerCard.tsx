export interface TuRedPowerCardProps {
  networkPower: number
  bondsCount: number
  liveStreak: number
  level: number
  gadgets: string[]
  momentum?: number
  onAmplifyPulse?: () => void
  onProtectStreak?: () => void
}

export function TuRedPowerCard({
  networkPower,
  bondsCount,
  liveStreak,
  level,
  gadgets,
  momentum = 0,
  onAmplifyPulse,
  onProtectStreak,
}: TuRedPowerCardProps) {
  return (
    <div className="px-4 mt-3">
      <div className="card p-3 bg-gradient-to-r from-[#1a160f] to-[#25252A] border border-[#FFD700]/20">
        <div className="text-[10px] uppercase tracking-[1px] text-[#FFD700] mb-1">
          Tu Poder en la Red
        </div>
        <div className="flex items-baseline gap-4 text-sm flex-wrap">
          <div>
            <span className="font-mono text-lg font-bold text-[#FFD700]">{networkPower}</span>{' '}
            <span className="text-[9px] text-[#9CA3AF]">Fuerza del equipo</span>
          </div>
          <div>
            <span className="font-mono text-lg font-bold text-[#22c55e]">{bondsCount}</span>{' '}
            <span className="text-[9px] text-[#9CA3AF]">Alianzas</span>
          </div>
          <div>
            <span className="font-mono text-lg font-bold text-[#FF671F]">{liveStreak}</span>{' '}
            <span className="text-[9px] text-[#9CA3AF]">Live Streak</span>
          </div>
          <div>
            <span className="font-mono text-lg font-bold text-[#EAB308]">{level}</span>{' '}
            <span className="text-[9px] text-[#9CA3AF]">Nivel</span>
          </div>
        </div>
        {gadgets.length > 0 && (
          <div className="mt-1 text-[8px] text-[#FFD700]">Gadgets: {gadgets.join(' ')}</div>
        )}
        <div className="text-[8px] text-[#9CA3AF] mt-1">
          Entrenar juntos multiplica tu peso en el GymPulse.
        </div>
        {momentum >= 20 && (
          <div className="mt-2 flex gap-1 text-[8px]">
            {momentum >= 30 && onAmplifyPulse && (
              <button
                type="button"
                onClick={onAmplifyPulse}
                className="flex-1 py-1 rounded bg-purple-500/20 text-purple-300 active:bg-purple-500/30"
              >
                📡 Amplificar 30M
              </button>
            )}
            {momentum >= 50 && onProtectStreak && (
              <button
                type="button"
                onClick={onProtectStreak}
                className="flex-1 py-1 rounded bg-yellow-500/20 text-yellow-300 active:bg-yellow-500/30"
              >
                🛡️ Proteger 50M
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
