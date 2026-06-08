import { Package, ShoppingBag, X } from 'lucide-react'
import type { MarketplaceOrder, MarketplaceProduct } from '../../types'

export interface HomeShopBannerProps {
  orders: MarketplaceOrder[]
  products: MarketplaceProduct[]
  onOpenShop: () => void
  onOpenOrders: () => void
  onDismiss: () => void
}

const ACTIVE_ORDER_STATUSES = new Set(['pending_payment', 'paid', 'shipped'])

function formatClp(n: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n)
}

export function HomeShopBanner({
  orders,
  products,
  onOpenShop,
  onOpenOrders,
  onDismiss,
}: HomeShopBannerProps) {
  const activeOrders = orders.filter((o) => ACTIVE_ORDER_STATUSES.has(o.status))
  const featured = products.filter((p) => p.active).slice(0, 2)

  if (activeOrders.length === 0 && featured.length === 0) return null

  return (
    <div className="mb-3 rounded-2xl border border-[#FF671F]/35 bg-gradient-to-r from-[#FF671F]/10 via-[#1C1C20] to-[#FFD700]/10 p-3 relative">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-2 right-2 text-[#9CA3AF] active:text-white p-1"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>

      <div className="flex items-center gap-2 mb-2 pr-6">
        <ShoppingBag size={16} className="text-[#FF671F]" />
        <p className="text-xs font-bold text-white">Tienda EntrenaMatch</p>
      </div>

      {activeOrders.length > 0 && (
        <button
          type="button"
          onClick={onOpenOrders}
          className="w-full text-left mb-2 p-2 rounded-xl bg-black/30 border border-[#FF671F]/20 active:bg-black/50"
        >
          <div className="flex items-center gap-2">
            <Package size={14} className="text-[#FF671F]" />
            <span className="text-[11px] font-semibold text-white">
              {activeOrders.length} pedido{activeOrders.length !== 1 ? 's' : ''} en curso
            </span>
          </div>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5 truncate">
            {activeOrders[0].productTitle} ·{' '}
            {activeOrders[0].status === 'shipped' ? 'En camino' : 'Ver estado'}
          </p>
        </button>
      )}

      {featured.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {featured.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={onOpenShop}
              className="flex-shrink-0 min-w-[120px] p-2 rounded-xl bg-[#1C1C20] border border-[#2F2F35] active:bg-[#25252A] text-left"
            >
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt=""
                  className="w-full h-14 object-cover rounded-lg mb-1"
                />
              ) : (
                <div className="w-full h-14 rounded-lg bg-[#2F2F35] mb-1 flex items-center justify-center text-lg">
                  🛍️
                </div>
              )}
              <p className="text-[10px] font-semibold text-white truncate">{p.title}</p>
              <p className="text-[9px] text-[#FF671F] font-bold">{formatClp(p.priceClp)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
