import type { Profile } from '../../types'
import { calculateCompatibility, getDistanceKm } from '../../utils'
export interface MatchScoreBreakdownProps {
  me: Profile
  them: Profile
  userLocation?: { lat: number; lng: number } | null
}

export function MatchScoreBreakdown({ me, them, userLocation }: MatchScoreBreakdownProps) {
  const score = calculateCompatibility(me, them)
  const sharedTypes = me.trainingTypes.filter((t) => them.trainingTypes.includes(t))
  const sharedGoals = me.goals.filter((g) => them.goals.includes(g))
  let distLabel = '—'
  if (userLocation && them.lat && them.lng) {
    distLabel = `${Math.round(getDistanceKm(userLocation.lat, userLocation.lng, them.lat, them.lng))} km`
  }

  const rows = [
    { label: 'Tipos de entreno', value: sharedTypes.length ? sharedTypes.join(', ') : 'Sin overlap', pct: sharedTypes.length ? 40 : 10 },
    { label: 'Objetivos', value: sharedGoals.length ? sharedGoals[0] : 'Diferentes', pct: sharedGoals.length ? 35 : 8 },
    { label: 'Nivel', value: me.level === them.level ? 'Igual' : `${me.level} / ${them.level}`, pct: me.level === them.level ? 15 : 8 },
    { label: 'Zona', value: me.city === them.city ? them.city : `${me.city} → ${them.city}`, pct: me.city === them.city ? 12 : 5 },
    { label: 'Distancia', value: distLabel, pct: distLabel !== '—' && parseInt(distLabel) < 10 ? 10 : 4 },
  ]

  return (
    <details className="mt-2 rounded-xl bg-[#1C1C20] border border-[#2F2F35] overflow-hidden">
      <summary className="px-3 py-2 text-[11px] font-bold text-[#FF671F] cursor-pointer list-none flex justify-between">
        <span>Match {score}% — ver desglose</span>
        <span className="text-[#9CA3AF]">▼</span>
      </summary>
      <div className="px-3 pb-3 space-y-2">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-[#9CA3AF]">{r.label}</span>
              <span className="text-white font-medium truncate max-w-[55%] text-right">{r.value}</span>
            </div>
            <div className="h-1 bg-[#2F2F35] rounded-full">
              <div className="h-full bg-[#FF671F] rounded-full" style={{ width: `${Math.min(100, r.pct * 2.5)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </details>
  )
}
