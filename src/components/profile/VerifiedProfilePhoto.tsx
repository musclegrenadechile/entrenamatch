import type { ReactNode, SyntheticEvent } from 'react'
import { BadgeCheck } from 'lucide-react'
import {
  isProfileVerified,
  type IdentityVerificationStatus,
} from '../../utils/identityVerification'

export type VerifiedPhotoBadgeSize = 'xs' | 'sm' | 'md' | 'lg'
export type VerifiedPhotoBadgeCorner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

const BADGE_SIZE: Record<VerifiedPhotoBadgeSize, { box: string; icon: number }> = {
  xs: { box: 'w-4 h-4', icon: 10 },
  sm: { box: 'w-5 h-5', icon: 12 },
  md: { box: 'w-7 h-7', icon: 16 },
  lg: { box: 'w-9 h-9', icon: 20 },
}

const BADGE_CORNER: Record<VerifiedPhotoBadgeCorner, string> = {
  'bottom-right': 'bottom-1 right-1',
  'bottom-left': 'bottom-1 left-1',
  'top-right': 'top-1 right-1',
  'top-left': 'top-1 left-1',
}

export type VerifiedProfilePhotoProps = {
  src: string
  alt?: string
  className?: string
  imgClassName?: string
  verificationStatus?: IdentityVerificationStatus
  verified?: boolean
  badgeSize?: VerifiedPhotoBadgeSize
  badgeCorner?: VerifiedPhotoBadgeCorner
  /** Subtle orange ring around the photo frame when verified */
  showRing?: boolean
  children?: ReactNode
  onError?: (e: SyntheticEvent<HTMLImageElement>) => void
}

export function VerifiedProfilePhoto({
  src,
  alt = '',
  className = '',
  imgClassName = 'w-full h-full object-cover',
  verificationStatus,
  verified,
  badgeSize = 'md',
  badgeCorner = 'bottom-right',
  showRing = false,
  children,
  onError,
}: VerifiedProfilePhotoProps) {
  const isVerified = verified ?? isProfileVerified(verificationStatus)
  const badge = BADGE_SIZE[badgeSize]

  return (
    <div
      className={`relative overflow-hidden ${showRing && isVerified ? 'ring-2 ring-[#FF671F]/90 ring-offset-1 ring-offset-black/40' : ''} ${className}`}
    >
      <img src={src} alt={alt} className={imgClassName} onError={onError} />
      {isVerified && (
        <div
          className={`absolute ${BADGE_CORNER[badgeCorner]} z-10 flex items-center justify-center rounded-full bg-[#FF671F] text-black shadow-lg shadow-black/50 ring-2 ring-black/80 ${badge.box}`}
          title="Persona verificada"
          aria-label="Persona verificada"
        >
          <BadgeCheck size={badge.icon} strokeWidth={2.5} aria-hidden />
        </div>
      )}
      {children}
    </div>
  )
}
