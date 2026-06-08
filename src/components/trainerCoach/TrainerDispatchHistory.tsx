import { History, MapPin, Zap } from 'lucide-react'
import type { TrainerDispatchRequest } from '../../types'
import { DISPATCH_STATUS_LABELS } from '../../services/trainerDispatch'
import { formatTrainerRate } from '../../services/trainerCoach'
import { SPECIALTY_UI } from './trainerCoachUi'

export interface TrainerDispatchHistoryProps {
  clientHistory: TrainerDispatchRequest[]
  trainerHistory: TrainerDispatchRequest[]
  userUid?: string
}

function DispatchHistoryCard({
  item,
  role,
}: {
  item: TrainerDispatchRequest
  role: 'client' | 'trainer'
}) {
  const specialty = SPECIALTY_UI[item.specialty]
  const when = new Date(item.createdAt).toLocaleString('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

  return (
    <article className={`dispatch-history__card dispatch-history__card--${item.status}`}>
      <div className="dispatch-history__head">
        <span className="dispatch-history__status">{DISPATCH_STATUS_LABELS[item.status]}</span>
        <span className="dispatch-history__price">{formatTrainerRate(item.offerPriceClp)}</span>
      </div>
      <p className="dispatch-history__meta">
        {specialty?.emoji} {specialty?.label || item.specialty} · {item.durationMin} min · {when}
      </p>
      {role === 'trainer' && (
        <p className="dispatch-history__party">Cliente: {item.clientName}</p>
      )}
      {role === 'client' && item.matchedTrainerId && (
        <p className="dispatch-history__party">
          PT: {item.currentTrainerName || 'Entrenador asignado'}
        </p>
      )}
      {item.locationNote && (
        <p className="dispatch-history__loc">
          <MapPin size={11} /> {item.locationNote}
        </p>
      )}
      {item.surgeFactor > 1 && (
        <p className="dispatch-history__surge">Tarifa dinámica ×{item.surgeFactor.toFixed(2)}</p>
      )}
    </article>
  )
}

export function TrainerDispatchHistory({
  clientHistory,
  trainerHistory,
  userUid,
}: TrainerDispatchHistoryProps) {
  const hasClient = clientHistory.length > 0
  const hasTrainer = trainerHistory.length > 0
  if (!userUid || (!hasClient && !hasTrainer)) return null

  return (
    <section className="dispatch-history" aria-label="Historial Entrenador ahora">
      <h3 className="dispatch-history__title">
        <History size={16} /> Historial Uber-mode
      </h3>
      {hasClient && (
        <>
          <p className="dispatch-history__sub">
            <Zap size={12} /> Tus búsquedas
          </p>
          {clientHistory.map((item) => (
            <DispatchHistoryCard key={item.id} item={item} role="client" />
          ))}
        </>
      )}
      {hasTrainer && (
        <>
          <p className="dispatch-history__sub">
            <Zap size={12} /> Sesiones instantáneas atendidas
          </p>
          {trainerHistory.map((item) => (
            <DispatchHistoryCard key={item.id} item={item} role="trainer" />
          ))}
        </>
      )}
    </section>
  )
}
