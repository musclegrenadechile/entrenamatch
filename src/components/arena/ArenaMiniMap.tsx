/**
 * Stylized mini-map for Arena — shows live pulse + ripple waves (FOMO: "the city feels this").
 */

interface ArenaMiniMapProps {
  liveNearbyCount: number
  rippleCount: number
  cityLabel?: string
  vibe: number
}

export function ArenaMiniMap({ liveNearbyCount, rippleCount, cityLabel, vibe }: ArenaMiniMapProps) {
  const pulseIntensity = Math.min(1, vibe / 100 + rippleCount * 0.15)

  return (
    <div className="arena-mini-map">
      <div className="arena-mini-map__grid" aria-hidden />
      <div
        className="arena-mini-map__ripple arena-mini-map__ripple--1"
        style={{ opacity: 0.25 + pulseIntensity * 0.45 }}
      />
      <div
        className="arena-mini-map__ripple arena-mini-map__ripple--2"
        style={{ opacity: 0.15 + pulseIntensity * 0.35 }}
      />
      <div className="arena-mini-map__core" />
      {liveNearbyCount > 0 && (
        <>
          <span className="arena-mini-map__dot arena-mini-map__dot--a" />
          <span className="arena-mini-map__dot arena-mini-map__dot--b" />
          <span className="arena-mini-map__dot arena-mini-map__dot--c" />
        </>
      )}
      <div className="arena-mini-map__label">
        <span className="text-[#22c55e] font-bold">🌊 Onda #{Math.max(1, rippleCount)}</span>
        <span className="text-white/70">
          {liveNearbyCount > 0
            ? `${liveNearbyCount} entrenando cerca`
            : 'Propagando energía en el GymPulse'}
        </span>
        {cityLabel && <span className="text-[#FF671F]/90">{cityLabel}</span>}
      </div>
    </div>
  )
}
