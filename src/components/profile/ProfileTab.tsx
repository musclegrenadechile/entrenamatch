import type { ReactNode } from 'react'
import { ProfileHeaderSection } from './ProfileHeaderSection'
import { ProfileHeroSection } from './ProfileHeroSection'
import { ProfileHeroPulse } from './ProfileHeroPulse'
import { ProfileMarketplaceEntry } from './ProfileMarketplaceEntry'
import { ProfileTrainerCoachEntry } from './ProfileTrainerCoachEntry'
import { ProfileAdminOpsEntry } from './ProfileAdminOpsEntry'
import { ProfileActividadSection } from './ProfileActividadSection'
import { ProfileRendimientoSection } from './ProfileRendimientoSection'
import { ProfileDailyPulseSection } from './ProfileDailyPulseSection'
import { ProfileSyncNetworkSection } from './ProfileSyncNetworkSection'
import { ProfileMuroSection } from './ProfileMuroSection'
import { ProfileAccountSection } from './ProfileAccountSection'
import { ProfileFooterSection } from './ProfileFooterSection'
import { ProfileCollapsibleSection } from './ProfileCollapsibleSection'
import { isProfileProgressiveMode } from '../../utils/profileProgressive'
import type { ProfileTabProps } from './profileTabTypes'

export type { ProfileTabProps } from './profileTabTypes'

export function ProfileTab(props: ProfileTabProps) {
  const progressive = isProfileProgressiveMode(props.currentUser)

  const advancedWrap = (title: string, subtitle: string, node: ReactNode) =>
    progressive ? (
      <ProfileCollapsibleSection title={title} subtitle={subtitle} defaultOpen={false}>
        {node}
      </ProfileCollapsibleSection>
    ) : (
      node
    )

  return (
    <div className="flex-1 overflow-auto bg-[#0D0D10] pb-28">
      <ProfileHeaderSection {...props} />
      <ProfileHeroSection {...props} />
      <ProfileHeroPulse {...props} />
      {advancedWrap(
        'Tienda y extras',
        'Marketplace, coach y herramientas avanzadas',
        <>
          <ProfileMarketplaceEntry {...props} />
          <ProfileTrainerCoachEntry {...props} />
          <ProfileAdminOpsEntry {...props} />
        </>
      )}
      <ProfileActividadSection {...props} />
      {advancedWrap(
        'Rendimiento y red',
        'Stats, GymPulse diario y alianzas Sync',
        <>
          <ProfileRendimientoSection {...props} />
          <ProfileDailyPulseSection {...props} />
          <ProfileSyncNetworkSection {...props} />
        </>
      )}
      <ProfileMuroSection {...props} />
      <ProfileAccountSection {...props} />
      <ProfileFooterSection {...props} />
    </div>
  )
}
