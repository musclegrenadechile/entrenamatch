import { TRAINER_PLATFORM_FEE_RATE } from '../../services/trainerCoach'
import type { TrainerBooking } from '../../types'

export interface TrainerEarningsPanelProps {
  bookings: TrainerBooking[]
}

export function TrainerEarningsPanel({ bookings }: TrainerEarningsPanelProps) {
  const paid = bookings.filter((b) => b.status === 'completed' || b.status === 'confirmed')
  const gross = paid.reduce((s, b) => s + (b.priceClp || 0), 0)
  const fee = Math.round(gross * TRAINER_PLATFORM_FEE_RATE)
  const net = gross - fee

  return (
    <div className="rounded-2xl border border-[#6366f1]/30 bg-[#1C1C20] p-4 space-y-3">
      <p className="text-[10px] uppercase tracking-wider text-[#6366f1] font-bold">Tus ingresos</p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-black text-white">${gross.toLocaleString('es-CL')}</p>
          <p className="text-[9px] text-[#9CA3AF]">Bruto</p>
        </div>
        <div>
          <p className="text-lg font-black text-[#FF671F]">-${fee.toLocaleString('es-CL')}</p>
          <p className="text-[9px] text-[#9CA3AF]">Comisión {Math.round(TRAINER_PLATFORM_FEE_RATE * 100)}%</p>
        </div>
        <div>
          <p className="text-lg font-black text-[#22c55e]">${net.toLocaleString('es-CL')}</p>
          <p className="text-[9px] text-[#9CA3AF]">Neto</p>
        </div>
      </div>
      <p className="text-[10px] text-[#9CA3AF]">{paid.length} sesiones completadas · self-service PT dashboard</p>
    </div>
  )
}
