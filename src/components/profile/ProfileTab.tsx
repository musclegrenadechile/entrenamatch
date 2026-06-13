import type { ReactNode } from 'react'
import { BRAND_COPY } from '../../constants/brandCopy'
import { ProfileHeaderSection } from './ProfileHeaderSection'
import { ProfileHeroSection } from './ProfileHeroSection'
import { ProfileHeroPulse } from './ProfileHeroPulse'
import { ProfileMarketplaceEntry } from './ProfileMarketplaceEntry'
import { ProfileTrainerCoachEntry } from './ProfileTrainerCoachEntry'
import { ProfileAdminOpsEntry } from './ProfileAdminOpsEntry'
import { ProfileCommunityAdminEntry } from './ProfileCommunityAdminEntry'
import { ProfileActividadSection } from './ProfileActividadSection'
import { ProfileWearableSection } from './ProfileWearableSection'
import { ProfileRendimientoSection } from './ProfileRendimientoSection'
import { ProfileDailyPulseSection } from './ProfileDailyPulseSection'
import { ProfileSyncNetworkSection } from './ProfileSyncNetworkSection'
import { ProfileMuroSection } from './ProfileMuroSection'
import { ProfileAccountSection } from './ProfileAccountSection'
import { ProfileFooterSection } from './ProfileFooterSection'
import { ProfileCollapsibleSection } from './ProfileCollapsibleSection'
import { TrainingNetworkGraph } from './TrainingNetworkGraph'
import { isProfileProgressiveMode } from '../../utils/profileProgressive'
import { isMonetizationUnlocked } from '../../utils/pilotFeatureFlags'
import type { ProfileTabProps } from './profileTabTypes'

export type { ProfileTabProps } from './profileTabTypes'

export function ProfileTab(props: ProfileTabProps) {
  const progressive = isProfileProgressiveMode(props.currentUser)
  const monetization = isMonetizationUnlocked(props.currentUser, {
    syncSessionCount: Object.keys(props.syncBonds || {}).length,
  })
  const bondEntries = Object.entries(props.syncBonds || {})
  const livePartnerIds = (props.liveTrainingNow || [])
    .filter((u) => props.syncBonds?.[u.id])
    .map((u) => u.id)

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
      <ProfileCommunityAdminEntry {...props} />
      <ProfileHeroSection {...props} />
      <ProfileHeroPulse {...props} />
      <ProfileWearableSection {...props} />
      {bondEntries.length > 0 && (
        <div className="mx-4 mb-3">
          <TrainingNetworkGraph
            compact
            selfName={props.currentUser.name || 'Tú'}
            networkPower={props.networkStats?.networkPower ?? 0}
            livePartnerIds={livePartnerIds}
            bonds={bondEntries.map(([id, b]) => {
              const p = [...(props.realProfiles || []), ...(props.SEED_PROFILES || [])].find(
                (pp) => pp.id === id
              )
              return {
                id,
                name: p?.name || 'Socio',
                bondLevel: b.bondLevel || 1,
                totalMin: b.totalMin || 0,
              }
            })}
          />
        </div>
      )}
      {monetization &&
        advancedWrap(
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
        BRAND_COPY.profile.tabSummary,
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
