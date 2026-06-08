export interface PartnerGymDashboardProps {
  gymName: string
  checkInsToday: number
  liveNow: number
  promos?: string[]
  loading?: boolean
}

export function PartnerGymDashboard({
  gymName,
  checkInsToday,
  liveNow,
  promos = [],
  loading = false,
}: PartnerGymDashboardProps) {
  return (
    <div className="rounded-2xl border border-[#22c55e]/30 bg-[#0a2a1a]/50 p-4">
      <p className="text-[10px] uppercase tracking-wider text-[#22c55e] font-bold">Partner Gym</p>
      <p className="text-sm font-bold text-white mt-1">{gymName}</p>
      {loading ? (
        <p className="text-[10px] text-[#9CA3AF] mt-2">Actualizando stats…</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 mt-3 text-center">
          <div className="p-2 rounded-xl bg-black/30">
            <p className="text-lg font-black text-[#22c55e]">{checkInsToday}</p>
            <p className="text-[9px] text-[#9CA3AF]">Check-ins hoy</p>
          </div>
          <div className="p-2 rounded-xl bg-black/30">
            <p className="text-lg font-black text-[#FF671F]">{liveNow}</p>
            <p className="text-[9px] text-[#9CA3AF]">En vivo ahora</p>
          </div>
        </div>
      )}
      {promos.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-[9px] uppercase tracking-wider text-[#6B7280] font-bold">Promos activas</p>
          {promos.slice(0, 2).map((p) => (
            <p key={p} className="text-[10px] text-[#9CA3AF] leading-snug">
              • {p}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
