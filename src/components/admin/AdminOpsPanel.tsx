import { useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Package,
  Shield,
  ShoppingBag,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type { MarketplaceOrder, TrainerProfile } from '../../types'
import { formatClp } from '../../services/marketplace'
import { ORDER_STATUS_LABELS } from '../../services/adminOps'
import { formatTrainerRate } from '../../services/trainerCoach'

export interface AdminOpsPanelProps {
  open: boolean
  onClose: () => void
  orders: MarketplaceOrder[]
  trainers: TrainerProfile[]
  onUpdateOrderStatus: (orderId: string, status: MarketplaceOrder['status']) => Promise<void>
  onSetTrainerVerified: (trainerUserId: string, verified: boolean) => Promise<void>
}

export function AdminOpsPanel({
  open,
  onClose,
  orders,
  trainers,
  onUpdateOrderStatus,
  onSetTrainerVerified,
}: AdminOpsPanelProps) {
  const [tab, setTab] = useState<'orders' | 'trainers'>('orders')
  const [busy, setBusy] = useState<string | null>(null)

  if (!open) return null

  const pendingOrders = orders.filter((o) => o.status === 'pending_payment')
  const unverifiedTrainers = trainers.filter((t) => t.active && !t.verified)

  const handleOrder = async (id: string, status: MarketplaceOrder['status']) => {
    setBusy(id)
    try {
      await onUpdateOrderStatus(id, status)
      toast.success(status === 'paid' ? 'Pedido marcado pagado' : 'Pedido actualizado')
    } catch {
      toast.error('No se pudo actualizar el pedido')
    } finally {
      setBusy(null)
    }
  }

  const handleVerify = async (uid: string, verified: boolean) => {
    setBusy(uid)
    try {
      await onSetTrainerVerified(uid, verified)
      toast.success(verified ? 'Entrenador verificado' : 'Verificación removida')
    } catch {
      toast.error('No se pudo actualizar el perfil PT')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="admin-ops-screen" role="dialog" aria-label="Panel admin EntrenaMatch">
      <header className="admin-ops__header">
        <button type="button" onClick={onClose} className="admin-ops__back" aria-label="Volver">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="admin-ops__title">
            <Shield size={18} /> Admin Ops
          </h1>
          <p className="admin-ops__sub">Pedidos tienda · verificación EntrenaCoach</p>
        </div>
      </header>

      <div className="admin-ops__stats">
        <div className="admin-ops__stat">
          <Package size={16} />
          <strong>{pendingOrders.length}</strong>
          <span>pendientes</span>
        </div>
        <div className="admin-ops__stat">
          <BadgeCheck size={16} />
          <strong>{unverifiedTrainers.length}</strong>
          <span>PT sin verificar</span>
        </div>
      </div>

      <div className="admin-ops__tabs">
        <button
          type="button"
          className={tab === 'orders' ? 'admin-ops__tab--active' : 'admin-ops__tab'}
          onClick={() => setTab('orders')}
        >
          <ShoppingBag size={14} /> Pedidos ({orders.length})
        </button>
        <button
          type="button"
          className={tab === 'trainers' ? 'admin-ops__tab--active' : 'admin-ops__tab'}
          onClick={() => setTab('trainers')}
        >
          <BadgeCheck size={14} /> Entrenadores
        </button>
      </div>

      <div className="admin-ops__panel">
        {tab === 'orders' && (
          <>
            {orders.length === 0 ? (
              <p className="admin-ops__empty">Sin pedidos aún</p>
            ) : (
              orders.map((o) => (
                <article key={o.id} className={`admin-ops__order admin-ops__order--${o.status}`}>
                  <div className="admin-ops__order-head">
                    <strong>{o.productTitle}</strong>
                    <span>{formatClp(o.priceClp)}</span>
                  </div>
                  <p className="admin-ops__order-meta">
                    {ORDER_STATUS_LABELS[o.status]} ·{' '}
                    {new Date(o.createdAt).toLocaleString('es-CL', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                  <p className="admin-ops__order-ship">
                    {o.shipping.fullName} · {o.shipping.email} · {o.shipping.phone}
                  </p>
                  {o.shipping.address && (
                    <p className="admin-ops__order-ship">
                      {o.shipping.address}, {o.shipping.city}, {o.shipping.region}
                    </p>
                  )}
                  {o.status === 'pending_payment' && (
                    <div className="admin-ops__order-actions">
                      <button
                        type="button"
                        className="admin-ops__btn admin-ops__btn--ok"
                        disabled={busy === o.id}
                        onClick={() => void handleOrder(o.id, 'paid')}
                      >
                        <Check size={14} /> Marcar pagado
                      </button>
                      <button
                        type="button"
                        className="admin-ops__btn admin-ops__btn--no"
                        disabled={busy === o.id}
                        onClick={() => void handleOrder(o.id, 'cancelled')}
                      >
                        <X size={14} /> Cancelar
                      </button>
                    </div>
                  )}
                </article>
              ))
            )}
          </>
        )}

        {tab === 'trainers' && (
          <>
            {trainers.length === 0 ? (
              <p className="admin-ops__empty">Sin perfiles EntrenaCoach</p>
            ) : (
              trainers.map((t) => (
                <article key={t.userId} className="admin-ops__trainer">
                  <div>
                    <strong>{t.displayName}</strong>
                    {t.verified && (
                      <span className="admin-ops__verified">
                        <Check size={10} /> Verificado
                      </span>
                    )}
                    <p className="admin-ops__trainer-meta">
                      {t.city || t.region} · {formatTrainerRate(t.hourlyRateClp)}/h
                    </p>
                  </div>
                  <button
                    type="button"
                    className={
                      t.verified ? 'admin-ops__btn admin-ops__btn--no' : 'admin-ops__btn admin-ops__btn--ok'
                    }
                    disabled={busy === t.userId}
                    onClick={() => void handleVerify(t.userId, !t.verified)}
                  >
                    {t.verified ? 'Quitar ✓' : 'Verificar ✓'}
                  </button>
                </article>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
