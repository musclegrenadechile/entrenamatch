import { X } from 'lucide-react'
import { BRAND_COPY } from '../../../constants/brandCopy'
import type { GymPulsePopupState } from '../gymPulsePopupTypes'
import { GymPulseLivePopup } from './GymPulseLivePopup'
import { GymPulsePartnerCard } from './GymPulsePartnerCard'
import type { SyncRipple } from '../../../services/gymSoundReactions'
import type { GymSoundDisplay } from '../../../types'

export interface GymPulsePopupLayerProps {
  popup: GymPulsePopupState | null
  syncBonds: Record<string, unknown>
  userGymId?: string | null
  isDeveloper?: boolean
  onClose: () => void
  onShowProfile: (user: Record<string, unknown>) => void
  onStartSync: (userId: string, userName: string) => void
  onGymCheckIn: (gym: { id: string; name: string; lat: number; lng: number }) => void
  onPartnerEdit?: (partnerId: string) => void
  onPartnerDelete?: (partnerId: string) => void
  onExpandCluster?: (lat: number, lng: number, clusterId?: number) => void
  selfName?: string
  selfNowPlaying?: GymSoundDisplay | null
  setSyncRipples?: (updater: SyncRipple[] | ((prev: SyncRipple[]) => SyncRipple[])) => void
  onHaptic?: () => void
  inviteReferralCode?: string
}

export function GymPulsePopupLayer({
  popup,
  syncBonds,
  userGymId,
  isDeveloper,
  onClose,
  onShowProfile,
  onStartSync,
  onGymCheckIn,
  onPartnerEdit,
  onPartnerDelete,
  onExpandCluster,
  selfName,
  selfNowPlaying,
  setSyncRipples,
  onHaptic,
  inviteReferralCode,
}: GymPulsePopupLayerProps) {
  if (!popup) return null

  return (
    <>
      <button type="button" className="gym-pulse-popup-backdrop" onClick={onClose} aria-label="Cerrar panel" />
      <div className="gym-pulse-popup-layer" role="dialog" aria-modal="true">
        {popup.kind === 'live' && (
          <GymPulseLivePopup
            user={popup.user}
            isBond={!!syncBonds[String(popup.user.id)]}
            onClose={onClose}
            onShowProfile={() => onShowProfile(popup.user)}
            onStartSync={() => onStartSync(String(popup.user.id), String(popup.user.name || ''))}
            selfName={selfName}
            selfNowPlaying={selfNowPlaying}
            setSyncRipples={setSyncRipples}
            onHaptic={onHaptic}
          />
        )}
        {popup.kind === 'partner' && (
          <GymPulsePartnerCard
            partner={popup.partner}
            liveAtGym={popup.liveAtGym}
            checkedInUsers={popup.checkedInUsers}
            userCheckedInHere={userGymId === popup.partner.id}
            onCheckIn={() =>
              onGymCheckIn({
                id: popup.partner.id,
                name: popup.partner.name,
                lat: popup.partner.lat,
                lng: popup.partner.lng,
              })
            }
            onClose={onClose}
            isDeveloper={isDeveloper}
            onDevEdit={() => onPartnerEdit?.(popup.partner.id)}
            onDevDelete={() => onPartnerDelete?.(popup.partner.id)}
            inviteReferralCode={inviteReferralCode}
          />
        )}
        {popup.kind === 'cluster' && (
          <div className="gym-pulse-cluster-popup">
            <button type="button" className="gym-pulse-live-popup__close" onClick={onClose} aria-label="Cerrar">
              <X size={18} />
            </button>
            <div className="gym-pulse-cluster-popup__count">{popup.count}</div>
            <p><strong>{popup.count} entrenando</strong> en esta zona</p>
            <button
              type="button"
              className="gym-pulse-live-popup__btn gym-pulse-live-popup__btn--sync"
              onClick={() => {
                onExpandCluster?.(popup.lat, popup.lng, popup.clusterId)
                onClose()
              }}
            >
              Acercar mapa
            </button>
          </div>
        )}
        {popup.kind === 'sync' && (
          <div className="gym-pulse-sync-popup">
            <button type="button" className="gym-pulse-live-popup__close" onClick={onClose} aria-label="Cerrar">
              <X size={18} />
            </button>
            {popup.inRed && <span className="gym-pulse-live-popup__bond">⭐ Alianza de sync</span>}
            <strong>{popup.nameA} × {popup.nameB}</strong>
            <p className="gym-pulse-live-popup__live">🔄 EN SYNC{popup.syncMins > 0 ? ` · ${popup.syncMins} min` : ''}</p>
            <p className="gym-pulse-live-popup__sub">{BRAND_COPY.liveMap.tetherSub}</p>
          </div>
        )}
      </div>
    </>
  )
}
