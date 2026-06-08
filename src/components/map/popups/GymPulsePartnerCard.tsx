import { MapPin, Navigation, QrCode, X } from 'lucide-react'
import type { PartnerLocation } from '../../types'
import { openMapsNavigation } from '../../../utils/gymPulseNavigation'

export interface GymPulsePartnerCardProps {
  partner: PartnerLocation
  liveAtGym: number
  checkedInUsers: Array<{ id: string; name?: string; photos?: string[] }>
  userCheckedInHere: boolean
  distanceKm?: number | null
  isDeveloper?: boolean
  onCheckIn: () => void
  onClose: () => void
  onDevEdit?: () => void
  onDevDelete?: () => void
}

export function GymPulsePartnerCard({
  partner,
  liveAtGym,
  checkedInUsers,
  userCheckedInHere,
  distanceKm,
  isDeveloper,
  onCheckIn,
  onClose,
  onDevEdit,
  onDevDelete,
}: GymPulsePartnerCardProps) {
  const logo = partner.logoUrl || partner.logo

  return (
    <div className="gym-pulse-partner-card">
      <button type="button" className="gym-pulse-partner-card__close" onClick={onClose} aria-label="Cerrar">
        <X size={18} />
      </button>

      <div className="gym-pulse-partner-card__hero">
        {logo ? (
          <img src={logo} alt="" className="gym-pulse-partner-card__logo" />
        ) : (
          <div className="gym-pulse-partner-card__logo gym-pulse-partner-card__logo--fallback">🏋️</div>
        )}
        <div className="gym-pulse-partner-card__head">
          <h3>{partner.name}</h3>
          <p>
            {partner.type || 'Partner'}
            {partner.address || partner.city ? ` · ${partner.address || partner.city}` : ''}
          </p>
          {distanceKm != null && (
            <span className="gym-pulse-partner-card__dist">{distanceKm.toFixed(1)} km de ti</span>
          )}
        </div>
      </div>

      {partner.promoLabel && (
        <div className="gym-pulse-partner-card__promo">
          <strong>{partner.promoLabel}</strong>
          {partner.promoCode && (
            <span className="gym-pulse-partner-card__code">{partner.promoCode}</span>
          )}
        </div>
      )}

      <div className="gym-pulse-partner-card__live">
        {liveAtGym > 0 ? (
          <>
            <span className="gym-pulse-partner-card__live-dot" />
            <strong>{liveAtGym} entrenando aquí ahora</strong>
            <div className="gym-pulse-partner-card__avatars">
              {checkedInUsers.slice(0, 5).map((u) =>
                u.photos?.[0] ? (
                  <img key={u.id} src={u.photos[0]} alt="" title={u.name} />
                ) : (
                  <span key={u.id} title={u.name}>
                    {(u.name || '?')[0]}
                  </span>
                )
              )}
            </div>
          </>
        ) : (
          <span className="gym-pulse-partner-card__live-empty">Sé el primero en aparecer aquí en vivo</span>
        )}
      </div>

      <div className="gym-pulse-partner-card__actions">
        <button
          type="button"
          className="gym-pulse-partner-card__btn gym-pulse-partner-card__btn--primary"
          onClick={onCheckIn}
        >
          <MapPin size={14} />
          {userCheckedInHere ? '✓ Check-in activo' : 'Check-in aquí'}
        </button>
        <button
          type="button"
          className="gym-pulse-partner-card__btn"
          onClick={() => openMapsNavigation(partner.lat, partner.lng, partner.name)}
        >
          <Navigation size={14} />
          Cómo llegar
        </button>
      </div>

      {partner.promoCode && (
        <div className="gym-pulse-partner-card__qr-hint">
          <QrCode size={14} />
          Muestra en recepción: <strong>{partner.promoCode}</strong>
        </div>
      )}

      {isDeveloper && (
        <div className="gym-pulse-partner-card__dev">
          <button type="button" onClick={onDevEdit}>Editar</button>
          <button type="button" onClick={onDevDelete} className="gym-pulse-partner-card__dev-del">
            Borrar
          </button>
        </div>
      )}
    </div>
  )
}
