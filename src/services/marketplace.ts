/**
 * Marketplace — productos publicados solo por marketplaceAdmins/{uid} (desarrollador).
 * Compra vía paymentUrl (Mercado Pago, Stripe Link, etc.).
 */

import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  type Firestore,
} from 'firebase/firestore'
import type { MarketplaceCategory, MarketplaceProduct, MarketplaceShippingInfo } from '../types'
import { storage } from './firebase'

const COLLECTION = 'marketplaceProducts'
const ADMIN_COLLECTION = 'marketplaceAdmins'
const ORDERS_COLLECTION = 'marketplaceOrders'
const SHIPPING_STORAGE_KEY = 'entrenamatch_marketplace_shipping_v1'

export function formatClp(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function productRequiresShipping(category: MarketplaceCategory): boolean {
  return category !== 'digital'
}

export function loadSavedMarketplaceShipping(): Partial<MarketplaceShippingInfo> | null {
  try {
    const raw = localStorage.getItem(SHIPPING_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Partial<MarketplaceShippingInfo>
  } catch {
    return null
  }
}

export function saveMarketplaceShipping(info: MarketplaceShippingInfo): void {
  try {
    localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(info))
  } catch {
    /* quota / private mode */
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[\d\s+()-]{8,20}$/

export function validateMarketplaceShipping(
  info: MarketplaceShippingInfo,
  requiresShipping: boolean
): string | null {
  if (!info.fullName.trim() || info.fullName.trim().length < 3) {
    return 'Ingresa tu nombre completo'
  }
  if (!EMAIL_RE.test(info.email.trim())) {
    return 'Correo electrónico inválido'
  }
  if (!PHONE_RE.test(info.phone.trim())) {
    return 'Teléfono inválido (mín. 8 dígitos)'
  }
  if (info.altPhone?.trim() && !PHONE_RE.test(info.altPhone.trim())) {
    return 'Teléfono alternativo inválido'
  }
  if (requiresShipping) {
    if (!info.address.trim() || info.address.trim().length < 5) {
      return 'Ingresa tu dirección de envío'
    }
    if (!info.city.trim()) {
      return 'Ingresa tu ciudad'
    }
    if (!info.region.trim()) {
      return 'Selecciona tu región'
    }
  }
  return null
}

export async function createMarketplaceOrder(
  db: Firestore,
  uid: string,
  product: MarketplaceProduct,
  shipping: MarketplaceShippingInfo
): Promise<string> {
  const requiresShipping = productRequiresShipping(product.category)
  const err = validateMarketplaceShipping(shipping, requiresShipping)
  if (err) throw new Error(err)

  const id = `mo_${Date.now()}_${uid.slice(0, 6)}`
  const payload = {
    userId: uid,
    productId: product.id,
    productTitle: product.title,
    priceClp: product.priceClp,
    category: product.category,
    shipping: {
      fullName: shipping.fullName.trim(),
      email: shipping.email.trim().toLowerCase(),
      phone: shipping.phone.trim(),
      ...(shipping.altPhone?.trim() ? { altPhone: shipping.altPhone.trim() } : {}),
      address: shipping.address.trim(),
      city: shipping.city.trim(),
      region: shipping.region.trim(),
    },
    status: 'pending_payment' as const,
    createdAt: Date.now(),
  }
  await setDoc(doc(db, ORDERS_COLLECTION, id), payload)
  saveMarketplaceShipping(shipping)
  return id
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
  const imageUrls = Array.isArray(data.imageUrls)
    ? data.imageUrls.map(String).filter(Boolean).slice(0, 3)
    : undefined
  const imageUrl =
    typeof data.imageUrl === 'string'
      ? data.imageUrl
      : imageUrls?.[0]
  return {
    id,
    title: data.title,
    description: typeof data.description === 'string' ? data.description : '',
    priceClp: typeof data.priceClp === 'number' ? data.priceClp : 0,
    imageUrl,
    imageUrls: imageUrls?.length ? imageUrls : imageUrl ? [imageUrl] : undefined,
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
  // Non-admins may only read active products (firestore.rules). The query must
  // filter active==true or Firestore rejects the whole list (permission-denied).
  const col = collection(db, COLLECTION)
  const q = opts?.includeInactive
    ? query(col, orderBy('createdAt', 'desc'))
    : query(col, where('active', '==', true), orderBy('createdAt', 'desc'))

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
      console.warn('marketplace products listener error', err)
      onUpdate([])
    }
  )
}

export interface MarketplaceProductInput {
  title: string
  description: string
  priceClp: number
  imageUrl?: string
  imageUrls?: string[]
  paymentUrl: string
  category: MarketplaceCategory
  active: boolean
}

/** Upload up to 3 product images to Storage (marketplace admin). */
export async function uploadMarketplaceProductImages(
  uid: string,
  files: File[],
  onProgress?: (pct: number) => void
): Promise<string[]> {
  if (!storage || files.length === 0) return []
  const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')
  const urls: string[] = []
  const batch = files.slice(0, 3)
  for (let i = 0; i < batch.length; i++) {
    const file = batch[i]
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `marketplace/${uid}/${Date.now()}_${i}.${ext}`
    const storageRef = ref(storage, path)
    await new Promise<void>((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file, {
        contentType: file.type || 'image/jpeg',
      })
      task.on(
        'state_changed',
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
          onProgress?.(Math.round(((i + pct / 100) / batch.length) * 100))
        },
        reject,
        () => resolve()
      )
    })
    urls.push(await getDownloadURL(storageRef))
  }
  return urls
}

export async function createMarketplaceProduct(
  db: Firestore,
  uid: string,
  input: MarketplaceProductInput
): Promise<string> {
  const id = `mp_${Date.now()}`
  const now = Date.now()
  const imageUrls = (input.imageUrls || []).filter(Boolean).slice(0, 3)
  const imageUrl = imageUrls[0] || input.imageUrl?.trim()
  await setDoc(doc(db, COLLECTION, id), {
    title: input.title,
    description: input.description,
    priceClp: input.priceClp,
    paymentUrl: input.paymentUrl,
    category: input.category,
    active: input.active !== false,
    ...(imageUrl ? { imageUrl } : {}),
    ...(imageUrls.length ? { imageUrls } : {}),
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
  const imageUrls = patch.imageUrls?.filter(Boolean).slice(0, 3)
  const payload: Record<string, unknown> = { ...patch, updatedAt: Date.now() }
  if (imageUrls) {
    payload.imageUrls = imageUrls
    payload.imageUrl = imageUrls[0] || patch.imageUrl || null
  }
  await updateDoc(doc(db, COLLECTION, productId), payload)
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
