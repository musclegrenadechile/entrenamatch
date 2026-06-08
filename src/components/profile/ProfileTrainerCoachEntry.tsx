import { ChevronRight, Dumbbell, Sparkles, Zap } from 'lucide-react'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

export function ProfileTrainerCoachEntry(props: ProfileTabProps) {
  const { onOpenTrainerCoach } = profileTabBindings(props)
  if (!onOpenTrainerCoach) return null

  return (
    <div className="px-4 mt-3 mb-1">
      <button
        type="button"
        onClick={onOpenTrainerCoach}
        className="trainer-profile-entry"
      >
        <div className="trainer-profile-entry__glow" aria-hidden />
        <div className="trainer-profile-entry__icon">
          <Dumbbell size={22} />
        </div>
        <div className="trainer-profile-entry__body">
          <div className="trainer-profile-entry__title-row">
            <p className="trainer-profile-entry__title">EntrenaCoach</p>
            <span className="trainer-profile-entry__badge">
              <Zap size={10} /> En vivo
            </span>
          </div>
          <p className="trainer-profile-entry__sub">
            Reserva PT premium o pide entrenador al instante con tarifa dinámica
          </p>
          <p className="trainer-profile-entry__tags">
            <Sparkles size={10} /> Verificados · Mercado Pago · EntrenaSync
          </p>
        </div>
        <ChevronRight size={18} className="trainer-profile-entry__chevron" />
      </button>
    </div>
  )
}
