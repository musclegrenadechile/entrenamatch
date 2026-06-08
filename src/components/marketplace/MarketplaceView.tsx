import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ExternalLink, ImagePlus, Package, Pencil, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import type { MarketplaceCategory, MarketplaceOrder, MarketplaceProduct, MarketplaceShippingInfo } from '../../types'
import {
  formatClp,
  uploadMarketplaceProductImages,
  type MarketplaceProductInput,
} from '../../services/marketplace'
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW } from '../../services/adminOps'
import { openMarketplacePayment } from '../../services/marketplacePayments'
import { MarketplaceCheckout } from './MarketplaceCheckout'

const CATEGORIES: { id: MarketplaceCategory; label: string }[] = [
  { id: 'suplemento', label: 'Suplemento' },
  { id: 'ropa', label: 'Ropa' },
  { id: 'equipo', label: 'Equipo' },
  { id: 'digital', label: 'Digital' },
  { id: 'otro', label: 'Otro' },
]

export interface MarketplaceViewProps {
  open: boolean
  onClose: () => void
  products: MarketplaceProduct[]
  isAdmin: boolean
  isDemoMode: boolean
  userUid?: string
  userEmail?: string
  onRefreshAdmin?: () => void
  onCreateProduct: (input: MarketplaceProductInput) => Promise<void>
  onUpdateProduct: (id: string, patch: Partial<MarketplaceProductInput>) => Promise<void>
  onDeleteProduct: (id: string) => Promise<void>
  onCheckout: (product: MarketplaceProduct, shipping: MarketplaceShippingInfo) => Promise<string>
  myOrders?: MarketplaceOrder[]
  initialScreenMode?: 'shop' | 'orders'
}

const EMPTY_FORM: MarketplaceProductInput = {
  title: '',
  description: '',
  priceClp: 0,
  imageUrl: '',
  imageUrls: [],
  paymentUrl: '',
  category: 'otro',
  active: true,
}

function productImages(product: MarketplaceProduct): string[] {
  if (product.imageUrls?.length) return product.imageUrls.slice(0, 3)
  return product.imageUrl ? [product.imageUrl] : []
}

function ProductImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => setIdx(0), [images.join('|')])
  if (images.length === 0) {
    return (
      <div className="marketplace-card__placeholder">
        <ShoppingBag size={28} />
      </div>
    )
  }
  return (
    <div className="marketplace-card__carousel">
      <img src={images[idx]} alt={title} className="marketplace-card__img" />
      {images.length > 1 && (
        <>
          <div className="marketplace-card__dots">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={i === idx ? 'marketplace-card__dot--active' : 'marketplace-card__dot'}
                onClick={(e) => {
                  e.stopPropagation()
                  setIdx(i)
                }}
                aria-label={`Imagen ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            className="marketplace-card__nav marketplace-card__nav--prev"
            onClick={(e) => {
              e.stopPropagation()
              setIdx((i) => (i - 1 + images.length) % images.length)
            }}
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="marketplace-card__nav marketplace-card__nav--next"
            onClick={(e) => {
              e.stopPropagation()
              setIdx((i) => (i + 1) % images.length)
            }}
            aria-label="Siguiente"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}

function ProductCard({
  product,
  isAdmin,
  onBuy,
  onEdit,
  onDelete,
}: {
  product: MarketplaceProduct
  isAdmin: boolean
  onBuy: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const images = productImages(product)
  return (
    <article
      className={`marketplace-card ${!product.active ? 'marketplace-card--inactive' : ''}`}
    >
      <div className="marketplace-card__media">
        <ProductImageCarousel images={images} title={product.title} />
        {!product.active && <span className="marketplace-card__badge-off">Oculto</span>}
      </div>
      <div className="marketplace-card__body">
        <p className="marketplace-card__category">
          {CATEGORIES.find((c) => c.id === product.category)?.label || 'Producto'}
        </p>
        <h3 className="marketplace-card__title">{product.title}</h3>
        {product.description && (
          <p className="marketplace-card__desc">{product.description}</p>
        )}
        <p className="marketplace-card__price">{formatClp(product.priceClp)}</p>
        {product.active ? (
          <div className="marketplace-card__buy-row">
            <button type="button" className="marketplace-card__pay" onClick={onBuy}>
              Comprar
            </button>
            {product.paymentUrl.startsWith('https://') && (
              <a
                href={product.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="marketplace-card__pay-link"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={12} /> Pago directo
              </a>
            )}
          </div>
        ) : (
          <p className="marketplace-card__unavailable">No disponible</p>
        )}
        {isAdmin && (
          <div className="marketplace-card__admin">
            <button type="button" onClick={onEdit} aria-label="Editar">
              <Pencil size={14} />
            </button>
            <button type="button" onClick={onDelete} aria-label="Eliminar">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

export function MarketplaceView({
  open,
  onClose,
  products,
  isAdmin,
  isDemoMode,
  userUid,
  userEmail,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onCheckout,
  myOrders = [],
  initialScreenMode = 'shop',
}: MarketplaceViewProps) {
  const [filter, setFilter] = useState<MarketplaceCategory | 'all'>('all')
  const [screenMode, setScreenMode] = useState<'shop' | 'orders'>(initialScreenMode)
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (open) setScreenMode(initialScreenMode)
  }, [open, initialScreenMode])
  const [showForm, setShowForm] = useState(false)
  const [checkoutProduct, setCheckoutProduct] = useState<MarketplaceProduct | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<MarketplaceProductInput>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [imageUploadPct, setImageUploadPct] = useState(0)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const visible = useMemo(() => {
    const list = isAdmin ? products : products.filter((p) => p.active)
    if (filter === 'all') return list
    return list.filter((p) => p.category === filter)
  }, [products, filter, isAdmin])

  if (!open) return null

  const startCheckout = (product: MarketplaceProduct) => {
    if (isDemoMode) {
      toast.error('Inicia sesión real para comprar')
      return
    }
    if (!userUid) {
      toast.error('Debes iniciar sesión para comprar')
      return
    }
    setCheckoutProduct(product)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (p: MarketplaceProduct) => {
    setEditingId(p.id)
    setForm({
      title: p.title,
      description: p.description,
      priceClp: p.priceClp,
      imageUrl: p.imageUrl || '',
      imageUrls: productImages(p),
      paymentUrl: p.paymentUrl,
      category: p.category,
      active: p.active,
    })
    setShowForm(true)
  }

  const handleImageFiles = async (files: FileList | null) => {
    if (!files?.length || !userUid) return
    const picked = Array.from(files).slice(0, 3)
    setUploadingImages(true)
    setImageUploadPct(0)
    try {
      const urls = await uploadMarketplaceProductImages(userUid, picked, setImageUploadPct)
      setForm((f) => ({
        ...f,
        imageUrls: urls,
        imageUrl: urls[0] || f.imageUrl,
      }))
      toast.success(`${urls.length} imagen${urls.length > 1 ? 'es' : ''} subida${urls.length > 1 ? 's' : ''}`)
    } catch {
      toast.error('No se pudieron subir las imágenes')
    } finally {
      setUploadingImages(false)
      setImageUploadPct(0)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  const removeFormImage = (idx: number) => {
    setForm((f) => {
      const next = (f.imageUrls || []).filter((_, i) => i !== idx)
      return { ...f, imageUrls: next, imageUrl: next[0] || '' }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Título requerido')
      return
    }
    if (!form.paymentUrl.trim().startsWith('https://')) {
      toast.error('Link de pago debe empezar con https://')
      return
    }
    setSaving(true)
    try {
      const payload: MarketplaceProductInput = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrls: (form.imageUrls || []).filter(Boolean).slice(0, 3),
        imageUrl: form.imageUrls?.[0] || form.imageUrl?.trim() || undefined,
        paymentUrl: form.paymentUrl.trim(),
      }
      if (editingId) {
        await onUpdateProduct(editingId, payload)
        toast.success('Producto actualizado')
      } else {
        await onCreateProduct(payload)
        toast.success('Producto publicado')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
    } catch (err) {
      console.warn(err)
      toast.error('No se pudo guardar', {
        description: isDemoMode
          ? 'Modo demo — inicia sesión real como admin'
          : 'Verifica marketplaceAdmins en Firestore',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto del marketplace?')) return
    try {
      await onDeleteProduct(id)
      toast.success('Producto eliminado')
    } catch {
      toast.error('No se pudo eliminar')
    }
  }

  const handleRetryPayment = async (order: MarketplaceOrder) => {
    if (isDemoMode) {
      toast.error('Inicia sesión real para pagar')
      return
    }
    setPayingOrderId(order.id)
    try {
      const product = products.find((p) => p.id === order.productId)
      const { usedFallback } = await openMarketplacePayment(order.id, product?.paymentUrl)
      toast.success(usedFallback ? 'Link de pago abierto' : 'Completa el pago en Mercado Pago')
    } catch {
      toast.error('No se pudo abrir el checkout')
    } finally {
      setPayingOrderId(null)
    }
  }

  const orderStepIndex = (status: MarketplaceOrder['status']) => {
    const idx = ORDER_STATUS_FLOW.indexOf(status)
    return idx >= 0 ? idx : -1
  }

  return (
    <div className="marketplace-screen" role="dialog" aria-label="Tienda EntrenaMatch">
      {checkoutProduct ? (
        <MarketplaceCheckout
          product={checkoutProduct}
          userEmail={userEmail}
          isDemoMode={isDemoMode}
          onClose={() => setCheckoutProduct(null)}
          onSubmit={onCheckout}
        />
      ) : (
        <>
      <header className="marketplace-screen__header">
        <button type="button" onClick={onClose} className="marketplace-screen__back" aria-label="Volver">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="marketplace-screen__title">Tienda</h1>
          <p className="marketplace-screen__sub">Productos oficiales EntrenaMatch</p>
        </div>
        <div className="marketplace-screen__header-actions">
          {userUid && !isDemoMode && (
            <button
              type="button"
              className={screenMode === 'orders' ? 'marketplace-screen__tab--active' : 'marketplace-screen__tab'}
              onClick={() => setScreenMode(screenMode === 'orders' ? 'shop' : 'orders')}
            >
              <Package size={14} /> Mis pedidos{myOrders.length ? ` (${myOrders.length})` : ''}
            </button>
          )}
          {isAdmin && screenMode === 'shop' && (
            <button type="button" className="marketplace-screen__add" onClick={openCreate}>
              <Plus size={16} /> Nuevo
            </button>
          )}
        </div>
      </header>

      {isAdmin && screenMode === 'shop' && (
        <p className="marketplace-screen__admin-hint">
          Modo desarrollador — solo tú puedes publicar productos. Usa tu link de Mercado Pago o Stripe en
          &quot;Link de pago&quot;.
        </p>
      )}

      {screenMode === 'orders' ? (
        <div className="marketplace-orders">
          {myOrders.length === 0 ? (
            <p className="marketplace-orders__empty">Aún no tienes pedidos</p>
          ) : (
            myOrders.map((o) => (
              <article key={o.id} className={`marketplace-orders__card marketplace-orders__card--${o.status}`}>
                <div className="marketplace-orders__head">
                  <strong>{o.productTitle}</strong>
                  <span>{formatClp(o.priceClp)}</span>
                </div>
                <p className="marketplace-orders__meta">
                  {ORDER_STATUS_LABELS[o.status]} ·{' '}
                  {new Date(o.createdAt).toLocaleString('es-CL', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
                {o.status !== 'cancelled' && (
                  <div className="marketplace-orders__steps" aria-label="Estado del pedido">
                    {ORDER_STATUS_FLOW.map((step, i) => {
                      const current = orderStepIndex(o.status)
                      const done = current >= i
                      const active = current === i
                      return (
                        <span
                          key={step}
                          className={
                            done
                              ? active
                                ? 'marketplace-orders__step marketplace-orders__step--active'
                                : 'marketplace-orders__step marketplace-orders__step--done'
                              : 'marketplace-orders__step'
                          }
                        >
                          {ORDER_STATUS_LABELS[step]}
                        </span>
                      )
                    })}
                  </div>
                )}
                {o.shipping.address && (
                  <p className="marketplace-orders__ship">
                    Envío: {o.shipping.address}, {o.shipping.city}
                  </p>
                )}
                {o.status === 'pending_payment' && (
                  <button
                    type="button"
                    className="marketplace-orders__pay"
                    disabled={payingOrderId === o.id}
                    onClick={() => void handleRetryPayment(o)}
                  >
                    <ExternalLink size={14} />
                    {payingOrderId === o.id ? 'Abriendo…' : 'Pagar ahora'}
                  </button>
                )}
              </article>
            ))
          )}
        </div>
      ) : (
        <>
      <div className="marketplace-screen__filters">
        <button
          type="button"
          className={filter === 'all' ? 'marketplace-filter--active' : 'marketplace-filter'}
          onClick={() => setFilter('all')}
        >
          Todos
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={filter === c.id ? 'marketplace-filter--active' : 'marketplace-filter'}
            onClick={() => setFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {showForm && isAdmin && (
        <form className="marketplace-form" onSubmit={handleSubmit}>
          <h2 className="marketplace-form__title">
            {editingId ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <label className="marketplace-form__field">
            Título
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              maxLength={120}
              required
            />
          </label>
          <label className="marketplace-form__field">
            Descripción
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              maxLength={2000}
              rows={3}
            />
          </label>
          <div className="marketplace-form__row">
            <label className="marketplace-form__field">
              Precio (CLP)
              <input
                type="number"
                min={0}
                value={form.priceClp || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceClp: Math.max(0, Number(e.target.value) || 0) }))
                }
              />
            </label>
            <label className="marketplace-form__field">
              Categoría
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value as MarketplaceCategory }))
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="marketplace-form__images">
            <span className="marketplace-form__images-label">Imágenes del producto (máx. 3)</span>
            <div className="marketplace-form__images-grid">
              {(form.imageUrls || []).map((url, i) => (
                <div key={url} className="marketplace-form__thumb">
                  <img src={url} alt="" />
                  <button type="button" onClick={() => removeFormImage(i)} aria-label="Quitar">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {(form.imageUrls?.length || 0) < 3 && (
                <button
                  type="button"
                  className="marketplace-form__upload"
                  disabled={uploadingImages || !userUid}
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImagePlus size={18} />
                  {uploadingImages ? `${imageUploadPct}%` : 'Subir'}
                </button>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => void handleImageFiles(e.target.files)}
            />
            <label className="marketplace-form__field marketplace-form__field--optional">
              O URL imagen externa
              <input
                type="url"
                value={form.imageUrl || ''}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </label>
          </div>
          <label className="marketplace-form__field">
            Link de pago (Mercado Pago / Stripe)
            <input
              type="url"
              value={form.paymentUrl}
              onChange={(e) => setForm((f) => ({ ...f, paymentUrl: e.target.value }))}
              placeholder="https://mpago.la/..."
              required
            />
          </label>
          <label className="marketplace-form__check">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            Visible en la tienda
          </label>
          <div className="marketplace-form__actions">
            <button
              type="button"
              className="marketplace-form__cancel"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
              }}
            >
              Cancelar
            </button>
            <button type="submit" className="marketplace-form__save" disabled={saving}>
              {saving ? 'Guardando…' : editingId ? 'Guardar' : 'Publicar'}
            </button>
          </div>
        </form>
      )}

      <div className="marketplace-screen__grid">
        {visible.length === 0 ? (
          <div className="marketplace-empty">
            <ShoppingBag size={40} className="opacity-40" />
            <p>No hay productos en esta categoría</p>
            {isAdmin && (
              <button type="button" className="marketplace-empty__cta" onClick={openCreate}>
                Publicar el primero
              </button>
            )}
          </div>
        ) : (
          visible.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isAdmin={isAdmin}
              onBuy={() => startCheckout(p)}
              onEdit={() => openEdit(p)}
              onDelete={() => handleDelete(p.id)}
            />
          ))
        )}
      </div>
        </>
      )}
        </>
      )}
    </div>
  )
}

// Re-export for App handlers — handlers live in App via marketplace service
