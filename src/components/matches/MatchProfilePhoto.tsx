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
}

export function MatchProfilePhoto({ profile, className = 'w-full aspect-square' }: MatchProfilePhotoProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const photo = primaryProfilePhoto(profile.photos)
  const showPhoto = !!photo && !imgFailed
  const label = displayMatchName(profile)
  const initial = label.charAt(0).toUpperCase() || '?'
  const verified = isProfileVerified(profile.verificationStatus)

  if (!showPhoto || !hasDisplayableMatchPhoto(profile.photos)) {
    return (
      <div
        className={`relative ${className} bg-gradient-to-br from-[#2a2a32] via-[#1C1C20] to-[#141418] flex items-center justify-center`}
        aria-hidden
      >
        <span className="text-4xl font-black text-[#FF671F]/75">{initial}</span>
        <User className="absolute bottom-3 right-3 w-8 h-8 text-white/10" aria-hidden />
        {verified && <VerifiedPhotoBadge size="md" corner="top-left" className="top-2 left-2" />}
      </div>
    )
  }

  return (
    <VerifiedProfilePhoto
      src={photo}
      alt=""
      className={className}
      imgClassName="w-full aspect-square object-cover"
      verificationStatus={profile.verificationStatus}
      showBadge={false}
      onError={() => setImgFailed(true)}
    />
  )
}
