import { ChevronRight, ShoppingBag } from 'lucide-react'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

export function ProfileMarketplaceEntry(props: ProfileTabProps) {
  const { onOpenMarketplace } = profileTabBindings(props)
  if (!onOpenMarketplace) return null

  return (
    <div className="px-4 mt-3 mb-1">
      <button
        type="button"
        onClick={onOpenMarketplace}
        className="w-full flex items-center gap-3 p-4 rounded-2xl border border-[#FF671F]/30 bg-gradient-to-br from-[#FF671F]/10 to-transparent text-left active:scale-[0.99] transition-transform"
      >
        <div className="w-11 h-11 rounded-xl bg-[#FF671F]/20 flex items-center justify-center text-[#FF671F]">
          <ShoppingBag size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm">Tienda EntrenaMatch</p>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">
            Productos oficiales · pago seguro con Mercado Pago
          </p>
        </div>
        <ChevronRight size={18} className="text-[#FF671F] shrink-0" />
      </button>
    </div>
  )
}
