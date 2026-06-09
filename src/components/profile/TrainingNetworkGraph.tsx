import type { BondNode } from './BondGraphView'

export interface TrainingNetworkGraphProps {
  selfName: string
  bonds: BondNode[]
  networkPower: number
  livePartnerIds?: string[]
  compact?: boolean
}

/** Fase 99 — sync alliance graph with live indicators on profile. */
export function TrainingNetworkGraph({
  selfName,
  bonds,
  networkPower,
  livePartnerIds = [],
  compact = false,
}: TrainingNetworkGraphProps) {
  const cx = 120
  const cy = compact ? 70 : 90
  const r = compact ? 48 : 58
  const selfFirst = (selfName || 'Tú').split(' ')[0]
  const liveSet = new Set(livePartnerIds)

  return (
    <div
      className={`training-network-graph rounded-2xl bg-[#0D0D10] border border-[#FFD700]/25 ${
        compact ? 'p-2.5' : 'p-3'
      }`}
    >
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-[#FFD700] font-bold">
          Red de entreno
        </span>
        <span className="text-[10px] text-[#9CA3AF] tabular-nums">NP {networkPower}</span>
      </div>
      <svg viewBox="0 0 240 180" className={`w-full ${compact ? 'h-[110px]' : 'h-[140px]'}`}>
        {bonds.slice(0, 8).map((b, i) => {
          const angle = (i / Math.max(bonds.length, 1)) * Math.PI * 2 - Math.PI / 2
          const x = cx + Math.cos(angle) * r
          const y = cy + Math.sin(angle) * r
          const isLive = liveSet.has(b.id)
          return (
            <g key={b.id}>
              <line
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={isLive ? '#22c55e' : '#FFD700'}
                strokeOpacity={isLive ? 0.65 : 0.35}
                strokeWidth={1 + b.bondLevel * 0.5}
              />
              <circle
                cx={x}
                cy={y}
                r={isLive ? 16 : 14}
                fill="#1C1C20"
                stroke={isLive ? '#22c55e' : '#FF671F'}
                strokeWidth={isLive ? 2.5 : 1.5}
              />
              {isLive && (
                <circle cx={x + 10} cy={y - 10} r={4} fill="#22c55e" />
              )}
              <text x={x} y={y + 4} textAnchor="middle" fill="#fff" fontSize={8} fontWeight="bold">
                {(b.name || '?').split(' ')[0].slice(0, 4)}
              </text>
            </g>
          )
        })}
        <circle cx={cx} cy={cy} r={18} fill="#FF671F" />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#000" fontSize={9} fontWeight="bold">
          {selfFirst.slice(0, 5)}
        </text>
      </svg>
      {bonds.length === 0 ? (
        <p className="text-[10px] text-[#9CA3AF] text-center -mt-1">
          Haz un EntrenaSync para crear tu primera alianza
        </p>
      ) : (
        <p className="text-[9px] text-[#6B7280] text-center mt-0.5">
          {livePartnerIds.length > 0
            ? `${livePartnerIds.length} alianza(s) en vivo ahora`
            : `${bonds.length} alianza(s) · re-sync sube tu NP`}
        </p>
      )}
    </div>
  )
}
