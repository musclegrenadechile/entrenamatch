import { Shield } from 'lucide-react'
import { getLatestDerbyWeekResult, isUserDerbyDefender } from '../../services/derbyWeeklyHistory'
import { winnerLabel, type ProfileGender } from '../../utils/genderedCopy'

export function DerbyDefenderBadge({
  city,
  gender,
}: {
  city?: string | null
  gender?: ProfileGender
}) {
  if (!isUserDerbyDefender(city)) return null
  const latest = getLatestDerbyWeekResult()
  if (!latest) return null

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FFD700]/15 text-[#FFD700] text-[9px] font-bold"
      title={`${winnerLabel(gender)} derby semana ${latest.weekKey}`}
    >
      <Shield size={10} aria-hidden />
      Defensor · {latest.winnerLabel.split(' ').slice(-1)[0] || latest.winnerLabel}
    </span>
  )
}
