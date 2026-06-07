/**
 * Social proof row — blurred live avatars + witness count (FOMO: others are watching).
 */

interface ArenaWitnessRowProps {
  witnessCount: number
  liveNearbyCount: number
  redLiveCount: number
}

export function ArenaWitnessRow({ witnessCount, liveNearbyCount, redLiveCount }: ArenaWitnessRowProps) {
  const slots = witnessCount > 0 ? Math.min(5, witnessCount) : 0

  return (
    <div className="arena-witness-row">
      {slots > 0 && (
        <div className="arena-witness-row__avatars" aria-hidden>
          {Array.from({ length: slots }).map((_, i) => (
            <span
              key={i}
              className="arena-witness-row__dot"
              style={{ animationDelay: `${i * 0.35}s` }}
            />
          ))}
        </div>
      )}
      <div className="arena-witness-row__copy">
        <span className="arena-witness-row__count">
          {witnessCount > 0
            ? `${witnessCount} presenciando`
            : liveNearbyCount > 0
              ? 'Visible en GymPulse — aún sin testigos'
              : 'Propagando en GymPulse'}
        </span>
        {redLiveCount > 0 && (
          <span className="arena-witness-row__red">{redLiveCount} de tu red en vivo</span>
        )}
      </div>
    </div>
  )
}
