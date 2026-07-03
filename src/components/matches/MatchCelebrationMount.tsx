import { AnimatePresence, motion } from 'framer-motion'
import { VerifiedProfilePhoto } from '../profile/VerifiedProfilePhoto'
import { BRAND_COPY } from '../../constants/brandCopy'
import type { CurrentUser, Profile } from '../../types'
import { getDistanceKm } from '../../utils'

export type MatchCelebrationMountProps = {
  profile: Profile | null
  currentUser: CurrentUser | null
  userLocation: { lat: number; lng: number } | null
  chatOpeners: Record<string, string[]>
  onClose: (openChat?: boolean) => void
}

/** Fase 394 — modal de match (oleada 353 v2). */
export function MatchCelebrationMount({
  profile,
  currentUser,
  userLocation,
  chatOpeners,
  onClose,
}: MatchCelebrationMountProps) {
  return (
    <AnimatePresence>
      {profile && (
        <div
          className="em-v2-match-celebration absolute inset-0 z-[80] flex items-center justify-center p-6"
          onClick={() => onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="em-v2-match-celebration__card max-w-[340px] w-full overflow-hidden"
          >
            <div className="p-8 text-center">
              <p className="em-v2-match-celebration__kicker">
                {BRAND_COPY.explore.connectCelebration}
              </p>
              <h2 className="em-v2-match-celebration__title">
                Tú y {profile.name} quieren entrenar juntos
              </h2>
              <div className="flex justify-center -space-x-4 mb-6">
                <VerifiedProfilePhoto
                  src={currentUser?.photos?.[0] || 'https://picsum.photos/id/1005/80/80'}
                  className="w-20 h-20 rounded-full border-4 border-[#1C1C20] z-10"
                  imgClassName="w-full h-full rounded-full object-cover"
                  verificationStatus={currentUser?.verificationStatus}
                  badgeSize="sm"
                />
                <VerifiedProfilePhoto
                  src={profile.photos[0]}
                  className="w-20 h-20 rounded-full border-4 border-[#1C1C20]"
                  imgClassName="w-full h-full rounded-full object-cover"
                  verificationStatus={profile.verificationStatus}
                  badgeSize="sm"
                />
              </div>
              <p className="text-sm text-[#9CA3AF] mb-4">
                Ambos están en {profile.city}, {profile.country}. ¡Escríbele ya!
              </p>
              {userLocation && (
                <p className="text-[#FF671F] text-sm font-medium -mt-2 mb-4">
                  Están a{' '}
                  {getDistanceKm(
                    userLocation.lat,
                    userLocation.lng,
                    profile.lat,
                    profile.lng
                  )}{' '}
                  km
                </p>
              )}
              {(() => {
                const openers = chatOpeners[profile.id] || [
                  '¡Hola! Vi tu perfil y me tinca entrenar juntos 💪',
                ]
                return (
                  <div className="em-v2-match-celebration__openers mb-5 text-left text-xs">
                    <p className="text-[#FF671F] font-medium mb-1.5 text-center">
                      Sugerencias para romper el hielo:
                    </p>
                    {openers.slice(0, 2).map((opener, idx) => (
                      <p key={idx} className="text-[#cbd5e1] mb-1.5 last:mb-0 leading-snug">
                        • {opener}
                      </p>
                    ))}
                  </div>
                )
              })()}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => onClose(true)}
                  className="em-v2-hero-card__cta w-full"
                >
                  Enviar mensaje ahora
                </button>
                <button
                  type="button"
                  onClick={() => onClose(false)}
                  className="w-full py-3 text-sm text-[#9CA3AF]"
                >
                  Seguir explorando
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}