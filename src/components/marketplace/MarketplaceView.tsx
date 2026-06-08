import { useMemo, useState } from 'react'
import { ArrowLeft, Pencil, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { MarketplaceCategory, MarketplaceProduct, MarketplaceShippingInfo } from '../../types'
import {
  formatClp,
  type MarketplaceProductInput,
} from '../../services/marketplace'
import { MarketplaceCheckout } from './MarketplaceCheckout'

const CATEGORIES: { id: MarketplaceCategory; label: string }[] = [
  { id: 'suplemento', label: 'Suplemento' },
  { id: 'ropa', label: 'Ropa' },
  { id: 'equipo', label: 'Equipo' },
  { id: 'digital', label: 'Digital' },
  { id: 'otro', label: 'Otro' },
]

const EMPTY_FORM: MarketplaceProductInput = {
  title: '',
  description: '',
  priceClp: 0,
  imageUrl: '',
  paymentUrl: '',
  category: 'otro',
  active: true,
}

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
  return (
    <article
      className={`marketplace-card ${!product.active ? 'marketplace-card--inactive' : ''}`}
    >
      <div className="marketplace-card__media">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt="" className="marketplace-card__img" />
        ) : (
          <div className="marketplace-card__placeholder">
            <ShoppingBag size={28} />
          </div>
        )}
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
          <button type="button" className="marketplace-card__pay" onClick={onBuy}>
            Comprar
          </button>
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
}: MarketplaceViewProps) {
  const [filter, setFilter] = useState<MarketplaceCategory | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [checkoutProduct, setCheckoutProduct] = useState<MarketplaceProduct | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<MarketplaceProductInput>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

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
      paymentUrl: p.paymentUrl,
      category: p.category,
      active: p.active,
    })
    setShowForm(true)
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
        imageUrl: form.imageUrl?.trim() || undefined,
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
        {isAdmin && (
          <button type="button" className="marketplace-screen__add" onClick={openCreate}>
            <Plus size={16} /> Nuevo
          </button>
        )}
      </header>

      {isAdmin && (
        <p className="marketplace-screen__admin-hint">
          Modo desarrollador — solo tú puedes publicar productos. Usa tu link de Mercado Pago o Stripe en
          &quot;Link de pago&quot;.
        </p>
      )}

      {!isAdmin && !isDemoMode && userUid && (
        <div className="marketplace-screen__setup">
          <p className="marketplace-screen__setup-title">Panel admin no activo</p>
          <p className="marketplace-screen__setup-text">
            La app no usa tu email para admin — necesitas un documento en Firestore con tu UID
            {userEmail ? ` (${userEmail})` : ''}.
          </p>
          <code className="marketplace-screen__setup-code">marketplaceAdmins/{userUid}</code>
          <button
            type="button"
            className="marketplace-screen__setup-copy"
            onClick={() => {
              void navigator.clipboard.writeText(userUid).then(() => {
                toast.success('UID copiado')
              })
            }}
          >
            Copiar UID
          </button>
          <p className="marketplace-screen__setup-foot">
            En tu PC:{' '}
            <code>node scripts/write-marketplace-admin.mjs {userEmail || 'TU_EMAIL'}</code>
          </p>
        </div>
      )}

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
          <label className="marketplace-form__field">
            URL imagen (opcional)
            <input
              type="url"
              value={form.imageUrl || ''}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://..."
            />
          </label>
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
    </div>
  )
}

// Re-export for App handlers — handlers live in App via marketplace service
