import { useEffect, useMemo, useState } from 'react'
import {
  Loader2,
  MapPin,
  Navigation,
  Radio,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import type {
  TrainerDispatchInput,
  TrainerDispatchRequest,
  TrainerPaymentMethod,
  TrainerProfile,
  TrainerSpecialty,
} from '../../types'
import {
  DISPATCH_OFFER_MS,
  DISPATCH_STATUS_LABELS,
  advanceExpiredDispatch,
  estimateDispatchPrice,
  findNearbyDispatchTrainers,
  respondToDispatchOffer,
} from '../../services/trainerDispatch'
import { formatTrainerRate } from '../../services/trainerCoach'
import { SPECIALTY_UI } from './trainerCoachUi'

const DURATIONS = [45, 60, 75, 90] as const

function OfferCountdown({ expiresAt }: { expiresAt: number }) {
  const [secsLeft, setSecsLeft] = useState(() =>
    Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
  )
  useEffect(() => {
    const tick = () =>
      setSecsLeft(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [expiresAt])
  const total = DISPATCH_OFFER_MS / 1000
  const pct = Math.max(0, Math.min(100, (secsLeft / total) * 100))
  return (
    <div className="trainer-dispatch-offer__countdown">
      <div
        className="trainer-dispatch-offer__countdown-ring"
        style={{ background: `conic-gradient(#6366f1 ${pct}%, rgba(255,255,255,0.08) 0)` }}
      >
        <span>{secsLeft}s</span>
      </div>
      <p className="trainer-dispatch-offer__timer-label">Tiempo para responder</p>
    </div>
  )
}

export interface TrainerDispatchPanelProps {
  trainers: TrainerProfile[]
  profileCoords: Record<string, { lat: number; lng: number }>
  userLat?: number
  userLng?: number
  userUid?: string
  userName?: string
  isDemoMode: boolean
  activeDispatch: TrainerDispatchRequest | null
  incomingOffer: TrainerDispatchRequest | null
  onRequestLocation: () => void | Promise<void>
  onCreateDispatch: (
    input: TrainerDispatchInput,
    candidateIds: string[]
  ) => Promise<string>
  onCancelDispatch: (dispatchId: string) => Promise<void>
  onDispatchMatched?: (dispatch: TrainerDispatchRequest) => void
}

export function TrainerDispatchPanel({
  trainers,
  profileCoords,
  userLat,
  userLng,
  userUid,
  isDemoMode,
  activeDispatch,
  incomingOffer,
  onRequestLocation,
  onCreateDispatch,
  onCancelDispatch,
  onDispatchMatched,
}: TrainerDispatchPanelProps) {
  const [specialty, setSpecialty] = useState<TrainerSpecialty>('funcional')
  const [durationMin, setDurationMin] = useState(60)
  const [locationNote, setLocationNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<TrainerPaymentMethod>('card')
  const [submitting, setSubmitting] = useState(false)
  const [responding, setResponding] = useState(false)

  const nearby = useMemo(() => {
    if (userLat == null || userLng == null) return []
    return findNearbyDispatchTrainers(trainers, profileCoords, specialty, userLat, userLng)
  }, [trainers, profileCoords, specialty, userLat, userLng])

  const estimate = useMemo(
    () => estimateDispatchPrice(nearby, durationMin),
    [nearby, durationMin]
  )

  useEffect(() => {
    if (!activeDispatch || activeDispatch.status !== 'offering') return undefined
    if (!activeDispatch.offerExpiresAt) return undefined
    const ms = activeDispatch.offerExpiresAt - Date.now()
    if (ms <= 0) {
      void advanceExpiredDispatch(activeDispatch.id).catch(() => {})
      return undefined
    }
    const t = setTimeout(() => {
      void advanceExpiredDispatch(activeDispatch.id).catch(() => {})
    }, ms + 500)
    return () => clearTimeout(t)
  }, [activeDispatch])

  useEffect(() => {
    if (activeDispatch?.status === 'matched' && activeDispatch.bookingId) {
      onDispatchMatched?.(activeDispatch)
    }
  }, [activeDispatch, onDispatchMatched])

  const handleRequest = async () => {
    if (isDemoMode) {
      toast.error('Inicia sesión real')
      return
    }
    if (userLat == null || userLng == null) {
      toast.error('Activa tu ubicación GPS')
      void onRequestLocation()
      return
    }
    if (!locationNote.trim()) {
      toast.error('Indica dónde entrenar')
      return
    }
    if (nearby.length === 0) {
      toast.error('No hay entrenadores en vivo cerca', {
        description: 'Prueba otra especialidad o más tarde.',
      })
      return
    }
    setSubmitting(true)
    try {
      await onCreateDispatch(
        {
          specialty,
          durationMin,
          lat: userLat,
          lng: userLng,
          locationNote,
          paymentMethod,
        },
        nearby.map((t) => t.userId)
      )
      toast.success('Buscando entrenador…', {
        description: `Tarifa dinámica ${formatTrainerRate(estimate.offerPriceClp)}`,
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo solicitar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRespond = async (action: 'accept' | 'pass') => {
    if (!incomingOffer || !userUid) return
    setResponding(true)
    try {
      await respondToDispatchOffer(incomingOffer.id, userUid, action)
      toast.success(action === 'accept' ? '¡Sesión confirmada!' : 'Oferta pasada')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al responder')
    } finally {
      setResponding(false)
    }
  }

  if (incomingOffer) {
    const meta = SPECIALTY_UI[incomingOffer.specialty]
    return (
      <div className="trainer-dispatch-offer">
        <div className="trainer-dispatch-offer__pulse" />
        <div className="trainer-dispatch-offer__badge">
          <Zap size={14} /> Oferta en vivo
        </div>
        <p className="trainer-dispatch-offer__price">
          {formatTrainerRate(incomingOffer.offerPriceClp)}
        </p>
        <p className="trainer-dispatch-offer__meta">
          {meta.emoji} {meta.label} · {incomingOffer.durationMin} min
        </p>
        <p className="trainer-dispatch-offer__client">{incomingOffer.clientName}</p>
        <p className="trainer-dispatch-offer__loc">
          <MapPin size={14} /> {incomingOffer.locationNote}
        </p>
        {incomingOffer.surgeFactor > 1 && (
          <p className="trainer-dispatch-offer__surge">
            <TrendingUp size={14} /> Alta demanda (+{Math.round((incomingOffer.surgeFactor - 1) * 100)}%)
          </p>
        )}
        {incomingOffer.offerExpiresAt && (
          <OfferCountdown expiresAt={incomingOffer.offerExpiresAt} />
        )}
        <div className="trainer-dispatch-offer__actions">
          <button
            type="button"
            className="trainer-dispatch-offer__pass"
            disabled={responding}
            onClick={() => void handleRespond('pass')}
          >
            Pasar
          </button>
          <button
            type="button"
            className="trainer-dispatch-offer__accept"
            disabled={responding}
            onClick={() => void handleRespond('accept')}
          >
            {responding ? '…' : 'Aceptar sesión'}
          </button>
        </div>
      </div>
    )
  }

  if (activeDispatch && userUid && activeDispatch.clientId === userUid) {
    const isOffering = activeDispatch.status === 'offering'
    const secsLeft =
      isOffering && activeDispatch.offerExpiresAt
        ? Math.max(0, Math.ceil((activeDispatch.offerExpiresAt - Date.now()) / 1000))
        : 0
    return (
      <div className="trainer-dispatch-wait">
        {activeDispatch.status === 'matched' ? (
          <>
            <div className="trainer-dispatch-wait__matched">✓</div>
            <h2 className="trainer-dispatch-wait__title">¡Entrenador asignado!</h2>
            <p className="trainer-dispatch-wait__sub">
              {activeDispatch.currentTrainerName || 'Tu entrenador'} ·{' '}
              {formatTrainerRate(activeDispatch.offerPriceClp)}
            </p>
            <p className="trainer-dispatch-wait__hint">Ve a Sesiones para continuar.</p>
          </>
        ) : activeDispatch.status === 'no_trainers' ? (
          <>
            <h2 className="trainer-dispatch-wait__title">Sin entrenadores</h2>
            <p className="trainer-dispatch-wait__sub">
              Nadie aceptó a tiempo. Prueba otra especialidad o más tarde.
            </p>
            <button
              type="button"
              className="trainer-coach__cta"
              onClick={() => void onCancelDispatch(activeDispatch.id)}
            >
              Cerrar
            </button>
          </>
        ) : (
          <>
            <div className="trainer-dispatch-wait__radar" aria-hidden>
              <span className="trainer-dispatch-wait__radar-ring" />
              <span className="trainer-dispatch-wait__radar-ring" />
              <span className="trainer-dispatch-wait__radar-dot">
                <Radio size={18} />
              </span>
            </div>
            <h2 className="trainer-dispatch-wait__title">
              {DISPATCH_STATUS_LABELS[activeDispatch.status]}
            </h2>
            {isOffering && activeDispatch.currentTrainerName && (
              <p className="trainer-dispatch-wait__sub">
                Oferta a <strong>{activeDispatch.currentTrainerName}</strong>
                {secsLeft > 0 ? ` · ${secsLeft}s` : ''}
              </p>
            )}
            <p className="trainer-dispatch-wait__price">
              Tarifa dinámica: {formatTrainerRate(activeDispatch.offerPriceClp)}
            </p>
            <button
              type="button"
              className="trainer-dispatch-wait__cancel"
              onClick={() => void onCancelDispatch(activeDispatch.id)}
            >
              Cancelar búsqueda
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="trainer-dispatch-form">
      <div className="trainer-dispatch-form__hero">
        <div className="trainer-dispatch-form__hero-icon">
          <Navigation size={22} />
        </div>
        <div>
          <h2 className="trainer-dispatch-form__title">Entrenador ahora</h2>
          <p className="trainer-dispatch-form__sub">
            Precio de mercado en tu zona · ofertas en 90s · estilo Uber
          </p>
        </div>
      </div>

      {!userLat && (
        <button type="button" className="trainer-dispatch-form__gps" onClick={() => void onRequestLocation()}>
          <MapPin size={16} /> Activar ubicación GPS para ver tarifa real
        </button>
      )}

      <div className="trainer-dispatch-form__section">
        <p className="trainer-dispatch-form__label">Tipo de entrenamiento</p>
        <div className="trainer-dispatch-form__chips">
          {(Object.keys(SPECIALTY_UI) as TrainerSpecialty[]).map((id) => {
            const meta = SPECIALTY_UI[id]
            return (
              <button
                key={id}
                type="button"
                className={
                  specialty === id
                    ? 'trainer-dispatch-form__chip trainer-dispatch-form__chip--on'
                    : 'trainer-dispatch-form__chip'
                }
                style={
                  specialty === id
                    ? ({ '--chip-accent': meta.accent } as React.CSSProperties)
                    : undefined
                }
                onClick={() => setSpecialty(id)}
              >
                {meta.emoji} {meta.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="trainer-dispatch-form__section">
        <p className="trainer-dispatch-form__label">Duración</p>
        <div className="trainer-dispatch-form__durations">
          {DURATIONS.map((m) => (
            <button
              key={m}
              type="button"
              className={
                durationMin === m
                  ? 'trainer-dispatch-form__duration trainer-dispatch-form__duration--on'
                  : 'trainer-dispatch-form__duration'
              }
              onClick={() => setDurationMin(m)}
            >
              {m} min
            </button>
          ))}
        </div>
      </div>

      <label className="marketplace-form__field">
        Lugar de entrenamiento
        <input
          value={locationNote}
          onChange={(e) => setLocationNote(e.target.value)}
          placeholder="Gym, parque, dirección…"
          maxLength={200}
        />
      </label>

      <div className="trainer-dispatch-form__section">
        <p className="trainer-dispatch-form__label">Método de pago</p>
        <div className="trainer-dispatch-form__durations">
          {(['card', 'cash'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={
                paymentMethod === m
                  ? 'trainer-dispatch-form__duration trainer-dispatch-form__duration--on'
                  : 'trainer-dispatch-form__duration'
              }
              onClick={() => setPaymentMethod(m)}
            >
              {m === 'card' ? '💳 Tarjeta' : '💵 Efectivo'}
            </button>
          ))}
        </div>
      </div>

      <div className="trainer-dispatch-form__estimate">
        <div className="trainer-dispatch-form__estimate-row">
          <span>Precio de mercado</span>
          <strong>{formatTrainerRate(estimate.marketPriceClp)}</strong>
        </div>
        {estimate.surgeFactor > 1 && (
          <div className="trainer-dispatch-form__estimate-row trainer-dispatch-form__surge">
            <span>
              <TrendingUp size={12} /> Surge demanda
            </span>
            <strong>×{estimate.surgeFactor.toFixed(2)}</strong>
          </div>
        )}
        <div className="trainer-dispatch-form__estimate-total">
          <span>Tu tarifa estimada</span>
          <strong>{formatTrainerRate(estimate.offerPriceClp)}</strong>
        </div>
        <p className="trainer-dispatch-form__estimate-meta">
          {estimate.nearbyCount > 0 ? (
            <>
              <span className="trainer-dispatch-form__live-dot" /> {estimate.nearbyCount}{' '}
              entrenador{estimate.nearbyCount !== 1 ? 'es' : ''} en vivo cerca
            </>
          ) : (
            'Sin entrenadores en vivo en tu zona para esta especialidad'
          )}
        </p>
      </div>

      <button
        type="button"
        className="trainer-dispatch-form__cta"
        disabled={submitting || estimate.nearbyCount === 0}
        onClick={() => void handleRequest()}
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="trainer-dispatch-form__cta-spin" /> Buscando…
          </>
        ) : (
          <>Pedir entrenador · {formatTrainerRate(estimate.offerPriceClp)}</>
        )}
      </button>
    </div>
  )
}
