import { TRAINER_PLATFORM_FEE_RATE } from '../../services/trainerCoach'
import type { TrainerBooking } from '../../types'

export interface TrainerEarningsPanelProps {
  bookings: TrainerBooking[]
}

export function TrainerEarningsPanel({ bookings }: TrainerEarningsPanelProps) {
  const cardPaid = bookings.filter((b) => b.status === 'paid_card')
  const cashPaid = bookings.filter((b) => b.status === 'paid_cash')
  const grossCard = cardPaid.reduce((s, b) => s + (b.priceClp || 0), 0)
  const feeCard = cardPaid.reduce(
    (s, b) => s + (b.platformFeeClp ?? Math.round((b.priceClp || 0) * TRAINER_PLATFORM_FEE_RATE)),
    0
  )
  const netCard = cardPaid.reduce(
    (s, b) =>
      s +
      (b.trainerNetClp ??
        (b.priceClp || 0) -
          (b.platformFeeClp ?? Math.round((b.priceClp || 0) * TRAINER_PLATFORM_FEE_RATE))),
    0
  )
  const pendingPayout = cardPaid.filter((b) => !b.payoutStatus || b.payoutStatus === 'pending')
  const pendingAmount = pendingPayout.reduce(
    (s, b) =>
      s +
      (b.trainerNetClp ??
        (b.priceClp || 0) -
          (b.platformFeeClp ?? Math.round((b.priceClp || 0) * TRAINER_PLATFORM_FEE_RATE))),
    0
  )
  const cashGross = cashPaid.reduce((s, b) => s + (b.priceClp || 0), 0)

  return (
    <div className="rounded-2xl border border-[#6366f1]/30 bg-[#1C1C20] p-4 space-y-3">
      <p className="text-[10px] uppercase tracking-wider text-[#6366f1] font-bold">Tus ingresos</p>
      <p className="text-[10px] text-[#9CA3AF]">
        Tarjeta: EntrenaMatch cobra al cliente y te transfiere tu parte. Efectivo: cobras directo en sesión.
      </p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-black text-white">${grossCard.toLocaleString('es-CL')}</p>
          <p className="text-[9px] text-[#9CA3AF]">Bruto tarjeta</p>
        </div>
        <div>
          <p className="text-lg font-black text-[#FF671F]">-${feeCard.toLocaleString('es-CL')}</p>
          <p className="text-[9px] text-[#9CA3AF]">Comisión {Math.round(TRAINER_PLATFORM_FEE_RATE * 100)}%</p>
        </div>
        <div>
          <p className="text-lg font-black text-[#22c55e]">${netCard.toLocaleString('es-CL')}</p>
          <p className="text-[9px] text-[#9CA3AF]">Neto tarjeta</p>
        </div>
      </div>
      {pendingPayout.length > 0 && (
        <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2">
          ${pendingAmount.toLocaleString('es-CL')} CLP pendientes de transferencia ({pendingPayout.length}{' '}
          sesión{pendingPayout.length !== 1 ? 'es' : ''})
        </p>
      )}
      {cardPaid.some((b) => b.payoutStatus === 'paid') && (
        <p className="text-[10px] text-[#22c55e]">
          {cardPaid.filter((b) => b.payoutStatus === 'paid').length} sesiones ya liquidadas por EntrenaMatch
        </p>
      )}
      {cashGross > 0 && (
        <p className="text-[10px] text-[#9CA3AF]">
          + ${cashGross.toLocaleString('es-CL')} CLP en efectivo ({cashPaid.length} sesiones)
        </p>
      )}
      <p className="text-[10px] text-[#9CA3AF]">
        {cardPaid.length} pagadas con tarjeta · {cashPaid.length} en efectivo
      </p>
    </div>
  )
}
