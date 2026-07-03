import { Compass, Edit2, Radio } from 'lucide-react'
import { toast } from 'sonner'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'
import { VerifiedPhotoBadge, VerifiedProfilePhoto } from './VerifiedProfilePhoto'
import { cityChampionLabel } from '../../utils/genderedCopy'
import { isProfileVerified } from '../../utils/identityVerification'
import { DerbyDefenderBadge } from '../home/DerbyDefenderBadge'
import { COMMUNITY_ADMIN_BADGE_LABEL } from '../../utils/appAdmin'
import { primaryProfilePhoto } from '../../utils/profilePhotos'

/** Oleada 349 — tarjeta de atleta compacta con stats y CTAs LIVE / Explorar. */
export function ProfileHeroSection(props: ProfileTabProps) {
  const p = profileTabBindings(props)
  const {
    currentUser,
    networkStats,
    syncBonds,
    openProfileEditor,
    saveUserWithRealSync,
    setMapForceTick,
    setActiveTab,
    setShowLiveModal,
    triggerHaptic,
    toggleLiveTraining,
    isTogglingLive,
  } = p

  const heroPhoto = primaryProfilePhoto(currentUser.photos)
  const live = !!currentUser.trainingNow
  const streak = currentUser.liveStreak || 0
  const ghost = !!currentUser.ghostMode
  const bondCount = Object.keys(syncBonds || {}).length
  const networkPower = networkStats?.networkPower || 0

  const toggleLive = async () => {
    try {
      triggerHaptic('medium')
      if (live) {
        await toggleLiveTraining('off')
      } else {
        await toggleLiveTraining('on')
      }
    } catch {
      toast.error('No se pudo actualizar Live')
    }
  }

  const toggleGhost = async () => {
    try {
      triggerHaptic('light')
      const next = !ghost
      await saveUserWithRealSync({ ...currentUser, ghostMode: next } as typeof currentUser)
      toast(next ? 'Modo fantasma ON (~500 m)' : 'Ubicación exacta en mapa')
      setMapForceTick((t) => t + 1)
    } catch {
      toast.error('No se pudo cambiar modo fantasma')
    }
  }

  return (
    <div className="em-v2-profile-hero px-4 pt-3 pb-2">
      <div className="em-v2-profile-hero__card">
        <div className="em-v2-profile-hero__media">
          {heroPhoto ? (
            <VerifiedProfilePhoto
              src={heroPhoto}
              className="em-v2-profile-hero__photo-wrap"
              imgClassName="em-v2-profile-hero__photo"
              verificationStatus={currentUser.verificationStatus}
              showBadge={false}
              showRing
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="em-v2-profile-hero__photo-placeholder" aria-hidden>
              <span className="text-2xl">🏋️</span>
            </div>
          )}
          {isProfileVerified(currentUser.verificationStatus) && (
            <VerifiedPhotoBadge size="sm" corner="bottom-right" className="bottom-1 right-1" />
          )}
        </div>

        <div className="em-v2-profile-hero__body">
          <div className="em-v2-profile-hero__name-row">
            <h2 className="em-v2-profile-hero__name">{currentUser.name}</h2>
            {p.appAdminRecord && (
              <span className="em-v2-profile-hero__admin-badge">
                {p.appAdminRecord.displayLabel || COMMUNITY_ADMIN_BADGE_LABEL}
              </span>
            )}
            <button
              type="button"
              onClick={openProfileEditor}
              className="em-v2-profile-hero__edit"
              aria-label="Editar perfil"
            >
              <Edit2 size={13} />
            </button>
          </div>

          <p className="em-v2-profile-hero__meta">
            {currentUser.age} · {currentUser.city}, {currentUser.country}
            <span className="em-v2-profile-hero__level"> · {currentUser.level}</span>
          </p>

          <div className="em-v2-profile-hero__badges">
            {(() => {
              try {
                const key = `entrenamatch_city_done_${new Date().getFullYear()}_w_${currentUser.city}`
                if (
                  localStorage.getItem(key)
                  || localStorage.getItem(`entrenamatch_city_badge_${currentUser.city}`)
                ) {
                  return (
                    <span className="em-v2-profile-hero__chip em-v2-profile-hero__chip--gold">
                      🌆 {cityChampionLabel(currentUser.gender, currentUser.city)}
                    </span>
                  )
                }
              } catch { /* ignore */ }
              return null
            })()}
            <DerbyDefenderBadge city={currentUser.city} gender={currentUser.gender} />
          </div>

          <div className="em-v2-profile-hero__stats">
            <div className="em-v2-profile-hero__stat">
              <span className="em-v2-profile-hero__stat-val em-v2-profile-hero__stat-val--gold">
                {networkPower}
              </span>
              <span className="em-v2-profile-hero__stat-label">FE</span>
            </div>
            <div className="em-v2-profile-hero__stat">
              <span className="em-v2-profile-hero__stat-val em-v2-profile-hero__stat-val--live">
                {bondCount}
              </span>
              <span className="em-v2-profile-hero__stat-label">Alianzas</span>
            </div>
            <div className="em-v2-profile-hero__stat">
              <span className="em-v2-profile-hero__stat-val em-v2-profile-hero__stat-val--brand">
                {currentUser.photos?.length || 0}
              </span>
              <span className="em-v2-profile-hero__stat-label">Fotos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="em-v2-profile-hero__pulse">
        <button
          type="button"
          disabled={isTogglingLive}
          onClick={() => void toggleLive()}
          className={`em-v2-profile-hero__live-btn${live ? ' em-v2-profile-hero__live-btn--on' : ''}`}
        >
          <Radio size={14} aria-hidden />
          {live ? `LIVE · ${streak}d` : 'Ir LIVE'}
        </button>
        <button
          type="button"
          onClick={() => void toggleGhost()}
          className={`em-v2-profile-hero__ghost-btn${ghost ? ' em-v2-profile-hero__ghost-btn--on' : ''}`}
          aria-pressed={ghost}
        >
          {ghost ? '👻 Fantasma' : 'Pin exacto'}
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('explore')
            setShowLiveModal(true)
          }}
          className="em-v2-profile-hero__cta em-v2-profile-hero__cta--explore"
        >
          <Compass size={14} aria-hidden />
          Explorar
        </button>
      </div>
    </div>
  )
}