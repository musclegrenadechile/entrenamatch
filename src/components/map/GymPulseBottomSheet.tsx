import { useMemo, useState } from 'react'
import { ChevronUp, MapPin, Star, Zap } from 'lucide-react'
import { sortLiveUsersForSheet, type LiveUserLike } from '../../utils/gymPulseLive'
import { VerifiedProfilePhoto } from '../profile/VerifiedProfilePhoto'

export interface GymPulseBottomSheetProps {
  liveUsers: LiveUserLike[]
  syncBonds: Record<string, { bondLevel?: number; totalMin?: number }>
  selfUserId?: string | null
  joiningSyncWith?: string | null
  expanded?: boolean
  onToggleExpand?: () => void
  onShowProfile: (user: LiveUserLike) => void
  onStartSync: (userId: string, userName: string) => void
  onFlyToUser?: (lat: number, lng: number) => void
}

export function GymPulseBottomSheet({
  liveUsers,
  syncBonds,
  selfUserId,
  joiningSyncWith,
  expanded = true,
  onToggleExpand,
  onShowProfile,
  onStartSync,
  onFlyToUser,
}: GymPulseBottomSheetProps) {
  const [collapsed, setCollapsed] = useState(!expanded)

  const sorted = useMemo(
    () => sortLiveUsersForSheet(liveUsers, syncBonds, selfUserId),
    [liveUsers, syncBonds, selfUserId]
  )

  const toggle = () => {
    setCollapsed((c) => !c)
    onToggleExpand?.()
  }

  if (sorted.length === 0) return null

  return (
    <div
      className={`gym-pulse-bottom-sheet ${collapsed ? 'gym-pulse-bottom-sheet--collapsed' : ''}`}
      role="region"
      aria-label="Atletas en vivo cerca"
    >
      <button type="button" className="gym-pulse-bottom-sheet__handle" onClick={toggle} aria-expanded={!collapsed}>
        <span className="gym-pulse-bottom-sheet__grab" />
        <span className="gym-pulse-bottom-sheet__title">
          {sorted.length} en vivo · ordenado por red y distancia
        </span>
        <ChevronUp size={16} className={`gym-pulse-bottom-sheet__chev ${collapsed ? 'gym-pulse-bottom-sheet__chev--down' : ''}`} />
      </button>

      {!collapsed && (
        <ul className="gym-pulse-bottom-sheet__list">
          {sorted.map((u) => {
            const inNet = !!syncBonds[u.id]
            const minsLive = Math.max(0, Math.floor((Date.now() - (u.trainingNowSince || Date.now())) / 60000))
            return (
              <li key={u.id} className="gym-pulse-bottom-sheet__row">
                <button
                  type="button"
                  className="gym-pulse-bottom-sheet__main"
                  onClick={() => {
                    if (onFlyToUser && Number.isFinite(u.lat) && Number.isFinite(u.lng)) {
                      onFlyToUser(Number(u.lat), Number(u.lng))
                    }
                    onShowProfile(u)
                  }}
                >
                  {u.photos?.[0] ? (
                    <VerifiedProfilePhoto
                      src={u.photos[0]}
                      alt=""
                      className="gym-pulse-bottom-sheet__avatar"
                      imgClassName="gym-pulse-bottom-sheet__avatar w-full h-full object-cover"
                      verificationStatus={u.verificationStatus}
                      badgeSize="xs"
                    />
                  ) : (
                    <div className="gym-pulse-bottom-sheet__avatar gym-pulse-bottom-sheet__avatar--fallback">
                      {(u.name || '?')[0]}
                    </div>
                  )}
                  <div className="gym-pulse-bottom-sheet__meta">
                    <div className="gym-pulse-bottom-sheet__name">
                      {u.name}
                      {inNet && (
                        <span className="gym-pulse-bottom-sheet__bond">
                          <Star size={10} /> RED
                        </span>
                      )}
                    </div>
                    <div className="gym-pulse-bottom-sheet__sub">
                      <MapPin size={10} />
                      {typeof u.distance === 'number' && u.distance < 900
                        ? `${u.distance.toFixed(1)} km`
                        : '— km'}
                      <span>·</span>
                      {u.trainingTypes?.[0] || 'Entreno'}
                      <span>·</span>
                      {minsLive}m live
                      {u.seVaEnMin != null && u.seVaEnMin > 0 && (
                        <span className="gym-pulse-bottom-sheet__urgent"> · ~{u.seVaEnMin}m restantes</span>
                      )}
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  className="gym-pulse-bottom-sheet__sync"
                  disabled={joiningSyncWith === u.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onStartSync(u.id, u.name || 'Atleta')
                  }}
                >
                  <Zap size={14} />
                  {joiningSyncWith === u.id ? '…' : 'Sync'}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
