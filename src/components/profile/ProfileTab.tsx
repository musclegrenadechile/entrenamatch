import { ProfileHeaderSection } from './ProfileHeaderSection'
import { ProfileHeroSection } from './ProfileHeroSection'
import { ProfileMarketplaceEntry } from './ProfileMarketplaceEntry'
import { ProfileActividadSection } from './ProfileActividadSection'
import { ProfileRendimientoSection } from './ProfileRendimientoSection'
import { ProfileDailyPulseSection } from './ProfileDailyPulseSection'
import { ProfileSyncNetworkSection } from './ProfileSyncNetworkSection'
import { ProfileMuroSection } from './ProfileMuroSection'
import { ProfileAccountSection } from './ProfileAccountSection'
import { ProfileFooterSection } from './ProfileFooterSection'
import type { ProfileTabProps } from './profileTabTypes'

export type { ProfileTabProps } from './profileTabTypes'

export function ProfileTab(props: ProfileTabProps) {
  return (
    <div className="flex-1 overflow-auto bg-[#0D0D10] pb-28">
      <ProfileHeaderSection {...props} />
      <ProfileHeroSection {...props} />
      <ProfileMarketplaceEntry {...props} />
      <ProfileActividadSection {...props} />
      <ProfileRendimientoSection {...props} />
      <ProfileDailyPulseSection {...props} />
      <ProfileSyncNetworkSection {...props} />
      <ProfileMuroSection {...props} />
      <ProfileAccountSection {...props} />
      <ProfileFooterSection {...props} />
    </div>
  )
}
