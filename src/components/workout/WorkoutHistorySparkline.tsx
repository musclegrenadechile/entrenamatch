import type { WorkoutHistorySparklinePoint } from '../../utils/workoutHistorySparkline'
import {
  buildWorkoutHistorySparklinePrToneAriaLabel,
  resolveWorkoutHistorySparklinePrToneClass,
} from '../../utils/workoutHistorySparklinePrToneDisplay'

export interface WorkoutHistorySparklineProps {
  points: WorkoutHistorySparklinePoint[]
  className?: string
}

/** Mini sparkline de volumen para filas de historial; puntos PR resaltados (oleada 396). */
export function WorkoutHistorySparkline({ points, className = '' }: WorkoutHistorySparklineProps) {
  if (points.length < 2) return null

  const values = points.map((p) => p.volumeKg)
  const max = Math.max(1, ...values)
  const w = 56
  const h = 18
  const step = points.length > 1 ? w / (points.length - 1) : 0
  const coords = points.map((p, i) => {
    const x = points.length > 1 ? i * step : w / 2
    const y = h - 2 - (p.volumeKg / max) * (h - 4)
    return { x, y, isPr: p.isPr }
  })
  const polyline = coords.map((c) => `${c.x},${c.y}`).join(' ')
  const hasPr = points.some((p) => p.isPr)
  const sparklinePrToneClass = resolveWorkoutHistorySparklinePrToneClass(hasPr)
  const ariaLabel = buildWorkoutHistorySparklinePrToneAriaLabel(points)

  return (
    <svg
      className={['em-v2-training-history__sparkline', sparklinePrToneClass, className]
        .filter(Boolean)
        .join(' ')}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel}
    >
      <polyline
        points={polyline}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {coords.map((c, i) =>
        c.isPr ? (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r="2.5"
            className="em-v2-training-history__sparkline-dot--pr"
          />
        ) : null
      )}
    </svg>
  )
}