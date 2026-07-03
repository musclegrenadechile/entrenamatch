import { memo, useEffect, useRef } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
  type PanInfo,
} from 'framer-motion'
import { CheckCircle, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile } from '../../types'
import { VerifiedPhotoBadge } from '../profile/VerifiedProfilePhoto'
import { MatchProfilePhoto } from '../matches/MatchProfilePhoto'
import { displayMatchName } from '../../utils/matchProfileDisplay'
import { isProfileVerified } from '../../utils/identityVerification'

import { resolveExploreSwipeDirection } from './exploreSwipeLogic'
const EXIT_X = 420

export type ExploreSwipeCardProps = {
  profile: Profile
  stackIndex: number
  isInteractive: boolean
  buttonExit: 'left' | 'right' | null
  onButtonExitHandled: () => void
  onSwipe: (direction: 'left' | 'right', profileId: string) => void
  onShowProfile?: (profile: Profile) => void
  onReport?: (profileId: string) => void
  compat: number | null
  dist: number | null
  verified: boolean
  isRealProfile: boolean
  isDemoSeed: boolean
  isNetwork: boolean
  bondMinutes: number
  compatReasons: string[]
  muroTeaser: string | null
  hasUserLocation: boolean
  stackPromoting: boolean
}

function runExit(x: MotionValue<number>, direction: 'left' | 'right', onDone: () => void) {
  const target = direction === 'left' ? -EXIT_X : EXIT_X
  void animate(x, target, {
    duration: 0.2,
    ease: [0.32, 0.72, 0, 1],
  }).then(onDone)
}

export const ExploreSwipeCard = memo(function ExploreSwipeCard({
  profile,
  stackIndex,
  isInteractive,
  buttonExit,
  onButtonExitHandled,
  onSwipe,
  onShowProfile,
  onReport,
  compat,
  dist,
  verified,
  isRealProfile,
  isDemoSeed,
  isNetwork,
  bondMinutes,
  compatReasons,
  muroTeaser,
  hasUserLocation,
  stackPromoting,
}: ExploreSwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-280, 280], [-16, 16])
  const likeOpacity = useTransform(x, [20, 120], [0, 0.55])
  const passOpacity = useTransform(x, [-120, -20], [0.55, 0])
  const exitingRef = useRef(false)

  const scale = stackIndex === 0 ? 1 : stackIndex === 1 ? 0.96 : 0.92
  const yOffset = stackIndex === 0 ? 0 : stackIndex === 1 ? 10 : 20
  const opacity = stackIndex === 0 ? 1 : stackIndex === 1 ? 0.88 : 0.62
  const z = 30 - stackIndex

  // Button exit: parent only passes buttonExit to stackIndex 0. Do not gate on isInteractive —
  // ExploreTab sets swipeBusy when buttonExit fires, which would flip isInteractive false before this runs.
  useEffect(() => {
    if (!buttonExit || exitingRef.current) return
    exitingRef.current = true
    runExit(x, buttonExit, () => {
      onSwipe(buttonExit, profile.id)
      x.set(0)
      exitingRef.current = false
      onButtonExitHandled()
    })
  }, [buttonExit, onButtonExitHandled, onSwipe, profile.id, x])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!isInteractive || exitingRef.current) return
    const direction = resolveExploreSwipeDirection(info.offset.x, info.velocity.x)

    if (!direction) {
      void animate(x, 0, { type: 'spring', stiffness: 520, damping: 38 })
      return
    }

    exitingRef.current = true
    runExit(x, direction, () => {
      onSwipe(direction, profile.id)
      x.set(0)
      exitingRef.current = false
    })
  }

  return (
    <motion.div
      className="em-v2-swipe-card swipe-card absolute left-0 right-0 mx-auto w-full cursor-grab active:cursor-grabbing h-[min(40dvh,340px)] sm:h-[min(44dvh,380px)]"
      style={{ zIndex: z, x, rotate, touchAction: 'none' }}
      initial={false}
      animate={{ scale, y: yOffset, opacity }}
      drag={isInteractive ? 'x' : false}
      dragConstraints={{ left: -300, right: 300 }}
      dragElastic={0.12}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      whileTap={isInteractive ? { scale: 1.01 } : undefined}
      transition={
        stackPromoting
          ? { duration: 0.16, ease: [0.25, 0.8, 0.25, 1] }
          : { type: 'spring', stiffness: 420, damping: 34 }
      }
    >
      <MatchProfilePhoto profile={profile} variant="cover" />

      <div className="em-v2-swipe-card__gradient-top absolute inset-0 pointer-events-none z-[1]" />
      <div className="em-v2-swipe-card__gradient-bottom absolute inset-x-0 bottom-0 h-[55%] pointer-events-none z-[1]" />

      {isInteractive && (
        <>
          <motion.div
            className="absolute inset-0 rounded-3xl bg-[#22c55e]/25 pointer-events-none z-[2]"
            style={{ opacity: likeOpacity }}
          />
          <motion.div
            className="absolute inset-0 rounded-3xl bg-red-500/25 pointer-events-none z-[2]"
            style={{ opacity: passOpacity }}
          />
        </>
      )}

      {isProfileVerified(profile.verificationStatus) && (
        <VerifiedPhotoBadge size="md" corner="bottom-right" className="bottom-28 right-3" />
      )}

      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2 pointer-events-none z-20">
        <div className="flex flex-col gap-1 min-w-0 pointer-events-auto">
          {isDemoSeed && <span className="em-v2-badge em-v2-badge--muted">DEMO</span>}
          {isRealProfile && verified && (
            <span className="em-v2-badge em-v2-badge--verified">
              <CheckCircle size={11} /> VERIFICADO
            </span>
          )}
          {profile.trainingNow && <span className="em-v2-badge em-v2-badge--live">LIVE</span>}
          {profile.intensity && (
            <span className="em-v2-badge em-v2-badge--muted">{profile.intensity}</span>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0 pointer-events-auto">
          {onReport && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReport(profile.id)
              }}
              className="em-v2-badge em-v2-badge--muted active:opacity-90"
              aria-label="Reportar perfil"
              title="Reportar perfil"
            >
              ⚠ Reportar
            </button>
          )}
          {dist !== null ? (
            <span className="em-v2-badge em-v2-badge--muted">
              <MapPin size={11} /> {dist} km
            </span>
          ) : !hasUserLocation ? (
            <span className="em-v2-badge em-v2-badge--muted text-[#60a5fa]">GPS → km</span>
          ) : null}
        </div>
      </div>

      <div className="em-v2-swipe-panel absolute bottom-0 left-0 right-0 z-10 p-4 pb-3.5 text-white pt-12">
        <div className="flex items-end justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <div className="text-xl sm:text-[1.65rem] font-extrabold tracking-tight flex items-center gap-1.5 min-w-0 leading-none">
              <span className="truncate">{displayMatchName(profile)}</span>
              <span className="shrink-0 text-white/85 font-bold">, {profile.age}</span>
              {verified && <CheckCircle size={17} className="text-[#FF671F] shrink-0" />}
            </div>
            {isNetwork && (
              <span className="em-v2-badge em-v2-badge--network mt-1.5">
                ⭐ En tu red
                {bondMinutes > 0 ? ` · ${bondMinutes}m` : ''}
              </span>
            )}
            <div className="text-[11px] font-semibold text-white/80 flex items-center gap-2 mt-1 truncate">
              <span className="truncate">{profile.city}</span>
              {profile.availableToday && (
                <span className="em-v2-badge em-v2-badge--live shrink-0 py-0.5">HOY</span>
              )}
            </div>
          </div>

          {compat !== null && (
            <div className="em-v2-match-ring shrink-0">
              <span className="em-v2-match-score">{compat}</span>
              <span className="em-v2-match-label">CONECTAR</span>
              <div className="em-v2-match-bar">
                <div className="em-v2-match-bar__fill" style={{ width: `${compat}%` }} />
              </div>
              {compatReasons.length > 0 && (
                <span className="text-[10px] font-semibold text-[#FF671F]/90 mt-1 max-w-[7rem] truncate text-right">
                  {compatReasons[0]}
                </span>
              )}
            </div>
          )}
        </div>

        <p className="text-[13px] leading-snug text-white/92 line-clamp-2 mb-2 font-medium">
          {profile.bio}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {profile.trainingTypes.slice(0, 2).map((t) => (
            <span key={t} className="em-v2-tag">
              {t}
            </span>
          ))}
          {profile.goals.slice(0, 2).map((g) => (
            <span key={g} className="em-v2-tag em-v2-tag--goal">
              {g}
            </span>
          ))}
        </div>

        {muroTeaser && (
          <div
            onClick={(e) => {
              e.stopPropagation()
              onShowProfile?.(profile)
            }}
            className="em-v2-muro-teaser mb-1.5 line-clamp-1"
          >
            <span className="text-[#FF671F] shrink-0">📝</span>
            <span className="truncate">{muroTeaser}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 text-[10px] text-white/70 font-semibold">
          <span className="truncate">{profile.availability.slice(0, 2).join(' · ')}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (onShowProfile) onShowProfile(profile)
              else toast.info('Ver perfil completo')
            }}
            className="em-v2-badge em-v2-badge--muted shrink-0 active:opacity-90"
          >
            Perfil →
          </button>
        </div>
      </div>
    </motion.div>
  )
})
