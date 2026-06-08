import type { TrainerBooking } from '../../types'

export interface TrainerBookingsCalendarProps {
  bookings: TrainerBooking[]
  onSelect?: (booking: TrainerBooking) => void
}

export function TrainerBookingsCalendar({ bookings, onSelect }: TrainerBookingsCalendarProps) {
  const upcoming = [...bookings]
    .filter((b) => b.status !== 'cancelled')
    .sort((a, b) => a.scheduledAt - b.scheduledAt)

  const byDay = new Map<string, TrainerBooking[]>()
  for (const b of upcoming) {
    const d = new Date(b.scheduledAt)
    const key = d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key)!.push(b)
  }

  if (upcoming.length === 0) {
    return (
      <p className="text-sm text-[#9CA3AF] text-center py-6">Sin reservas — explora coaches y reserva tu primera sesión.</p>
    )
  }

  return (
    <div className="space-y-3">
      {[...byDay.entries()].slice(0, 14).map(([day, items]) => (
        <div key={day} className="rounded-2xl border border-[#2F2F35] overflow-hidden">
          <div className="px-3 py-1.5 bg-[#1C1C20] text-[10px] font-bold text-[#6366f1] uppercase tracking-wider">
            {day}
          </div>
          {items.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelect?.(b)}
              className="w-full px-3 py-2 text-left border-t border-[#2F2F35] active:bg-[#25252A] flex justify-between"
            >
              <span className="text-sm text-white">{b.trainerName || 'Coach'}</span>
              <span className="text-[10px] text-[#9CA3AF]">
                {new Date(b.scheduledAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
