import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  CreditCard,
  Dumbbell,
  ExternalLink,
  MapPin,
  Star,
  User,
  X,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { CHILE_REGIONS } from '../../data/chileRegions'
import type {
  TrainerBooking,
  TrainerBookingInput,
  TrainerProfile,
  TrainerProfileInput,
  TrainerSpecialty,
} from '../../types'
import {
  BOOKING_STATUS_LABELS,
  TRAINER_SPECIALTIES,
  formatTrainerRate,
} from '../../services/trainerCoach'

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
}

function TrainerCard({
  trainer,
  onBook,
}: {
  trainer: TrainerProfile
  onBook: () => void
}) {
  return (
    <article className="trainer-card">
      <div className="trainer-card__head">
        <div className="trainer-card__avatar">
          <Dumbbell size={20} />
        </div>
        <div className="trainer-card__info">
          <h3 className="trainer-card__name">
            {trainer.displayName}
            {trainer.verified && (
              <span className="trainer-card__verified" title="Entrenador verificado">
                ✓
              </span>
            )}
          </h3>
          <p className="trainer-card__meta">
            <MapPin size={12} /> {trainer.city || trainer.region || 'Chile'}
          </p>
        </div>
        <div className="trainer-card__rate">{formatTrainerRate(trainer.hourlyRateClp)}/h</div>
      </div>
      {trainer.bio && <p className="trainer-card__bio">{trainer.bio}</p>}
      <div className="trainer-card__tags">
        {trainer.specialties.slice(0, 4).map((s) => (
          <span key={s} className="trainer-card__tag">
            {TRAINER_SPECIALTIES.find((t) => t.id === s)?.label || s}
          </span>
        ))}
      </div>
      {trainer.avgRating > 0 && (
        <p className="trainer-card__rating">
          <Star size={12} fill="#fbbf24" color="#fbbf24" /> {trainer.avgRating.toFixed(1)} (
          {trainer.reviewCount})
        </p>
      )}
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
  const [saving, setSaving] = useState(false)

  const price = Math.round((trainer.hourlyRateClp * (trainer.sessionDurationMin || 60)) / 60)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !time) {
      toast.error('Elige fecha y hora')
      return
    }
    const scheduledAt = new Date(`${date}T${time}`).getTime()
    setSaving(true)
    try {
      await onSubmit({
        scheduledAt,
        locationNote,
        paymentMethod,
        clientMessage: message,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="trainer-book">
      <header className="trainer-coach__header">
        <button type="button" onClick={onBack} className="trainer-coach__back" aria-label="Volver">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h2 className="trainer-coach__title">Reservar con {trainer.displayName}</h2>
          <p className="trainer-coach__sub">
            {trainer.sessionDurationMin} min · {formatTrainerRate(price)}
          </p>
        </div>
      </header>

      <form className="trainer-book__form" onSubmit={handleSubmit}>
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
}: TrainerCoachViewProps) {
  const [tab, setTab] = useState<'explore' | 'sessions' | 'trainer'>('explore')
  const [bookingTrainer, setBookingTrainer] = useState<TrainerProfile | null>(null)
  const [trainerForm, setTrainerForm] = useState<TrainerProfileInput>(EMPTY_TRAINER_FORM)
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (!open) return
    if (preselectedTrainerId) {
      const t = trainers.find((p) => p.userId === preselectedTrainerId)
      if (t) {
        setBookingTrainer(t)
        setTab('explore')
      }
    }
  }, [open, preselectedTrainerId, trainers])

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
      })
    }
  }, [myTrainerProfile])

  const myAsTrainer = useMemo(
    () => bookings.filter((b) => b.trainerId === userUid),
    [bookings, userUid]
  )
  const myAsClient = useMemo(
    () => bookings.filter((b) => b.clientId === userUid),
    [bookings, userUid]
  )

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
        <div>
          <h1 className="trainer-coach__title">EntrenaCoach</h1>
          <p className="trainer-coach__sub">Entrenadores personales verificados</p>
        </div>
      </header>

      <div className="trainer-coach__tabs">
        {(['explore', 'sessions', 'trainer'] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? 'trainer-coach__tab--active' : 'trainer-coach__tab'}
            onClick={() => setTab(t)}
          >
            {t === 'explore' ? 'Explorar' : t === 'sessions' ? 'Mis sesiones' : 'Modo PT'}
          </button>
        ))}
      </div>

      {tab === 'explore' && (
        <div className="trainer-coach__panel">
          {trainers.length === 0 ? (
            <div className="trainer-coach__empty">
              <Dumbbell size={40} className="opacity-40" />
              <p>Aún no hay entrenadores activos</p>
              <button type="button" className="trainer-coach__cta" onClick={() => setTab('trainer')}>
                Ofrecer servicios como entrenador
              </button>
            </div>
          ) : (
            trainers.map((t) => (
              <TrainerCard key={t.userId} trainer={t} onBook={() => startBook(t)} />
            ))
          )}
        </div>
      )}

      {tab === 'sessions' && (
        <div className="trainer-coach__panel">
          {bookings.length === 0 ? (
            <div className="trainer-coach__empty">
              <Calendar size={36} className="opacity-40" />
              <p>Sin sesiones programadas</p>
            </div>
          ) : (
            bookings.map((b) => {
              const isTrainer = b.trainerId === userUid
              const isClient = b.clientId === userUid
              const partner = isTrainer ? b.clientName : b.trainerName
              return (
                <article key={b.id} className="trainer-session-card">
                  <div className="trainer-session-card__head">
                    <span className="trainer-session-card__status">{BOOKING_STATUS_LABELS[b.status]}</span>
                    <span className="trainer-session-card__price">{formatTrainerRate(b.priceClp)}</span>
                  </div>
                  <p className="trainer-session-card__who">
                    <User size={14} /> {isTrainer ? `Cliente: ${partner}` : `Entrenador: ${partner}`}
                  </p>
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
                  <div className="trainer-session-card__actions">
                    {isClient && ['requested', 'accepted'].includes(b.status) && (
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
          <p className="trainer-coach__setup-hint">
            {myTrainerProfile
              ? 'Tu perfil está visible en Explorar. Actualiza tarifa y zonas.'
              : 'Activa tu perfil profesional. Los clientes te encontrarán en EntrenaCoach.'}
          </p>
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
            Visible para clientes
          </label>
          <button type="submit" className="marketplace-form__save" disabled={savingProfile}>
            {savingProfile ? 'Guardando…' : myTrainerProfile ? 'Actualizar perfil PT' : 'Publicar como entrenador'}
          </button>
        </form>
      )}
    </div>
  )
}
