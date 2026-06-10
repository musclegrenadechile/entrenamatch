import type { GymVibeSummary } from '../../services/gymSoundVibe'

export interface GymVibeDetailProps {
  vibe: GymVibeSummary
  expanded?: boolean
  onToggle?: () => void
  className?: string
}

/** P1 — who nearby listens to what at the gym. */
export function GymVibeDetail({ vibe, expanded, onToggle, className = '' }: GymVibeDetailProps) {
  const headline =

    vibe.topTrackCount && vibe.topTrackCount >= 2 && vibe.topTrack

      ? `${vibe.topTrackCount} escuchan «${vibe.topTrack}»`

      : vibe.topCount >= 2

        ? `${vibe.topCount} con ${vibe.topArtist}`

        : `${vibe.liveWithMusic} en vivo con música`



  return (

    <div className={`gym-vibe-detail ${expanded ? 'gym-vibe-detail--open' : ''} ${className}`.trim()}>

      <button

        type="button"

        className="gym-vibe-detail__pill"

        onClick={onToggle}

        aria-expanded={expanded}

      >

        <span className="gym-vibe-detail__tag">VIBRA DEL GYM</span>

        <span className="gym-vibe-detail__headline">{headline}</span>

        {vibe.gymName && <span className="gym-vibe-detail__gym">🏋️ {vibe.gymName}</span>}

      </button>

      {expanded && vibe.listeners.length > 0 && (

        <ul className="gym-vibe-detail__list">

          {vibe.listeners.map((l) => (

            <li key={l.userId} className="gym-vibe-detail__row">

              <span className="gym-vibe-detail__name">{l.name.split(' ')[0]}</span>

              <span className="gym-vibe-detail__track">

                {l.trackName}

                {l.artistName ? ` · ${l.artistName}` : ''}

              </span>

            </li>

          ))}

        </ul>

      )}

    </div>

  )

}

