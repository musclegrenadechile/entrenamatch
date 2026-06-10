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
import type { MarketplaceOrder, TrainerBooking, TrainerProfile } from '../../types'
import { formatClp } from '../../services/marketplace'
import { ORDER_STATUS_LABELS } from '../../services/adminOps'
import { formatTrainerRate, TRAINER_PLATFORM_FEE_RATE } from '../../services/trainerCoach'
import type { AdminMetrics } from '../../services/adminAnalytics'
import type { MpHealthResult } from '../../services/adminMp'
import { PilotMetricsPanel } from './PilotMetricsPanel'
import type { Firestore } from 'firebase/firestore'

export interface AdminOpsPanelProps {
  open: boolean
  onClose: () => void
  orders: MarketplaceOrder[]
  bookings: TrainerBooking[]
  trainers: TrainerProfile[]
  onUpdateOrderStatus: (orderId: string, status: MarketplaceOrder['status']) => Promise<void>
  onSetTrainerVerified: (trainerUserId: string, verified: boolean) => Promise<void>
  onMarkTrainerPayout?: (bookingId: string, status: 'processing' | 'paid') => Promise<void>
  mpHealth?: MpHealthResult | null
  metrics?: AdminMetrics
  db?: Firestore | null
  liveNowTotal?: number
}

export function AdminOpsPanel({
  open,
  onClose,
  orders,
  bookings,
  trainers,
  onUpdateOrderStatus,
  onSetTrainerVerified,
  onMarkTrainerPayout,
  mpHealth,
  metrics,
  db = null,
  liveNowTotal = 0,
}: AdminOpsPanelProps) {
  const [tab, setTab] = useState<
    'orders' | 'trainers' | 'revenue' | 'analytics' | 'pilot' | 'mp' | 'payouts'
  >('orders')
  const [orderFilter, setOrderFilter] = useState<MarketplaceOrder['status'] | 'all'>('all')
  const [busy, setBusy] = useState<string | null>(null)

  if (!open) return null

  const pendingOrders = orders.filter((o) => o.status === 'pending_payment')
  const unverifiedTrainers = trainers.filter((t) => t.active && !t.verified)
  const pendingPayoutBookings = bookings.filter(
    (b) =>
      b.status === 'paid_card' && (!b.payoutStatus || ['pending', 'processing'].includes(b.payoutStatus))
  )
  const filteredOrders =
    orderFilter === 'all' ? orders : orders.filter((o) => o.status === orderFilter)

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

  const handlePayout = async (bookingId: string, status: 'processing' | 'paid') => {
    if (!onMarkTrainerPayout) return
    setBusy(bookingId)
    try {
      await onMarkTrainerPayout(bookingId, status)
      toast.success(status === 'paid' ? 'Liquidación marcada como pagada' : 'En proceso de transferencia')
    } catch {
      toast.error('No se pudo actualizar la liquidación')
    } finally {
      setBusy(null)
    }
  }

  const trainerNet = (b: TrainerBooking) =>
    b.trainerNetClp ??
    (b.priceClp || 0) - (b.platformFeeClp ?? Math.round((b.priceClp || 0) * TRAINER_PLATFORM_FEE_RATE))

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
          <BadgeCheck size={14} /> PT
        </button>
        <button
          type="button"
          className={tab === 'revenue' ? 'admin-ops__tab--active' : 'admin-ops__tab'}
          onClick={() => setTab('revenue')}
        >
          💰 Revenue
        </button>
        <button
          type="button"
          className={tab === 'analytics' ? 'admin-ops__tab--active' : 'admin-ops__tab'}
          onClick={() => setTab('analytics')}
        >
          📊 Analytics
        </button>
        <button
          type="button"
          className={tab === 'pilot' ? 'admin-ops__tab--active' : 'admin-ops__tab'}
          onClick={() => setTab('pilot')}
        >
          🏋️ Piloto
        </button>
        <button
          type="button"
          className={tab === 'mp' ? 'admin-ops__tab--active' : 'admin-ops__tab'}
          onClick={() => setTab('mp')}
        >
          MP
        </button>
        <button
          type="button"
          className={tab === 'payouts' ? 'admin-ops__tab--active' : 'admin-ops__tab'}
          onClick={() => setTab('payouts')}
        >
          Liquidaciones ({pendingPayoutBookings.length})
        </button>
      </div>

      <div className="admin-ops__panel">
        {tab === 'orders' && (
          <>
            <div className="admin-ops__filters">
              {(['all', 'pending_payment', 'paid', 'shipped', 'delivered', 'cancelled'] as const).map(
                (f) => (
                  <button
                    key={f}
                    type="button"
                    className={
                      orderFilter === f ? 'admin-ops__filter--active' : 'admin-ops__filter'
                    }
                    onClick={() => setOrderFilter(f)}
                  >
                    {f === 'all' ? 'Todos' : ORDER_STATUS_LABELS[f]}
                  </button>
                )
              )}
            </div>
            {filteredOrders.length === 0 ? (
              <p className="admin-ops__empty">Sin pedidos en este filtro</p>
            ) : (
              filteredOrders.map((o) => (
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
                  {o.status === 'paid' && (
                    <div className="admin-ops__order-actions">
                      <button
                        type="button"
                        className="admin-ops__btn admin-ops__btn--ok"
                        disabled={busy === o.id}
                        onClick={() => void handleOrder(o.id, 'shipped')}
                      >
                        <Package size={14} /> Marcar enviado
                      </button>
                    </div>
                  )}
                  {o.status === 'shipped' && (
                    <div className="admin-ops__order-actions">
                      <button
                        type="button"
                        className="admin-ops__btn admin-ops__btn--ok"
                        disabled={busy === o.id}
                        onClick={() => void handleOrder(o.id, 'delivered')}
                      >
                        <Check size={14} /> Marcar entregado
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

        {tab === 'revenue' && metrics && (
          <div className="admin-ops__metrics">
            <article className="admin-ops__metric-card">
              <strong>Comisión plataforma (15%)</strong>
              <span>{formatClp(metrics.platformFeesClp)}</span>
            </article>
            <article className="admin-ops__metric-card">
              <strong>Pendiente liquidar PT</strong>
              <span>{formatClp(metrics.pendingPayoutClp)}</span>
              <small>{metrics.pendingPayoutCount} sesiones</small>
            </article>
            <article className="admin-ops__metric-card">
              <strong>Volume EntrenaCoach</strong>
              <span>{formatClp(metrics.bookingVolumeClp)}</span>
              <small>{metrics.bookingsPaid} pagadas / {metrics.bookingsTotal} total</small>
            </article>
            <article className="admin-ops__metric-card">
              <strong>Volume Tienda</strong>
              <span>{formatClp(metrics.orderVolumeClp)}</span>
              <small>{metrics.ordersPaid} pagados / {metrics.ordersTotal} total</small>
            </article>
          </div>
        )}

        {tab === 'analytics' && metrics && (
          <div className="admin-ops__metrics">
            <article className="admin-ops__metric-card">
              <strong>Live ahora</strong>
              <span>{metrics.liveNow}</span>
            </article>
            <article className="admin-ops__metric-card">
              <strong>Perfiles</strong>
              <span>{metrics.totalProfiles}</span>
            </article>
            <article className="admin-ops__metric-card">
              <strong>Reservas PT</strong>
              <span>{metrics.bookingsTotal}</span>
            </article>
            <article className="admin-ops__metric-card">
              <strong>Pedidos tienda</strong>
              <span>{metrics.ordersTotal}</span>
            </article>
          </div>
        )}

        {tab === 'pilot' && <PilotMetricsPanel db={db} liveNowTotal={liveNowTotal} />}

        {tab === 'mp' && (
          <div className="admin-ops__mp">
            <p className="admin-ops__mp-status">
              Mercado Pago:{' '}
              <strong
                className={
                  metrics?.mpLive ? 'admin-ops__mp--ok' : metrics?.mpConfigured ? 'admin-ops__mp--warn' : 'admin-ops__mp--warn'
                }
              >
                {metrics?.mpLive
                  ? 'Activo (cuenta EntrenaMatch)'
                  : metrics?.mpConfigured
                    ? 'Token presente — verificar API'
                    : 'Sin token'}
              </strong>
            </p>
            {mpHealth?.mpNickname && (
              <p className="admin-ops__empty">Cuenta: {mpHealth.mpNickname}</p>
            )}
            {mpHealth?.mpError && (
              <p className="admin-ops__empty" style={{ color: '#fbbf24' }}>
                Error API: {mpHealth.mpError}
              </p>
            )}
            <p className="admin-ops__empty">
              Modelo: cliente paga a EntrenaMatch → comisión 15% → liquidación al entrenador
            </p>
            <p className="admin-ops__empty">
              Setup:{' '}
              <code>.\scripts\setup-mp-production.ps1 -AccessToken &quot;APP_USR-...&quot;</code>
            </p>
            <p className="admin-ops__empty">
              Webhook MP (evento <strong>payment</strong>):
              <br />
              <code>{mpHealth?.webhookUrl || 'https://us-central1-entrenamatch.cloudfunctions.net/mercadoPagoWebhook'}</code>
            </p>
            <p className="admin-ops__empty">
              Firma webhook:{' '}
              <strong className={mpHealth?.webhookSecretConfigured ? 'admin-ops__mp--ok' : 'admin-ops__mp--warn'}>
                {mpHealth?.webhookSecretConfigured ? 'Clave configurada' : 'Sin clave — validación desactivada'}
              </strong>
            </p>
          </div>
        )}

        {tab === 'payouts' && (
          <>
            {pendingPayoutBookings.length === 0 ? (
              <p className="admin-ops__empty">Sin liquidaciones pendientes</p>
            ) : (
              pendingPayoutBookings.map((b) => (
                <article key={b.id} className="admin-ops__order">
                  <div className="admin-ops__order-head">
                    <strong>{b.trainerName}</strong>
                    <span>{formatClp(trainerNet(b))} neto</span>
                  </div>
                  <p className="admin-ops__order-meta">
                    Cliente: {b.clientName} · Bruto {formatClp(b.priceClp)} ·{' '}
                    {b.payoutStatus === 'processing' ? 'En transferencia' : 'Pendiente'}
                  </p>
                  <p className="admin-ops__order-ship">
                    {new Date(b.scheduledAt).toLocaleString('es-CL', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                  {onMarkTrainerPayout && (
                    <div className="admin-ops__order-actions">
                      {b.payoutStatus !== 'processing' && (
                        <button
                          type="button"
                          className="admin-ops__btn"
                          disabled={busy === b.id}
                          onClick={() => void handlePayout(b.id, 'processing')}
                        >
                          En transferencia
                        </button>
                      )}
                      <button
                        type="button"
                        className="admin-ops__btn admin-ops__btn--ok"
                        disabled={busy === b.id}
                        onClick={() => void handlePayout(b.id, 'paid')}
                      >
                        <Check size={14} /> Liquidado al PT
                      </button>
                    </div>
                  )}
                </article>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
