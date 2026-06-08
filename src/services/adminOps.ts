/**
 * Admin ops — marketplace orders + verificación PT (marketplaceAdmins only).
 */

import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  type Firestore,
} from 'firebase/firestore'
import type { MarketplaceOrder, MarketplaceOrderStatus } from '../types'

const ORDERS = 'marketplaceOrders'
const TRAINER_PROFILES = 'trainerProfiles'

function mapOrder(id: string, data: Record<string, unknown>): MarketplaceOrder | null {
  if (typeof data.userId !== 'string') return null
  const shipping = data.shipping as Record<string, unknown> | undefined
  return {
    id,
    userId: data.userId,
    productId: String(data.productId || ''),
    productTitle: String(data.productTitle || 'Producto'),
    priceClp: Number(data.priceClp) || 0,
    category: (data.category as MarketplaceOrder['category']) || 'otro',
    shipping: {
      fullName: String(shipping?.fullName || ''),
      email: String(shipping?.email || ''),
      phone: String(shipping?.phone || ''),
      altPhone: typeof shipping?.altPhone === 'string' ? shipping.altPhone : undefined,
      address: String(shipping?.address || ''),
      city: String(shipping?.city || ''),
      region: String(shipping?.region || ''),
    },
    status: (data.status as MarketplaceOrderStatus) || 'pending_payment',
    createdAt: Number(data.createdAt) || 0,
  }
}

export function attachAllMarketplaceOrdersListener(
  db: Firestore,
  onUpdate: (orders: MarketplaceOrder[]) => void
): () => void {
  const q = query(collection(db, ORDERS), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      const list: MarketplaceOrder[] = []
      snap.forEach((d) => {
        const o = mapOrder(d.id, d.data() as Record<string, unknown>)
        if (o) list.push(o)
      })
      onUpdate(list)
    },
    () => onUpdate([])
  )
}

export function attachMyMarketplaceOrdersListener(
  db: Firestore,
  userId: string,
  onUpdate: (orders: MarketplaceOrder[]) => void
): () => void {
  if (!userId) {
    onUpdate([])
    return () => {}
  }
  const q = query(
    collection(db, ORDERS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(
    q,
    (snap) => {
      const list: MarketplaceOrder[] = []
      snap.forEach((d) => {
        const o = mapOrder(d.id, d.data() as Record<string, unknown>)
        if (o) list.push(o)
      })
      onUpdate(list)
    },
    () => onUpdate([])
  )
}

export async function updateMarketplaceOrderStatus(
  db: Firestore,
  orderId: string,
  status: MarketplaceOrderStatus
): Promise<void> {
  await updateDoc(doc(db, ORDERS, orderId), {
    status,
    updatedAt: Date.now(),
  })
}

export async function setTrainerVerified(
  db: Firestore,
  trainerUserId: string,
  verified: boolean
): Promise<void> {
  await updateDoc(doc(db, TRAINER_PROFILES, trainerUserId), {
    verified,
    updatedAt: Date.now(),
  })
}

export const ORDER_STATUS_LABELS: Record<MarketplaceOrderStatus, string> = {
  pending_payment: 'Pendiente pago',
  paid: 'Pagado',
  cancelled: 'Cancelado',
}
