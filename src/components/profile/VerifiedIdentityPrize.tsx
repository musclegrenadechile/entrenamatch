import { BadgeCheck, Shield } from 'lucide-react'
import { VERIFICATION_PERK_LABELS } from '../../utils/profileVerification'

export type VerifiedIdentityPrizeProps = {
  variant?: 'banner' | 'compact' | 'inline'
  showPerks?: boolean
  verifiedAt?: number
}

export function VerifiedIdentityPrize({
  variant = 'banner',
  showPerks = false,
  verifiedAt,
}: VerifiedIdentityPrizeProps) {
  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FF671F] to-[#f59e0b] text-black text-[10px] font-black shadow-lg shadow-[#FF671F]/30">
        <BadgeCheck size={14} strokeWidth={2.5} aria-hidden />
        VERIFICADO
      </span>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FF671F]/15 border border-[#FF671F]/40">
        <BadgeCheck size={16} className="text-[#FF671F]" aria-hidden />
        <span className="text-[11px] font-bold text-white">Identidad verificada</span>
      </div>
    )
  }

  return (
    <section
      className="rounded-2xl border border-[#FF671F]/45 bg-gradient-to-br from-[#FF671F]/20 via-[#1a1208] to-[#0f0f12] p-4"
      aria-label="Premio identidad verificada"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF671F] to-[#f59e0b] flex items-center justify-center shrink-0 shadow-lg shadow-[#FF671F]/25">
          <Shield size={22} className="text-black" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-[#FF671F] font-bold">
            Premio desbloqueado
          </p>
          <p className="text-sm font-black text-white mt-0.5">Identidad verificada</p>
          <p className="text-[11px] text-[#9CA3AF] mt-1 leading-snug">
            Rostro confirmado con selfie en vivo — cuenta más confiable para entrenar juntos.
          </p>
          {verifiedAt && (
            <p className="text-[9px] text-[#6B7280] mt-1">
              Desde {new Date(verifiedAt).toLocaleDateString('es-CL')}
            </p>
          )}
        </div>
      </div>
      {showPerks && (
        <ul className="mt-3 space-y-1.5">
          {VERIFICATION_PERK_LABELS.map((perk) => (
            <li key={perk} className="text-[10px] text-[#d1d5db] flex items-center gap-2">
              <BadgeCheck size={12} className="text-[#22c55e] shrink-0" aria-hidden />
              {perk}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
