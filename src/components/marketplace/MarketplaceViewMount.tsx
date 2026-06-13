import type { Firestore } from 'firebase/firestore'
import { toast } from 'sonner'
import type {
  MarketplaceOrder,
  MarketplaceProduct,
  MarketplaceProductInput,
  MarketplaceShippingInfo,
} from '../../types'
import {
  createMarketplaceOrder,
  createMarketplaceProduct,
  deleteMarketplaceProduct,
  updateMarketplaceProduct,
} from '../../services/marketplace'
import { MarketplaceView } from './MarketplaceView'

export type MarketplaceViewMountProps = {
  open: boolean
  screenMode: 'shop' | 'orders'
  onClose: () => void
  products: MarketplaceProduct[]
  isAdmin: boolean
  isDemoMode: boolean
  userUid?: string
  userEmail?: string
  myOrders: MarketplaceOrder[]
  db: Firestore | null
}

/** Fase 367 — Marketplace modal + Firestore handlers extracted from App.tsx. */
export function MarketplaceViewMount({
  open,
  screenMode,
  onClose,
  products,
  isAdmin,
  isDemoMode,
  userUid,
  userEmail,
  myOrders,
  db,
}: MarketplaceViewMountProps) {
  return (
    <MarketplaceView
      open={open}
      onClose={onClose}
      initialScreenMode={screenMode}
      products={products}
      isAdmin={isAdmin}
      isDemoMode={isDemoMode}
      userUid={userUid}
      userEmail={userEmail}
      myOrders={myOrders}
      onCreateProduct={async (input: MarketplaceProductInput) => {
        if (!db || !userUid) throw new Error('auth')
        await createMarketplaceProduct(db, userUid, input)
      }}
      onUpdateProduct={async (id, patch) => {
        if (!db) throw new Error('db')
        await updateMarketplaceProduct(db, id, patch)
      }}
      onDeleteProduct={async (id) => {
        if (!db) throw new Error('db')
        await deleteMarketplaceProduct(db, id)
      }}
      onCheckout={async (product, shipping: MarketplaceShippingInfo) => {
        if (!db || !userUid) throw new Error('auth')
        return createMarketplaceOrder(db, userUid, product, shipping)
      }}
    />
  )
}
