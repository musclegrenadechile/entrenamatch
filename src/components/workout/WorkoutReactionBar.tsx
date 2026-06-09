const WORKOUT_REACTIONS = ['💪', '🔥', '🏆', '⚡'] as const

export interface WorkoutReactionBarProps {
  postId: string
  reactions?: Record<string, string[]>
  optimisticCounts?: Record<string, number>
  effectiveUserId?: string
  onReact: (emoji: string) => void
}

export function WorkoutReactionBar({
  reactions = {},
  optimisticCounts = {},
  effectiveUserId,
  onReact,
}: WorkoutReactionBarProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-white/8">
      {WORKOUT_REACTIONS.map((emo) => {
        const reactors = reactions[emo] || []
        const count = reactors.length || optimisticCounts[emo] || 0
        const active = effectiveUserId ? reactors.includes(effectiveUserId) : count > 0
        return (
          <button
            key={emo}
            type="button"
            onClick={() => onReact(emo)}
            className={`text-[11px] px-2 py-1 rounded-full border transition active:scale-95 ${
              active
                ? 'border-[#FF671F]/50 bg-[#FF671F]/15 text-white'
                : 'border-white/10 bg-white/5 text-[#9CA3AF]'
            }`}
          >
            {emo}
            {count > 0 && <span className="ml-1 tabular-nums font-bold">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
