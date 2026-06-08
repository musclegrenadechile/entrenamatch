import { Sparkles, Users, Zap } from 'lucide-react'

export interface TrainerCoachHeroProps {
  trainerCount: number
  dispatchCount: number
  sessionCount: number
  onGoNow?: () => void
}

export function TrainerCoachHero({
  trainerCount,
  dispatchCount,
  sessionCount,
  onGoNow,
}: TrainerCoachHeroProps) {
  return (
    <section className="trainer-coach__hero">
      <div className="trainer-coach__hero-bg" aria-hidden />
      <div className="trainer-coach__hero-content">
        <div className="trainer-coach__hero-badge">
          <Sparkles size={12} /> Premium PT
        </div>
        <h2 className="trainer-coach__hero-title">
          Tu entrenador ideal,
          <span> a un toque</span>
        </h2>
        <p className="trainer-coach__hero-desc">
          Reserva con anticipación o pide uno al instante con tarifa dinámica cerca tuyo.
        </p>
        <div className="trainer-coach__hero-stats">
          <div className="trainer-coach__hero-stat">
            <Users size={14} />
            <strong>{trainerCount}</strong>
            <span>activos</span>
          </div>
          <div className="trainer-coach__hero-stat trainer-coach__hero-stat--live">
            <Zap size={14} />
            <strong>{dispatchCount}</strong>
            <span>en vivo</span>
          </div>
          {sessionCount > 0 && (
            <div className="trainer-coach__hero-stat">
              <strong>{sessionCount}</strong>
              <span>sesiones</span>
            </div>
          )}
        </div>
        {onGoNow && dispatchCount > 0 && (
          <button type="button" className="trainer-coach__hero-cta" onClick={onGoNow}>
            <Zap size={16} /> Entrenador ahora · {dispatchCount} cerca
          </button>
        )}
      </div>
    </section>
  )
}
