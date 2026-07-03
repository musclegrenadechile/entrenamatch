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

/** Fase 394 — modal de match extraído de App.tsx. */
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
          className="absolute inset-0 z-[80] flex items-center justify-center bg-black/90 p-6"
          onClick={() => onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="match-modal rounded-3xl max-w-[340px] w-full overflow-hidden border border-[#2F2F35]"
          >
            <div className="p-8 text-center">
              <div className="text-[#FF4F79] font-semibold tracking-[3px] text-sm mb-1">
                {BRAND_COPY.explore.connectCelebration}
              </div>
              <div className="text-3xl font-semibold tracking-tight mb-4">
                Tú y {profile.name} quieren entrenar juntos
              </div>
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
              <div className="text-sm text-[#9CA3AF] mb-4">
                Ambos están en {profile.city}, {profile.country}. ¡Escríbele ya!
              </div>
              {userLocation && (
                <div className="text-[#FF671F] text-sm font-medium -mt-2 mb-4">
                  Están a{' '}
                  {getDistanceKm(
                    userLocation.lat,
                    userLocation.lng,
                    profile.lat,
                    profile.lng
                  )}{' '}
                  km
                </div>
              )}
              {(() => {
                const openers = chatOpeners[profile.id] || [
                  '¡Hola! Vi tu perfil y me tinca entrenar juntos 💪',
                ]
                return (
                  <div className="mb-5 text-left bg-[#1C1C20] rounded-2xl p-3 text-xs">
                    <div className="text-[#FF671F] font-medium mb-1.5 text-center">
                      Sugerencias para romper el hielo (copia y pega):
                    </div>
                    {openers.slice(0, 2).map((opener, idx) => (
                      <div key={idx} className="text-[#cbd5e1] mb-1.5 last:mb-0 leading-snug">
                        • {opener}
                      </div>
                    ))}
                  </div>
                )
              })()}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => onClose(true)}
                  className="btn-primary w-full text-base"
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
