import { useEffect, useRef, useState, useMemo } from 'react'
import { Radar } from 'lucide-react'
import { getDistanceKm } from '../../utils'
import { hasMapCoords } from '../../utils/gymPulseLive'

const RADAR_RADIUS_KM = 2
const SWEEP_MS = 3000
const PILL_AUTO_HIDE_MS = 5000

export interface GymPulseRadarProps {
  liveUsers: Array<{ id?: string; lat?: number; lng?: number; trainingNow?: boolean }>
  userLocation?: { lat: number; lng: number } | null
  onSweepStart?: () => void
  onSweepEnd?: () => void
}

export function GymPulseRadar({
  liveUsers,
  userLocation,
  onSweepStart,
  onSweepEnd,
}: GymPulseRadarProps) {
  const [sweeping, setSweeping] = useState(false)
  const [lastCount, setLastCount] = useState<number | null>(null)
  const pillTimerRef = useRef<number | null>(null)

  const countInRadius = useMemo(() => {
    if (!userLocation) return 0
    return (liveUsers || []).filter((u) => {
      if (!hasMapCoords(u)) return false
      const d = getDistanceKm(userLocation.lat, userLocation.lng, Number(u.lat), Number(u.lng))
      return d <= RADAR_RADIUS_KM
    }).length
  }, [liveUsers, userLocation])

  const schedulePillHide = () => {
    if (pillTimerRef.current) window.clearTimeout(pillTimerRef.current)
    pillTimerRef.current = window.setTimeout(() => setLastCount(null), PILL_AUTO_HIDE_MS)
  }

  const handleRadar = () => {
    if (sweeping) return
    setLastCount(countInRadius)
    setSweeping(true)
    onSweepStart?.()
    window.setTimeout(() => {
      setSweeping(false)
      onSweepEnd?.()
      schedulePillHide()
    }, SWEEP_MS)
  }

  useEffect(() => {
    return () => {
      if (pillTimerRef.current) window.clearTimeout(pillTimerRef.current)
    }
  }, [])

  const pillVisible = sweeping || lastCount != null

  return (
    <>
      <button
        type="button"
        className={`gym-pulse-radar-btn${sweeping ? ' gym-pulse-radar-btn--active' : ''}`}
        onClick={handleRadar}
        aria-label="Radar GymPulse — personas cerca"
        title="Radar: escanea 2 km a tu alrededor"
      >
        <Radar size={14} className={sweeping ? 'gym-pulse-radar-btn__spin' : ''} />
        Radar
      </button>
      {pillVisible && (
        <span className={`gym-pulse-radar-pill${sweeping ? ' gym-pulse-radar-pill--pulse' : ''}`}>
          {sweeping ? 'Escaneando…' : `${lastCount ?? countInRadius} en ${RADAR_RADIUS_KM} km`}
        </span>
      )}
    </>
  )
}
