import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ExternalLink, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { CHILE_REGIONS } from '../../data/chileRegions'
import type { MarketplaceProduct, MarketplaceShippingInfo } from '../../types'
import {
  formatClp,
  loadSavedMarketplaceShipping,
  productRequiresShipping,
  validateMarketplaceShipping,
} from '../../services/marketplace'
import { createMarketplaceMpCheckout } from '../../services/marketplacePayments'

const EMPTY_SHIPPING: MarketplaceShippingInfo = {
  fullName: '',
  email: '',
  phone: '',
  altPhone: '',
  address: '',
  city: '',
  region: '',
}

export interface MarketplaceCheckoutProps {
  product: MarketplaceProduct | null
  userEmail?: string
  isDemoMode: boolean
  onClose: () => void
  onSubmit: (product: MarketplaceProduct, shipping: MarketplaceShippingInfo) => Promise<string>
}

export function MarketplaceCheckout({
  product,
  userEmail,
  isDemoMode,
  onClose,
  onSubmit,
}: MarketplaceCheckoutProps) {
  const requiresShipping = product ? productRequiresShipping(product.category) : true
  const [form, setForm] = useState<MarketplaceShippingInfo>(EMPTY_SHIPPING)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!product) return
    const saved = loadSavedMarketplaceShipping()
    setForm({
      fullName: saved?.fullName || '',
      email: saved?.email || userEmail || '',
      phone: saved?.phone || '',
      altPhone: saved?.altPhone || '',
      address: saved?.address || '',
      city: saved?.city || '',
      region: saved?.region || '',
    })
  }, [product, userEmail])

  const summary = useMemo(() => {
    if (!product) return null
    return {
      title: product.title,
      price: formatClp(product.priceClp),
    }
  }, [product])

  if (!product || !summary) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isDemoMode) {
      toast.error('Inicia sesión real para comprar')
      return
    }
    const err = validateMarketplaceShipping(form, requiresShipping)
    if (err) {
      toast.error(err)
      return
    }
    if (!product.paymentUrl.startsWith('https://')) {
      toast.error('Link de pago no configurado')
      return
    }
    setSaving(true)
    try {
      const orderId = await onSubmit(product, form)
      try {
        const mp = await createMarketplaceMpCheckout(orderId)
        window.open(mp.initPoint, '_blank', 'noopener,noreferrer')
        if (mp.usedFallback) {
          toast.info('Link de pago del producto', {
            description: 'Confirma manualmente si usaste el link alternativo.',
          })
        } else {
          toast.success('Pedido registrado', {
            description: 'Completa el pago en Mercado Pago — se confirmará automáticamente.',
          })
        }
      } catch (mpErr) {
        console.warn('MP checkout fallback', mpErr)
        window.open(product.paymentUrl, '_blank', 'noopener,noreferrer')
        toast.success('Pedido registrado', {
          description: 'Completa el pago en la ventana que se abrió.',
        })
      }
      onClose()
    } catch (submitErr) {
      console.warn(submitErr)
      toast.error('No se pudo registrar el pedido', {
        description: submitErr instanceof Error ? submitErr.message : 'Intenta de nuevo',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="marketplace-checkout" role="dialog" aria-label="Datos de compra y envío">
      <header className="marketplace-checkout__header">
        <button type="button" onClick={onClose} className="marketplace-checkout__back" aria-label="Volver">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h2 className="marketplace-checkout__title">Datos de compra</h2>
          <p className="marketplace-checkout__sub">Completa tu información antes de pagar</p>
        </div>
      </header>

      <div className="marketplace-checkout__product">
        <div className="marketplace-checkout__product-icon">
          <ShoppingBag size={20} />
        </div>
        <div className="marketplace-checkout__product-info">
          <p className="marketplace-checkout__product-name">{summary.title}</p>
          <p className="marketplace-checkout__product-price">{summary.price}</p>
        </div>
      </div>

      <form className="marketplace-checkout__form" onSubmit={handleSubmit}>
        <p className="marketplace-checkout__section">Contacto</p>

        <label className="marketplace-form__field">
          Nombre completo
          <input
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            placeholder="Ej. Juan Pérez González"
            maxLength={120}
            required
            autoComplete="name"
          />
        </label>

        <label className="marketplace-form__field">
          Correo electrónico
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="tu@email.com"
            maxLength={120}
            required
            autoComplete="email"
          />
        </label>

        <div className="marketplace-form__row">
          <label className="marketplace-form__field">
            Teléfono / WhatsApp
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+56 9 1234 5678"
              maxLength={20}
              required
              autoComplete="tel"
            />
          </label>
          <label className="marketplace-form__field">
            Teléfono alternativo
            <input
              type="tel"
              value={form.altPhone || ''}
              onChange={(e) => setForm((f) => ({ ...f, altPhone: e.target.value }))}
              placeholder="Opcional"
              maxLength={20}
              autoComplete="tel"
            />
          </label>
        </div>

        {requiresShipping ? (
          <>
            <p className="marketplace-checkout__section">Envío en Chile</p>

            <label className="marketplace-form__field">
              Dirección
              <input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Calle, número, depto / casa"
                maxLength={200}
                required
                autoComplete="street-address"
              />
            </label>

            <div className="marketplace-form__row">
              <label className="marketplace-form__field">
                Ciudad / Comuna
                <input
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Ej. Santiago, Providencia"
                  maxLength={80}
                  required
                  autoComplete="address-level2"
                />
              </label>
              <label className="marketplace-form__field">
                Región
                <select
                  value={form.region}
                  onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                  required
                >
                  <option value="">Seleccionar…</option>
                  {CHILE_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </>
        ) : (
          <p className="marketplace-checkout__digital-note">
            Producto digital — no requiere dirección de envío. Usaremos tu correo y teléfono para
            contactarte.
          </p>
        )}

        <p className="marketplace-checkout__privacy">
          Tus datos se guardan de forma segura para procesar el pedido y coordinar la entrega.
        </p>

        <div className="marketplace-checkout__actions">
          <button type="button" className="marketplace-form__cancel" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="marketplace-checkout__pay" disabled={saving}>
            {saving ? 'Guardando…' : (
              <>
                Continuar al pago <ExternalLink size={14} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
