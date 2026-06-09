import { cityChampionLabel, type ProfileGender } from '../../utils/genderedCopy'

export interface CityChallengeCelebrationModalProps {
  open: boolean
  cityLabel: string
  targetMinutes: number
  gender?: ProfileGender
  onClose: () => void
}

export function CityChallengeCelebrationModal({
  open,
  cityLabel,
  targetMinutes,
  gender,
  onClose,
}: CityChallengeCelebrationModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 p-4" onClick={onClose}>
      <div
        className="max-w-sm w-full rounded-3xl p-6 text-center border border-[#FFD700]/40 bg-gradient-to-b from-[#1a160f] to-[#0D0D10]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl mb-3">🏆</div>
        <p className="text-[10px] uppercase tracking-widest text-[#FFD700] font-bold">City Challenge</p>
        <h2 className="text-xl font-black text-white mt-1">{cityLabel} lo logró</h2>
        <p className="text-sm text-[#9CA3AF] mt-2">
          {targetMinutes} min de live + sync esta semana. Tu ciudad desbloqueó el badge colectivo.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/40">
          <span className="text-2xl">🌆</span>
          <span className="text-sm font-bold text-[#FFD700]">{cityChampionLabel(gender, cityLabel)}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-2xl bg-[#FF671F] text-black font-bold"
        >
          ¡Genial!
        </button>
      </div>
    </div>
  )
}
