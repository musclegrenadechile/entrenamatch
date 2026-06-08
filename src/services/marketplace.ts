/**
 * Marketplace — productos publicados solo por marketplaceAdmins/{uid} (desarrollador).
 * Compra vía paymentUrl (Mercado Pago, Stripe Link, etc.).
 */

import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  type Firestore,
} from 'firebase/firestore'
import type { MarketplaceCategory, MarketplaceProduct } from '../types'

const COLLECTION = 'marketplaceProducts'
const ADMIN_COLLECTION = 'marketplaceAdmins'

export function formatClp(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export async function checkMarketplaceAdmin(
  db: Firestore,
  uid: string
): Promise<boolean> {
  if (!uid) return false
  try {
    const snap = await getDoc(doc(db, ADMIN_COLLECTION, uid))
    return snap.exists()
  } catch {
    return false
  }
}

export function attachMarketplaceAdminListener(
  db: Firestore,
  uid: string,
  onChange: (isAdmin: boolean) => void
): () => void {
  if (!uid) {
    onChange(false)
    return () => {}
  }
  return onSnapshot(
    doc(db, ADMIN_COLLECTION, uid),
    (snap) => onChange(snap.exists()),
    () => onChange(false)
  )
}

function mapProduct(id: string, data: Record<string, unknown>): MarketplaceProduct | null {
  if (typeof data.title !== 'string' || typeof data.paymentUrl !== 'string') return null
  return {
    id,
    title: data.title,
    description: typeof data.description === 'string' ? data.description : '',
    priceClp: typeof data.priceClp === 'number' ? data.priceClp : 0,
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
    paymentUrl: data.paymentUrl,
    category: (data.category as MarketplaceCategory) || 'otro',
    active: data.active !== false,
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : 0,
    updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : 0,
  }
}

export function attachMarketplaceProductsListener(
  db: Firestore,
  onUpdate: (products: MarketplaceProduct[]) => void,
  opts?: { includeInactive?: boolean }
): () => void {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      const list: MarketplaceProduct[] = []
      snap.forEach((d) => {
        const p = mapProduct(d.id, d.data() as Record<string, unknown>)
        if (!p) return
        if (!opts?.includeInactive && !p.active) return
        list.push(p)
      })
      onUpdate(list)
    },
    (err) => {
      console.warn('marketplace listener error', err)
      onUpdate([])
    }
  )
}

export interface MarketplaceProductInput {
  title: string
  description: string
  priceClp: number
  imageUrl?: string
  paymentUrl: string
  category: MarketplaceCategory
  active: boolean
}

export async function createMarketplaceProduct(
  db: Firestore,
  uid: string,
  input: MarketplaceProductInput
): Promise<string> {
  const id = `mp_${Date.now()}`
  const now = Date.now()
  await setDoc(doc(db, COLLECTION, id), {
    ...input,
    createdBy: uid,
    createdAt: now,
    updatedAt: now,
  })
  return id
}

export async function updateMarketplaceProduct(
  db: Firestore,
  productId: string,
  patch: Partial<MarketplaceProductInput>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, productId), {
    ...patch,
    updatedAt: Date.now(),
  })
}

export async function deleteMarketplaceProduct(
  db: Firestore,
  productId: string
): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, productId))
}

export const DEMO_MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'demo-1',
    title: 'Shaker EntrenaMatch 700ml',
    description: 'Shaker oficial con logo — ideal para pre/post entreno.',
    priceClp: 12990,
    paymentUrl: 'https://www.mercadopago.cl/',
    category: 'equipo',
    active: true,
    createdBy: 'demo',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'demo-2',
    title: 'Plan Nutrición Sync 4 semanas',
    description: 'Guía digital + check-ins semanales con el equipo EntrenaMatch.',
    priceClp: 29990,
    paymentUrl: 'https://www.mercadopago.cl/',
    category: 'digital',
    active: true,
    createdBy: 'demo',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
]
