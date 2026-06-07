/**
 * Floating FOMO bar — visible when EntrenaSync is active (even if Arena minimized).
 * Shows live global sync activity so users feel the network is watching.
 */

export interface ArenaGlobalPulseItem {
  names: string
  vibe: number
}

export interface ArenaGlobalPulseBarProps {
  partnerName: string
  syncVibe: number
  witnessCount: number
  waveCount: number
  globalPairs: ArenaGlobalPulseItem[]
  onOpenArena: () => void
}

export function ArenaGlobalPulseBar({
  partnerName,
  syncVibe,
  witnessCount,
  waveCount,
  globalPairs,
  onOpenArena,
}: ArenaGlobalPulseBarProps) {
  const partnerFirst = partnerName.split(' ')[0] || 'Compañero'
  const others =
    globalPairs.length > 0
      ? globalPairs
          .slice(0, 2)
          .map((p) => p.names)
          .join(' · ')
      : null

  return (
    <button
      type="button"
      className="arena-global-pulse-bar"
      onClick={onOpenArena}
      aria-label="Abrir EntrenaSync Arena"
    >
      <span className="arena-global-pulse-bar__live">SYNC</span>
      <span className="arena-global-pulse-bar__main">
        <strong>
          {partnerFirst} × tú · {syncVibe}%
        </strong>
        {witnessCount > 0 && (
          <span className="arena-global-pulse-bar__witness">👁️ {witnessCount} presenciando</span>
        )}
        {waveCount > 0 && (
          <span className="arena-global-pulse-bar__wave">🌊 Onda #{waveCount}</span>
        )}
      </span>
      {others && (
        <span className="arena-global-pulse-bar__others">+ {others} en la red</span>
      )}
      <span className="arena-global-pulse-bar__cta">Arena →</span>
    </button>
  )
}
