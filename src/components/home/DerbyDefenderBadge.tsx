import { Shield } from 'lucide-react'
import { getLatestDerbyWeekResult } from '../../services/derbyWeeklyHistory'

export function DerbyDefenderBadge({ city }: { city?: string | null }) {
  const latest = getLatestDerbyWeekResult()
  if (!latest) return null

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FFD700]/15 text-[#FFD700] text-[9px] font-bold"
      title={`Ganador derby semana ${latest.weekKey}`}
    >
      <Shield size={10} aria-hidden />
      Defensor · {latest.winnerLabel.split(' ').slice(-1)[0] || latest.winnerLabel}
    </span>
  )
}
