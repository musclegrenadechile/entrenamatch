/**
 * Witness presence — real avatars when available (Arena 2.0).
 */

export interface ArenaWitnessProfile {
  id: string
  name: string
  photo?: string
}

interface ArenaWitnessRowProps {
  witnessCount: number
  witnessProfiles?: ArenaWitnessProfile[]
  liveNearbyCount: number
  redLiveCount: number
  newWitnessGlow?: boolean
}

export function ArenaWitnessRow({
  witnessCount,
  witnessProfiles = [],
  liveNearbyCount,
  redLiveCount,
  newWitnessGlow,
}: ArenaWitnessRowProps) {
  const shown = witnessProfiles.slice(0, 3)
  const extra = Math.max(0, witnessCount - shown.length)

  return (
    <div className={`arena-witness-row ${newWitnessGlow ? 'arena-witness-row--glow' : ''}`}>
      {shown.length > 0 && (
        <div className="arena-witness-row__avatars">
          {shown.map((w) => (
            <span key={w.id} className="arena-witness-row__avatar" title={w.name}>
              {w.photo ? (
                <img src={w.photo} alt="" />
              ) : (
                <span>{(w.name || '?')[0]}</span>
              )}
            </span>
          ))}
          {extra > 0 && <span className="arena-witness-row__more">+{extra}</span>}
        </div>
      )}
      <div className="arena-witness-row__copy">
        <span className="arena-witness-row__count">
          {witnessCount > 0
            ? `${witnessCount} en el GymPulse`
            : liveNearbyCount > 0
              ? 'Visible en mapa — sin testigos aún'
              : 'Tu sync ondea en el GymPulse'}
        </span>
        {redLiveCount > 0 && (
          <span className="arena-witness-row__red">{redLiveCount} de tu red en vivo</span>
        )}
      </div>
    </div>
  )
}
