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
    <div className="em-v2-workout-reaction" role="toolbar" aria-label="Reacciones al entreno">
      {WORKOUT_REACTIONS.map((emo) => {
        const reactors = reactions[emo] || []
        const count = reactors.length || optimisticCounts[emo] || 0
        const active = effectiveUserId ? reactors.includes(effectiveUserId) : count > 0
        return (
          <button
            key={emo}
            type="button"
            onClick={() => onReact(emo)}
            className={`em-v2-workout-reaction__btn ${active ? 'em-v2-workout-reaction__btn--active' : ''}`}
          >
            {emo}
            {count > 0 && <span className="em-v2-workout-reaction__count">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}