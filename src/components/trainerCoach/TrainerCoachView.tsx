import { TrainerDispatchPanel } from './TrainerDispatchPanel'
import { TrainerCoachHero } from './TrainerCoachHero'
import { TrainerAvailabilityEditor } from './TrainerAvailabilityEditor'
import { TrainerBookingsCalendar } from './TrainerBookingsCalendar'
import { TrainerEarningsPanel } from './TrainerEarningsPanel'
import { TrainerPackagesEditor } from './TrainerPackagesEditor'
import { TrainerDispatchHistory } from './TrainerDispatchHistory'
import {
  formatDistanceKm,
  trainerDistanceKm,
} from '../../services/trainerDispatch'
import {
  calcBookingPrice,
  formatAvailabilitySlot,
  formatPackageLabel,
  isWithinAvailability,
} from '../../services/trainerAvailability'
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock,
  Compass,
  CreditCard,
  Dumbbell,
  MapPin,
  Sparkles,
  Star,
  X,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { CHILE_REGIONS } from '../../data/chileRegions'
import { useEffect, useMemo, useState } from 'react'
import type {
  TrainerBooking,
  TrainerBookingInput,
  TrainerDispatchRequest,
  TrainerProfile,
  TrainerProfileInput,
  TrainerSpecialty,
} from '../../types'
import {
  BOOKING_STATUS_LABELS,
  TRAINER_SPECIALTIES,
  formatTrainerRate,
} from '../../services/trainerCoach'
import {
  BOOKING_STATUS_TONE,
  SPECIALTY_UI,
  trainerAvatarHue,
  trainerInitials,
} from './trainerCoachUi'

const TAB_CONFIG = [
  { id: 'explore' as const, label: 'Explorar', icon: Compass },
  { id: 'now' as const, label: 'Ahora', icon: Zap, live: true },
  { id: 'sessions' as const, label: 'Sesiones', icon: CalendarDays },
  { id: 'trainer' as const, label: 'Modo PT', icon: BadgeCheck },
]

const EMPTY_TRAINER_FORM: TrainerProfileInput = {
  bio: '',
  specialties: ['fuerza'],
  hourlyRateClp: 25000,
  sessionDurationMin: 60,
  city: '',
  region: '',
  zones: '',
  paymentMethods: ['cash', 'card'],
  paymentUrl: '',
  active: true,
  availableForDispatch: false,
  availabilitySlots: [],
  packages: [],
}

export interface TrainerCoachViewProps {
  open: boolean
  onClose: () => void
  trainers: TrainerProfile[]
  myTrainerProfile: TrainerProfile | null
  bookings: TrainerBooking[]
  userUid?: string
  userName?: string
  isDemoMode: boolean
  preselectedTrainerId?: string | null
  onSaveTrainerProfile: (input: TrainerProfileInput) => Promise<void>
  onCreateBooking: (trainer: TrainerProfile, input: TrainerBookingInput) => Promise<string>
  onUpdateBookingStatus: (bookingId: string, status: TrainerBooking['status']) => Promise<void>
  onOpenPayment?: (url: string) => void
  onPayWithMercadoPago?: (booking: TrainerBooking) => Promise<void>
  onStartEntrenaSync?: (booking: TrainerBooking) => Promise<void>
  onRequestReview: (trainerId: string, bookingId: string) => void
  userLat?: number
  userLng?: number
  profileCoords?: Record<string, { lat: number; lng: number }>
  activeDispatch?: TrainerDispatchRequest | null
  incomingDispatchOffer?: TrainerDispatchRequest | null
  onRequestLocation?: () => void | Promise<void>
  onCreateDispatch?: (
    input: import('../../types').TrainerDispatchInput,
    candidateIds: string[]
  ) => Promise<string>
  onCancelDispatch?: (dispatchId: string) => Promise<void>
  onDispatchMatched?: (dispatch: TrainerDispatchRequest) => void
  initialTab?: 'explore' | 'now' | 'sessions' | 'trainer'
  clientDispatchHistory?: TrainerDispatchRequest[]
  trainerDispatchHistory?: TrainerDispatchRequest[]
}

function TrainerCard({
  trainer,
  distanceKm,
  onBook,
}: {
  trainer: TrainerProfile
  distanceKm?: number | null
  onBook: () => void
}) {
  const hue = trainerAvatarHue(trainer.displayName)
  const sessionPrice = Math.round(
    (trainer.hourlyRateClp * (trainer.sessionDurationMin || 60)) / 60
  )
  const primarySpecialty = trainer.specialties[0]
  const specialtyMeta = primarySpecialty ? SPECIALTY_UI[primarySpecialty] : null

  return (
    <article
      className="trainer-card"
      style={
        specialtyMeta
          ? ({ '--trainer-accent': specialtyMeta.accent } as React.CSSProperties)
          : undefined
      }
    >
      <div className="trainer-card__glow" aria-hidden />
      <div className="trainer-card__head">
        <div
          className="trainer-card__avatar"
          style={{
            background: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 40) % 360} 65% 35%))`,
          }}
        >
          {trainerInitials(trainer.displayName)}
        </div>
        <div className="trainer-card__info">
          <h3 className="trainer-card__name">
            {trainer.displayName}
            {trainer.verified && (
              <span className="trainer-card__verified" title="Entrenador verificado">
                <Sparkles size={10} /> Verificado
              </span>
            )}
          </h3>
          <p className="trainer-card__meta">
            <MapPin size={12} /> {trainer.city || trainer.region || 'Chile'}
            {typeof distanceKm === 'number' && (
              <span className="trainer-card__distance"> · {formatDistanceKm(distanceKm)}</span>
            )}
            {trainer.zones.length > 0 && ` · ${trainer.zones.slice(0, 2).join(', ')}`}
          </p>
          {trainer.availabilitySlots && trainer.availabilitySlots.length > 0 && (
            <p className="trainer-card__avail">
              <Clock size={11} />{' '}
              {trainer.availabilitySlots.slice(0, 3).map(formatAvailabilitySlot).join(' · ')}
              {trainer.availabilitySlots.length > 3 ? '…' : ''}
            </p>
          )}
        </div>
        <div className="trainer-card__rate-block">
          <div className="trainer-card__rate">{formatTrainerRate(trainer.hourlyRateClp)}</div>
          <span className="trainer-card__rate-unit">/ hora</span>
        </div>
      </div>
      {trainer.bio && <p className="trainer-card__bio">{trainer.bio}</p>}
      <div className="trainer-card__tags">
        {trainer.specialties.slice(0, 4).map((s) => {
          const meta = SPECIALTY_UI[s]
          return (
            <span
              key={s}
              className="trainer-card__tag"
              style={{ '--tag-accent': meta.accent } as React.CSSProperties}
            >
              {meta.emoji} {meta.label}
            </span>
          )
        })}
        {trainer.availableForDispatch && (
          <span className="trainer-card__tag trainer-card__tag--live">
            <Zap size={10} /> En vivo
          </span>
        )}
      </div>
      <div className="trainer-card__footer">
        {trainer.avgRating > 0 ? (
          <p className="trainer-card__rating">
            <Star size={13} fill="#fbbf24" color="#fbbf24" />
            <strong>{trainer.avgRating.toFixed(1)}</strong>
            <span>({trainer.reviewCount} reseñas)</span>
          </p>
        ) : (
          <p className="trainer-card__rating trainer-card__rating--new">Nuevo en EntrenaCoach</p>
        )}
        <p className="trainer-card__session-price">
          Sesión {trainer.sessionDurationMin || 60} min ·{' '}
          <strong>{formatTrainerRate(sessionPrice)}</strong>
        </p>
      </div>
      <button type="button" className="trainer-card__book" onClick={onBook}>
        Reservar sesión
      </button>
    </article>
  )
}

function BookingForm({
  trainer,
  onBack,
  onSubmit,
}: {
  trainer: TrainerProfile
  onBack: () => void
  onSubmit: (input: TrainerBookingInput) => Promise<void>
}) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('18:00')
  const [locationNote, setLocationNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>(
    trainer.paymentMethods.includes('cash') ? 'cash' : 'card'
  )
  const [message, setMessage] = useState('')
  const [packageId, setPackageId] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const selectedPackage = packageId
    ? trainer.packages?.find((p) => p.id === packageId)
    : undefined
  const pricing = calcBookingPrice(trainer, selectedPackage ?? null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !time) {
      toast.error('Elige fecha y hora')
      return
    }
    const scheduledAt = new Date(`${date}T${time}`).getTime()
    if (!isWithinAvailability(trainer, scheduledAt)) {
      toast.error('Horario fuera de la disponibilidad del entrenador')
      return
    }
    setSaving(true)
    try {
      await onSubmit({
        scheduledAt,
        locationNote,
        paymentMethod,
        clientMessage: message,
        ...(packageId ? { packageId } : {}),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="trainer-book">
      <header className="trainer-coach__header trainer-coach__header--compact">
        <button type="button" onClick={onBack} className="trainer-coach__back" aria-label="Volver">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h2 className="trainer-coach__title">Confirmar reserva</h2>
          <p className="trainer-coach__sub">Último paso antes de enviar la solicitud</p>
        </div>
      </header>

      <div className="trainer-book__summary">
        <div
          className="trainer-book__summary-avatar"
          style={{
            background: `linear-gradient(135deg, hsl(${trainerAvatarHue(trainer.displayName)} 70% 45%), hsl(${(trainerAvatarHue(trainer.displayName) + 40) % 360} 65% 35%))`,
          }}
        >
          {trainerInitials(trainer.displayName)}
        </div>
        <div>
          <p className="trainer-book__summary-name">{trainer.displayName}</p>
          <p className="trainer-book__summary-meta">
            {trainer.sessionDurationMin} min · {formatTrainerRate(pricing.totalPriceClp)}
            {pricing.sessionCount > 1 && (
              <span className="trainer-book__package-tag">
                {' '}
                · Paquete {pricing.sessionCount} sesiones (−{pricing.discountPercent}%)
              </span>
            )}
          </p>
        </div>
      </div>

      <form className="trainer-book__form" onSubmit={handleSubmit}>
        {trainer.packages && trainer.packages.length > 0 && (
          <label className="marketplace-form__field">
            Tipo de reserva
            <select
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
            >
              <option value="">Sesión individual</option>
              {trainer.packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {formatPackageLabel(p)} —{' '}
                  {formatTrainerRate(calcBookingPrice(trainer, p).totalPriceClp)}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="marketplace-form__row">
          <label className="marketplace-form__field">
            Fecha
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="marketplace-form__field">
            Hora
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </label>
        </div>
        <label className="marketplace-form__field">
          Lugar (gym, parque, domicilio…)
          <input
            value={locationNote}
            onChange={(e) => setLocationNote(e.target.value)}
            placeholder="Ej. Smart Fit Providencia, piso 2"
            maxLength={200}
            required
          />
        </label>
        <label className="marketplace-form__field">
          Método de pago
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'cash')}
          >
            {trainer.paymentMethods.includes('cash') && <option value="cash">Efectivo en persona</option>}
            {trainer.paymentMethods.includes('card') && (
              <option value="card">Tarjeta (link Mercado Pago)</option>
            )}
          </select>
        </label>
        <label className="marketplace-form__field">
          Mensaje al entrenador (opcional)
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Objetivo de la sesión, lesiones, etc."
          />
        </label>
        <div className="trainer-book__actions">
          <button type="button" className="marketplace-form__cancel" onClick={onBack}>
            Cancelar
          </button>
          <button type="submit" className="marketplace-form__save" disabled={saving}>
            {saving ? 'Enviando…' : 'Solicitar sesión'}
          </button>
        </div>
      </form>
    </div>
  )
}

export function TrainerCoachView({
  open,
  onClose,
  trainers,
  myTrainerProfile,
  bookings,
  userUid,
  userName,
  isDemoMode,
  preselectedTrainerId,
  onSaveTrainerProfile,
  onCreateBooking,
  onUpdateBookingStatus,
  onOpenPayment,
  onPayWithMercadoPago,
  onStartEntrenaSync,
  onRequestReview,
  userLat,
  userLng,
  profileCoords = {},
  activeDispatch = null,
  incomingDispatchOffer = null,
  onRequestLocation,
  onCreateDispatch,
  onCancelDispatch,
  onDispatchMatched,
  initialTab,
  clientDispatchHistory = [],
  trainerDispatchHistory = [],
}: TrainerCoachViewProps) {
  const [tab, setTab] = useState<'explore' | 'now' | 'sessions' | 'trainer'>(initialTab || 'explore')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [bookingTrainer, setBookingTrainer] = useState<TrainerProfile | null>(null)
  const [trainerForm, setTrainerForm] = useState<TrainerProfileInput>(EMPTY_TRAINER_FORM)
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initialTab) setTab(initialTab)
    if (preselectedTrainerId) {
      const t = trainers.find((p) => p.userId === preselectedTrainerId)
      if (t) {
        setBookingTrainer(t)
        setTab('explore')
      }
    }
  }, [open, initialTab, preselectedTrainerId, trainers])

  useEffect(() => {
    if (myTrainerProfile) {
      setTrainerForm({
        bio: myTrainerProfile.bio,
        specialties: myTrainerProfile.specialties.length
          ? myTrainerProfile.specialties
          : ['fuerza'],
        hourlyRateClp: myTrainerProfile.hourlyRateClp,
        sessionDurationMin: myTrainerProfile.sessionDurationMin,
        city: myTrainerProfile.city,
        region: myTrainerProfile.region,
        zones: myTrainerProfile.zones.join(', '),
        paymentMethods: myTrainerProfile.paymentMethods,
        paymentUrl: myTrainerProfile.paymentUrl || '',
        active: myTrainerProfile.active,
        availableForDispatch: myTrainerProfile.availableForDispatch === true,
        availabilitySlots: myTrainerProfile.availabilitySlots || [],
        packages: myTrainerProfile.packages || [],
      })
    }
  }, [myTrainerProfile])

  const dispatchAvailableCount = useMemo(
    () => trainers.filter((t) => t.active && t.availableForDispatch).length,
    [trainers]
  )
  const pendingSessions = useMemo(
    () => bookings.filter((b) => !['declined', 'cancelled', 'paid_cash', 'paid_card'].includes(b.status)).length,
    [bookings]
  )
  const exploreTrainers = useMemo(() => {
    let active = trainers.filter((t) => t.active)
    if (verifiedOnly) active = active.filter((t) => t.verified)
    if (typeof userLat === 'number' && typeof userLng === 'number') {
      return [...active].sort((a, b) => {
        const da = trainerDistanceKm(a, profileCoords, userLat, userLng) ?? 9999
        const db = trainerDistanceKm(b, profileCoords, userLat, userLng) ?? 9999
        return da - db
      })
    }
    return active
  }, [trainers, verifiedOnly, userLat, userLng, profileCoords])

  if (!open) return null

  const startBook = (trainer: TrainerProfile) => {
    if (isDemoMode) {
      toast.error('Inicia sesión real para reservar')
      return
    }
    if (!userUid) {
      toast.error('Debes iniciar sesión')
      return
    }
    if (trainer.userId === userUid) {
      toast.error('No puedes reservarte a ti mismo')
      return
    }
    setBookingTrainer(trainer)
  }

  const handleCreateBooking = async (input: TrainerBookingInput) => {
    if (!bookingTrainer) return
    await onCreateBooking(bookingTrainer, input)
    toast.success('Solicitud enviada', {
      description: `${bookingTrainer.displayName} recibirá tu reserva`,
    })
    setBookingTrainer(null)
    setTab('sessions')
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trainerForm.bio.trim()) {
      toast.error('Agrega una bio profesional')
      return
    }
    if (trainerForm.hourlyRateClp <= 0) {
      toast.error('Indica tu tarifa por hora')
      return
    }
    setSavingProfile(true)
    try {
      await onSaveTrainerProfile(trainerForm)
      toast.success(myTrainerProfile ? 'Perfil actualizado' : '¡Ya eres entrenador en EntrenaCoach!')
    } catch {
      toast.error('No se pudo guardar el perfil')
    } finally {
      setSavingProfile(false)
    }
  }

  const toggleSpecialty = (id: TrainerSpecialty) => {
    setTrainerForm((f) => {
      const has = f.specialties.includes(id)
      const next = has ? f.specialties.filter((s) => s !== id) : [...f.specialties, id]
      return { ...f, specialties: next.length ? next : [id] }
    })
  }

  const togglePayment = (method: 'card' | 'cash') => {
    setTrainerForm((f) => {
      const has = f.paymentMethods.includes(method)
      const next = has ? f.paymentMethods.filter((m) => m !== method) : [...f.paymentMethods, method]
      return { ...f, paymentMethods: next.length ? next : ['cash'] }
    })
  }

  if (bookingTrainer) {
    return (
      <div className="trainer-coach-screen" role="dialog" aria-label="Reservar entrenador">
        <BookingForm
          trainer={bookingTrainer}
          onBack={() => setBookingTrainer(null)}
          onSubmit={handleCreateBooking}
        />
      </div>
    )
  }

  return (
    <div className="trainer-coach-screen" role="dialog" aria-label="EntrenaCoach">
      <header className="trainer-coach__header">
        <button type="button" onClick={onClose} className="trainer-coach__back" aria-label="Volver">
          <ArrowLeft size={22} />
        </button>
        <div className="trainer-coach__brand">
          <div className="trainer-coach__brand-icon">
            <Dumbbell size={18} />
          </div>
          <div>
            <h1 className="trainer-coach__title">EntrenaCoach</h1>
            <p className="trainer-coach__sub">Entrenadores premium · reserva o pide al instante</p>
          </div>
        </div>
      </header>

      <TrainerCoachHero
        trainerCount={trainers.length}
        dispatchCount={dispatchAvailableCount}
        sessionCount={pendingSessions}
        onGoNow={dispatchAvailableCount > 0 ? () => setTab('now') : undefined}
      />

      {incomingDispatchOffer && tab !== 'now' && onCreateDispatch && onCancelDispatch && (
        <div className="trainer-coach__panel trainer-coach__offer-banner">
          <TrainerDispatchPanel
            trainers={trainers}
            profileCoords={profileCoords}
            userLat={userLat}
            userLng={userLng}
            userUid={userUid}
            userName={userName}
            isDemoMode={isDemoMode}
            activeDispatch={null}
            incomingOffer={incomingDispatchOffer}
            onRequestLocation={() => void onRequestLocation?.()}
            onCreateDispatch={onCreateDispatch}
            onCancelDispatch={onCancelDispatch}
          />
        </div>
      )}

      <div className="trainer-coach__tabs">
        {TAB_CONFIG.map(({ id, label, icon: Icon, live }) => (
          <button
            key={id}
            type="button"
            className={
              tab === id
                ? `trainer-coach__tab--active${live ? ' trainer-coach__tab--live' : ''}`
                : `trainer-coach__tab${live ? ' trainer-coach__tab--live-idle' : ''}`
            }
            onClick={() => setTab(id)}
          >
            <Icon size={14} />
            {label}
            {live && dispatchAvailableCount > 0 && (
              <span className="trainer-coach__tab-dot" aria-hidden />
            )}
            {id === 'sessions' && pendingSessions > 0 && (
              <span className="trainer-coach__tab-badge">{pendingSessions}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'now' && onCreateDispatch && onCancelDispatch && (
        <div className="trainer-coach__panel">
          <TrainerDispatchPanel
            trainers={trainers}
            profileCoords={profileCoords}
            userLat={userLat}
            userLng={userLng}
            userUid={userUid}
            userName={userName}
            isDemoMode={isDemoMode}
            activeDispatch={activeDispatch}
            incomingOffer={incomingDispatchOffer}
            onRequestLocation={() => void onRequestLocation?.()}
            onCreateDispatch={onCreateDispatch}
            onCancelDispatch={onCancelDispatch}
            onDispatchMatched={(d) => {
              setTab('sessions')
              onDispatchMatched?.(d)
            }}
          />
          <TrainerDispatchHistory
            clientHistory={clientDispatchHistory}
            trainerHistory={trainerDispatchHistory}
            userUid={userUid}
          />
        </div>
      )}

      {tab === 'now' && !onCreateDispatch && (
        <div className="trainer-coach__panel trainer-coach__empty">
          <Zap size={40} className="opacity-40" />
          <p>Entrenador ahora requiere sesión real</p>
        </div>
      )}

      {tab === 'explore' && (
        <div className="trainer-coach__panel">
          {dispatchAvailableCount > 0 && (
            <button
              type="button"
              className="trainer-coach__now-promo"
              onClick={() => setTab('now')}
            >
              <span className="trainer-coach__now-promo-icon">
                <Zap size={20} />
              </span>
              <span className="trainer-coach__now-promo-text">
                <strong>¿Lo necesitas ya?</strong>
                <span>
                  Entrenador en minutos · tarifa dinámica · {dispatchAvailableCount} cerca
                </span>
              </span>
              <span className="trainer-coach__now-promo-arrow">→</span>
            </button>
          )}
          {trainers.length === 0 ? (
            <div className="trainer-coach__empty">
              <div className="trainer-coach__empty-icon">
                <Dumbbell size={32} />
              </div>
              <h3>Sé el primero en tu zona</h3>
              <p>Aún no hay entrenadores activos. Publica tu perfil PT y atrae clientes.</p>
              <button type="button" className="trainer-coach__cta" onClick={() => setTab('trainer')}>
                Ofrecer servicios como entrenador
              </button>
            </div>
          ) : exploreTrainers.length === 0 ? (
            <div className="trainer-coach__empty">
              <BadgeCheck size={32} className="opacity-50" />
              <h3>Sin verificados</h3>
              <p>Ningún entrenador verificado aún. Prueba sin el filtro.</p>
              <button type="button" className="trainer-coach__cta" onClick={() => setVerifiedOnly(false)}>
                Ver todos
              </button>
            </div>
          ) : (
            <>
              <div className="trainer-coach__explore-filters">
                <button
                  type="button"
                  className={
                    verifiedOnly
                      ? 'trainer-coach__filter--active'
                      : 'trainer-coach__filter'
                  }
                  onClick={() => setVerifiedOnly((v) => !v)}
                >
                  <BadgeCheck size={14} /> Solo verificados
                </button>
              </div>
              <p className="trainer-coach__list-label">
                {exploreTrainers.length} entrenador{exploreTrainers.length !== 1 ? 'es' : ''}{' '}
                {verifiedOnly ? 'verificado' : 'disponible'}
                {exploreTrainers.length !== 1 ? 's' : ''}
              </p>
              {exploreTrainers.map((t) => (
                <TrainerCard
                  key={t.userId}
                  trainer={t}
                  distanceKm={trainerDistanceKm(t, profileCoords, userLat, userLng)}
                  onBook={() => startBook(t)}
                />
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'sessions' && (
        <div className="trainer-coach__panel">
          {bookings.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-wider text-[#6366f1] font-bold mb-2">Calendario</p>
              <TrainerBookingsCalendar bookings={bookings} />
            </div>
          )}
          {bookings.length === 0 ? (
            <div className="trainer-coach__empty">
              <div className="trainer-coach__empty-icon">
                <CalendarDays size={32} />
              </div>
              <h3>Sin sesiones aún</h3>
              <p>Reserva un entrenador o pide uno al instante en la pestaña Ahora.</p>
              <button type="button" className="trainer-coach__cta" onClick={() => setTab('explore')}>
                Explorar entrenadores
              </button>
            </div>
          ) : (
            bookings.map((b) => {
              const isTrainer = b.trainerId === userUid
              const isClient = b.clientId === userUid
              const partner = isTrainer ? b.clientName : b.trainerName
              const statusTone = BOOKING_STATUS_TONE[b.status]
              return (
                <article
                  key={b.id}
                  className={`trainer-session-card trainer-session-card--${statusTone}`}
                >
                  <div className="trainer-session-card__accent" aria-hidden />
                  <div className="trainer-session-card__head">
                    <span className={`trainer-session-card__status trainer-session-card__status--${statusTone}`}>
                      {BOOKING_STATUS_LABELS[b.status]}
                    </span>
                    <span className="trainer-session-card__price">{formatTrainerRate(b.priceClp)}</span>
                  </div>
                  {b.packageSessions && b.packageSessions > 1 && (
                    <p className="trainer-session-card__package">
                      Paquete {b.packageSessions} sesiones
                      {b.packageDiscountPercent ? ` (−${b.packageDiscountPercent}%)` : ''}
                    </p>
                  )}
                  <div className="trainer-session-card__partner">
                    <div
                      className="trainer-session-card__avatar"
                      style={{
                        background: `linear-gradient(135deg, hsl(${trainerAvatarHue(partner)} 70% 45%), hsl(${(trainerAvatarHue(partner) + 40) % 360} 65% 35%))`,
                      }}
                    >
                      {trainerInitials(partner)}
                    </div>
                    <div>
                      <p className="trainer-session-card__who">
                        {isTrainer ? 'Cliente' : 'Entrenador'}
                      </p>
                      <p className="trainer-session-card__name">{partner}</p>
                    </div>
                  </div>
                  <div className="trainer-session-card__details">
                    <p className="trainer-session-card__when">
                      <Clock size={14} />{' '}
                      {new Date(b.scheduledAt).toLocaleString('es-CL', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                    <p className="trainer-session-card__where">
                      <MapPin size={14} /> {b.locationNote}
                    </p>
                    <p className="trainer-session-card__pay">
                      {b.paymentMethod === 'card' ? (
                        <>
                          <CreditCard size={14} /> Tarjeta
                        </>
                      ) : (
                        <>💵 Efectivo</>
                      )}
                    </p>
                  </div>
                  <div className="trainer-session-card__actions">
                    {b.clientId === userUid && ['requested', 'accepted'].includes(b.status) && (
                      <button
                        type="button"
                        className="trainer-session-card__decline"
                        onClick={() => void onUpdateBookingStatus(b.id, 'cancelled')}
                      >
                        Cancelar reserva
                      </button>
                    )}
                    {isTrainer && b.status === 'requested' && (
                      <>
                        <button
                          type="button"
                          className="trainer-session-card__accept"
                          onClick={() => void onUpdateBookingStatus(b.id, 'accepted')}
                        >
                          <Check size={14} /> Aceptar
                        </button>
                        <button
                          type="button"
                          className="trainer-session-card__decline"
                          onClick={() => void onUpdateBookingStatus(b.id, 'declined')}
                        >
                          <X size={14} /> Rechazar
                        </button>
                      </>
                    )}
                    {isTrainer && b.status === 'accepted' && (
                      <button
                        type="button"
                        className="trainer-session-card__accept"
                        onClick={() => void onUpdateBookingStatus(b.id, 'in_progress')}
                      >
                        Iniciar sesión
                      </button>
                    )}
                    {(isTrainer || isClient) &&
                      ['accepted', 'in_progress'].includes(b.status) &&
                      onStartEntrenaSync && (
                        <button
                          type="button"
                          className="trainer-session-card__sync"
                          onClick={() => void onStartEntrenaSync(b)}
                        >
                          <Zap size={14} /> EntrenaSync
                        </button>
                      )}
                    {(isTrainer || isClient) &&
                      ['accepted', 'in_progress'].includes(b.status) && (
                        <button
                          type="button"
                          className="trainer-session-card__accept"
                          onClick={() => void onUpdateBookingStatus(b.id, 'completed')}
                        >
                          Marcar completada
                        </button>
                      )}
                    {isClient && b.status === 'completed' && b.paymentMethod === 'card' && (
                      <button
                        type="button"
                        className="trainer-session-card__pay-btn"
                        onClick={async () => {
                          if (onPayWithMercadoPago) {
                            try {
                              await onPayWithMercadoPago(b)
                            } catch {
                              /* toast in handler */
                            }
                            return
                          }
                          const trainer = trainers.find((t) => t.userId === b.trainerId)
                          const url = trainer?.paymentUrl
                          if (url?.startsWith('https://')) {
                            onOpenPayment?.(url)
                            void onUpdateBookingStatus(b.id, 'paid_card')
                          } else {
                            toast.error('Pago con tarjeta no configurado')
                          }
                        }}
                      >
                        <CreditCard size={14} /> Pagar con tarjeta
                      </button>
                    )}
                    {isClient && b.status === 'completed' && b.paymentMethod === 'cash' && (
                      <button
                        type="button"
                        className="trainer-session-card__pay-btn"
                        onClick={() => void onUpdateBookingStatus(b.id, 'paid_cash')}
                      >
                        Confirmar pago efectivo
                      </button>
                    )}
                    {isTrainer && b.status === 'completed' && b.paymentMethod === 'cash' && (
                      <button
                        type="button"
                        className="trainer-session-card__pay-btn"
                        onClick={() => void onUpdateBookingStatus(b.id, 'paid_cash')}
                      >
                        Cobré en efectivo
                      </button>
                    )}
                    {isClient &&
                      ['completed', 'paid_cash', 'paid_card'].includes(b.status) &&
                      !b.reviewId && (
                        <button
                          type="button"
                          className="trainer-session-card__review"
                          onClick={() => onRequestReview(b.trainerId, b.id)}
                        >
                          <Star size={14} /> Calificar sesión
                        </button>
                      )}
                    {b.status === 'paid_card' && (
                      <span className="trainer-session-card__paid-badge">
                        <Check size={12} /> Pagado
                      </span>
                    )}
                  </div>
                </article>
              )
            })
          )}
        </div>
      )}

      {tab === 'trainer' && (
        <form className="trainer-coach__panel marketplace-form" onSubmit={handleSaveProfile}>
          {myTrainerProfile && (
            <div className="mb-4">
              <TrainerEarningsPanel bookings={bookings.filter((b) => b.trainerId === userUid)} />
            </div>
          )}
          <div className="trainer-coach__pt-hero">
            <BadgeCheck size={22} />
            <div>
              <p className="trainer-coach__pt-hero-title">
                {myTrainerProfile ? 'Tu perfil profesional' : 'Conviértete en entrenador'}
              </p>
              <p className="trainer-coach__pt-hero-sub">
                {myTrainerProfile
                  ? 'Visible en Explorar. Actualiza tarifa, zonas y modo en vivo.'
                  : 'Publica tu perfil y empieza a recibir clientes en EntrenaCoach.'}
              </p>
            </div>
          </div>

          <div
            className={`trainer-coach__dispatch-card${trainerForm.availableForDispatch ? ' trainer-coach__dispatch-card--on' : ''}`}
          >
            <div className="trainer-coach__dispatch-card-icon">
              <Zap size={20} />
            </div>
            <div className="trainer-coach__dispatch-card-body">
              <p className="trainer-coach__dispatch-card-title">Modo en vivo (Uber-mode)</p>
              <p className="trainer-coach__dispatch-card-desc">
                Recibe ofertas instantáneas de clientes cerca. Acepta o pasa en 90 segundos.
              </p>
            </div>
            <label className="trainer-coach__dispatch-toggle">
              <input
                type="checkbox"
                checked={trainerForm.availableForDispatch === true}
                onChange={(e) =>
                  setTrainerForm((f) => ({ ...f, availableForDispatch: e.target.checked }))
                }
              />
              <span className="trainer-coach__dispatch-toggle-ui" />
            </label>
          </div>
          <TrainerAvailabilityEditor
            slots={trainerForm.availabilitySlots || []}
            onChange={(availabilitySlots) =>
              setTrainerForm((f) => ({ ...f, availabilitySlots }))
            }
          />
          <TrainerPackagesEditor
            packages={trainerForm.packages || []}
            onChange={(packages) => setTrainerForm((f) => ({ ...f, packages }))}
          />
          <label className="marketplace-form__field">
            Bio profesional
            <textarea
              value={trainerForm.bio}
              onChange={(e) => setTrainerForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              maxLength={800}
              placeholder="Experiencia, certificaciones, estilo de entrenamiento…"
              required
            />
          </label>
          <div className="marketplace-form__field">
            Especialidades
            <div className="trainer-coach__chips">
              {TRAINER_SPECIALTIES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={
                    trainerForm.specialties.includes(s.id)
                      ? 'trainer-coach__chip--on'
                      : 'trainer-coach__chip'
                  }
                  onClick={() => toggleSpecialty(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="marketplace-form__row">
            <label className="marketplace-form__field">
              Tarifa / hora (CLP)
              <input
                type="number"
                min={0}
                value={trainerForm.hourlyRateClp || ''}
                onChange={(e) =>
                  setTrainerForm((f) => ({
                    ...f,
                    hourlyRateClp: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                required
              />
            </label>
            <label className="marketplace-form__field">
              Duración sesión (min)
              <input
                type="number"
                min={30}
                max={180}
                step={15}
                value={trainerForm.sessionDurationMin}
                onChange={(e) =>
                  setTrainerForm((f) => ({
                    ...f,
                    sessionDurationMin: Number(e.target.value) || 60,
                  }))
                }
              />
            </label>
          </div>
          <div className="marketplace-form__row">
            <label className="marketplace-form__field">
              Ciudad
              <input
                value={trainerForm.city}
                onChange={(e) => setTrainerForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="Santiago"
              />
            </label>
            <label className="marketplace-form__field">
              Región
              <select
                value={trainerForm.region}
                onChange={(e) => setTrainerForm((f) => ({ ...f, region: e.target.value }))}
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
          <label className="marketplace-form__field">
            Zonas / comunas (separadas por coma)
            <input
              value={trainerForm.zones}
              onChange={(e) => setTrainerForm((f) => ({ ...f, zones: e.target.value }))}
              placeholder="Providencia, Las Condes, Ñuñoa"
            />
          </label>
          <div className="marketplace-form__field">
            Métodos de pago aceptados
            <div className="trainer-coach__chips">
              <button
                type="button"
                className={
                  trainerForm.paymentMethods.includes('cash')
                    ? 'trainer-coach__chip--on'
                    : 'trainer-coach__chip'
                }
                onClick={() => togglePayment('cash')}
              >
                Efectivo
              </button>
              <button
                type="button"
                className={
                  trainerForm.paymentMethods.includes('card')
                    ? 'trainer-coach__chip--on'
                    : 'trainer-coach__chip'
                }
                onClick={() => togglePayment('card')}
              >
                Tarjeta
              </button>
            </div>
          </div>
          {trainerForm.paymentMethods.includes('card') && (
            <label className="marketplace-form__field">
              Link de pago (Mercado Pago)
              <input
                type="url"
                value={trainerForm.paymentUrl || ''}
                onChange={(e) => setTrainerForm((f) => ({ ...f, paymentUrl: e.target.value }))}
                placeholder="https://mpago.la/..."
              />
            </label>
          )}
          <label className="marketplace-form__check">
            <input
              type="checkbox"
              checked={trainerForm.active}
              onChange={(e) => setTrainerForm((f) => ({ ...f, active: e.target.checked }))}
            />
            Visible para clientes en Explorar
          </label>
          <button type="submit" className="marketplace-form__save trainer-coach__save-pt" disabled={savingProfile}>
            {savingProfile ? 'Guardando…' : myTrainerProfile ? 'Actualizar perfil PT' : 'Publicar como entrenador'}
          </button>
        </form>
      )}
    </div>
  )
}
