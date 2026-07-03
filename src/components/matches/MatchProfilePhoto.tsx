import { useState } from 'react'
import { User } from 'lucide-react'
import type { Profile } from '../../types'
import { displayMatchName, hasDisplayableMatchPhoto } from '../../utils/matchProfileDisplay'
import { primaryProfilePhoto } from '../../utils/profilePhotos'
import { VerifiedPhotoBadge, VerifiedProfilePhoto } from '../profile/VerifiedProfilePhoto'
import { isProfileVerified } from '../../utils/identityVerification'

export interface MatchProfilePhotoProps {
  profile: Profile
  className?: string
  /** `square` for match grid; `cover` for explore swipe / full-bleed cards */
  variant?: 'square' | 'cover'
  imgClassName?: string
}

export function MatchProfilePhoto({
  profile,
  className,
  variant = 'square',
  imgClassName,
}: MatchProfilePhotoProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const photo = primaryProfilePhoto(profile.photos)
  const showPhoto = !!photo && !imgFailed
  const label = displayMatchName(profile)
  const initial = label.charAt(0).toUpperCase() || '?'
  const verified = isProfileVerified(profile.verificationStatus)
  const isCover = variant === 'cover'
  const frameClass =
    className ?? (isCover ? 'absolute inset-0 w-full h-full' : 'w-full aspect-square')
  const imageClass =
    imgClassName ??
    (isCover
      ? 'w-full h-full object-cover object-[center_20%] bg-[#1C1C20]'
      : 'w-full aspect-square object-cover')

  if (!showPhoto || !hasDisplayableMatchPhoto(profile.photos)) {
    return (
      <div
        className={`relative ${frameClass} bg-gradient-to-br from-[#2a2a32] via-[#1C1C20] to-[#141418] flex items-center justify-center`}
        aria-hidden
      >
        <span
          className={`font-black text-[#FF671F]/75 ${isCover ? 'text-6xl sm:text-7xl' : 'text-4xl'}`}
        >
          {initial}
        </span>
        <User
          className={`absolute text-white/10 ${isCover ? 'bottom-8 right-8 w-12 h-12' : 'bottom-3 right-3 w-8 h-8'}`}
          aria-hidden
        />
        {verified && <VerifiedPhotoBadge size="md" corner="top-left" className="top-2 left-2" />}
      </div>
    )
  }

  return (
    <VerifiedProfilePhoto
      src={photo}
      alt=""
      className={frameClass}
      imgClassName={imageClass}
      verificationStatus={profile.verificationStatus}
      showBadge={false}
      onError={() => setImgFailed(true)}
    />
  )
}
