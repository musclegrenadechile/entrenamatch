export interface WorkoutHistorySparklineProps {
  values: number[]
  className?: string
}

/** Mini sparkline de volumen para filas de historial. */
export function WorkoutHistorySparkline({ values, className = '' }: WorkoutHistorySparklineProps) {
  if (values.length < 2) return null

  const max = Math.max(1, ...values)
  const w = 56
  const h = 18
  const step = values.length > 1 ? w / (values.length - 1) : 0
  const points = values
    .map((v, i) => {
      const x = values.length > 1 ? i * step : w / 2
      const y = h - 2 - (v / max) * (h - 4)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      className={`em-v2-training-history__sparkline ${className}`.trim()}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}