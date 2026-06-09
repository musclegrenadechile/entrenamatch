import { buildInviteLink } from '../../utils/sparseCityDefaults'

export interface ReferralInviteCardProps {
  referralCode: string
  onShare: () => void
}

export function ReferralInviteCard({ referralCode, onShare }: ReferralInviteCardProps) {
  const link = buildInviteLink(referralCode)

  return (
    <div className="rounded-2xl border border-[#22c55e]/30 bg-gradient-to-r from-[#0a2a1a] to-[#1C1C20] p-4">
      <p className="text-[10px] uppercase tracking-wider text-[#22c55e] font-bold">Invita a tu gym</p>
      <p className="text-sm text-white font-semibold mt-1">Comparte EntrenaMatch</p>
      <p className="text-[10px] text-[#9CA3AF] mt-1 break-all">{link}</p>
      <button
        type="button"
        onClick={onShare}
        className="mt-3 w-full py-2 rounded-xl bg-[#22c55e] text-black font-bold text-sm"
      >
        Copiar enlace de invitación
      </button>
    </div>
  )
}

export function parseReferralFromUrl(): string | null {
  try {
    return new URLSearchParams(window.location.search).get('ref')
  } catch {
    return null
  }
}
