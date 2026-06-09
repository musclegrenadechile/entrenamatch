import type { ReactNode, SyntheticEvent } from 'react'
import { BadgeCheck } from 'lucide-react'
import {
  isProfileVerified,
  type IdentityVerificationStatus,
} from '../../utils/identityVerification'

export type VerifiedPhotoBadgeSize = 'xs' | 'sm' | 'md' | 'lg'
export type VerifiedPhotoBadgeCorner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

const BADGE_SIZE: Record<VerifiedPhotoBadgeSize, { box: string; icon: number }> = {
  xs: { box: 'w-5 h-5', icon: 11 },
  sm: { box: 'w-6 h-6', icon: 13 },
  md: { box: 'w-8 h-8', icon: 17 },
  lg: { box: 'w-10 h-10', icon: 22 },
}

const BADGE_CORNER: Record<VerifiedPhotoBadgeCorner, string> = {
  'bottom-right': 'bottom-1.5 right-1.5',
  'bottom-left': 'bottom-1.5 left-1.5',
  'top-right': 'top-1.5 right-1.5',
  'top-left': 'top-1.5 left-1.5',
}

export type VerifiedPhotoBadgeProps = {
  size?: VerifiedPhotoBadgeSize
  corner?: VerifiedPhotoBadgeCorner
  className?: string
}

/** Standalone badge — place as last child inside a `relative` container (above gradients). */
export function VerifiedPhotoBadge({
  size = 'md',
  corner = 'bottom-right',
  className = '',
}: VerifiedPhotoBadgeProps) {
  const badge = BADGE_SIZE[size]
  return (
    <div
      className={`absolute ${BADGE_CORNER[corner]} z-[60] flex items-center justify-center rounded-full bg-[#FF671F] text-black shadow-lg shadow-black/60 ring-2 ring-white/90 ${badge.box} ${className}`}
      title="Persona verificada"
      aria-label="Persona verificada"
    >
      <BadgeCheck size={badge.icon} strokeWidth={2.5} aria-hidden />
    </div>
  )
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
  /** Render check overlay on the photo (disable when parent renders VerifiedPhotoBadge on top). */
  showBadge?: boolean
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
  showBadge = true,
  showRing = false,
  children,
  onError,
}: VerifiedProfilePhotoProps) {
  const isVerified = verified ?? isProfileVerified(verificationStatus)

  return (
    <div
      className={`relative ${showRing && isVerified ? 'ring-2 ring-[#FF671F]/90 ring-offset-1 ring-offset-black/40' : ''} ${className}`}
    >
      <img src={src} alt={alt} className={imgClassName} onError={onError} />
      {children}
      {showBadge && isVerified && (
        <VerifiedPhotoBadge size={badgeSize} corner={badgeCorner} />
      )}
    </div>
  )
}
