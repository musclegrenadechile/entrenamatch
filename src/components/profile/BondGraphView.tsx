/** SVG bond graph — nodes = sync partners, edges = bonds */
export interface BondNode {
  id: string
  name: string
  bondLevel: number
  totalMin: number
}

export interface BondGraphViewProps {
  selfName: string
  bonds: BondNode[]
  networkPower: number
}

export function BondGraphView({ selfName, bonds, networkPower }: BondGraphViewProps) {
  const cx = 120
  const cy = 90
  const r = 58
  const selfFirst = (selfName || 'Tú').split(' ')[0]

  return (
    <div className="bond-graph-view rounded-2xl bg-[#0D0D10] border border-[#FFD700]/20 p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] uppercase tracking-wider text-[#FFD700] font-bold">Grafo de alianzas</span>
        <span className="text-[10px] text-[#9CA3AF]">NP {networkPower}</span>
      </div>
      <svg viewBox="0 0 240 180" className="w-full h-[140px]">
        {bonds.slice(0, 6).map((b, i) => {
          const angle = (i / Math.max(bonds.length, 1)) * Math.PI * 2 - Math.PI / 2
          const x = cx + Math.cos(angle) * r
          const y = cy + Math.sin(angle) * r
          return (
            <g key={b.id}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="#FFD700" strokeOpacity={0.35} strokeWidth={1 + b.bondLevel * 0.5} />
              <circle cx={x} cy={y} r={14} fill="#1C1C20" stroke="#FF671F" strokeWidth={1.5} />
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
      {bonds.length === 0 && (
        <p className="text-[10px] text-[#9CA3AF] text-center -mt-2">Sync con alguien para crear tu primera alianza</p>
      )}
    </div>
  )
}
