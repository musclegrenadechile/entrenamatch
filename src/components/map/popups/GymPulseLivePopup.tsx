import { User, X } from 'lucide-react'
import { VerifiedProfilePhoto } from '../../profile/VerifiedProfilePhoto'
import type { IdentityVerificationStatus } from '../../../utils/identityVerification'
import { getPublicGymSound } from '../../../services/gymSound'
import { NowPlayingBadge } from '../../music/NowPlayingBadge'
import { GymSoundReactionBar } from '../../music/GymSoundReactionBar'
import type { GymSoundAnthem, SpotifyNowPlaying } from '../../../types'
import type { SyncRipple } from '../../../services/gymSoundReactions'
import type { GymSoundDisplay } from '../../../types'

export interface GymPulseLivePopupProps {
  user: Record<string, unknown>
  isBond: boolean
  onClose: () => void
  onShowProfile: () => void
  onStartSync: () => void
  selfName?: string
  selfNowPlaying?: GymSoundDisplay | null
  setSyncRipples?: (updater: SyncRipple[] | ((prev: SyncRipple[]) => SyncRipple[])) => void
  onHaptic?: () => void
}

export function GymPulseLivePopup({
  user,
  isBond,
  onClose,
  onShowProfile,
  onStartSync,
  selfName,
  selfNowPlaying,
  setSyncRipples,
  onHaptic,
}: GymPulseLivePopupProps) {
  const name = String(user.name || 'Atleta')
  const photos = user.photos as string[] | undefined
  const trainingTypes = user.trainingTypes as string[] | undefined
  const distance = typeof user.distance === 'number' ? user.distance : 0
  const seVaEnMin = user.seVaEnMin as number | null | undefined
  const joinCount = user.joinCount as number | undefined
  const gymName = (user.gymCheckIn as { gymName?: string } | undefined)?.gymName
  const hasPulso = ((user.visibleLevel as number) || 1) >= 20
  const isHigh = ((user.visibleLevel as number) || 1) >= 15 || isBond
  const nowPlaying = getPublicGymSound({
    trainingNow: true,
    spotifyShareLive: user.spotifyShareLive === true,
    spotifyNowPlaying: user.spotifyNowPlaying as SpotifyNowPlaying | undefined,
    gymSoundAnthem: user.gymSoundAnthem as GymSoundAnthem | undefined,
  })

  return (
    <div className="gym-pulse-live-popup">
      <button type="button" className="gym-pulse-live-popup__close" onClick={onClose} aria-label="Cerrar">
        <X size={18} />
      </button>
      <div className="gym-pulse-live-popup__row">
        {photos?.[0] ? (
          <VerifiedProfilePhoto
            src={photos[0]}
            alt={`Foto de ${name}`}
            className="gym-pulse-live-popup__avatar"
            imgClassName="gym-pulse-live-popup__avatar w-full h-full object-cover"
            verificationStatus={user.verificationStatus as IdentityVerificationStatus | undefined}
            badgeSize="xs"
            badgeCorner="bottom-right"
          />
        ) : (
          <div className="gym-pulse-live-popup__avatar gym-pulse-live-popup__avatar--fallback">
            {name[0]}
          </div>
        )}
        <div>
          <div className="gym-pulse-live-popup__name">
            {name}
            {isBond && <span className="gym-pulse-live-popup__bond">⭐ RED</span>}
            <span className="gym-pulse-live-popup__live">🟢 EN VIVO</span>
          </div>
          <p className="gym-pulse-live-popup__sub">
            {trainingTypes?.[0] || 'Entreno'} · {distance.toFixed(1)} km
            {joinCount ? ` · ${joinCount} unidos` : ''}
            {hasPulso ? ' · PULSO MAESTRO' : isHigh ? ' · ALTO NIVEL' : ''}
          </p>
          {gymName && (
            <p className="gym-pulse-live-popup__gym">🏋️ {gymName}</p>
          )}
          {seVaEnMin != null && (
            <p className="gym-pulse-live-popup__urgent">⏱ Se va en ~{seVaEnMin} min — ¡únete ya!</p>
          )}
          {nowPlaying && (
            <div className="gym-pulse-live-popup__music">
              <NowPlayingBadge nowPlaying={nowPlaying} size="sm" />
              <GymSoundReactionBar
                compact
                target={{
                  userId: String(user.id || ''),
                  userName: name,
                  lat: typeof user.lat === 'number' ? user.lat : undefined,
                  lng: typeof user.lng === 'number' ? user.lng : undefined,
                  nowPlaying,
                }}
                selfName={selfName}
                selfNowPlaying={selfNowPlaying}
                setSyncRipples={setSyncRipples}
                onHaptic={onHaptic}
              />
            </div>
          )}
        </div>
      </div>
      <div className="gym-pulse-live-popup__actions">
        <button type="button" className="gym-pulse-live-popup__btn" onClick={onShowProfile}>
          <User size={14} />
          Ver perfil
        </button>
        <button type="button" className="gym-pulse-live-popup__btn gym-pulse-live-popup__btn--sync" onClick={onStartSync}>
          🔥 Sync
        </button>
      </div>
    </div>
  )
}
