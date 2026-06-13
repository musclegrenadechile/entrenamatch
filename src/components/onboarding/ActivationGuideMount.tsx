import type { Firestore } from 'firebase/firestore'
import { toast } from 'sonner'
import { buildInviteLink } from '../../utils/appDeepLinks'
import { markActivationGuideComplete } from '../../services/firstStepsProgress'
import { ActivationGuide } from './ActivationGuide'

export type ActivationGuideMountProps = {
  open: boolean
  isLive: boolean
  isDemoMode: boolean
  hasTeam: boolean
  hasPact: boolean
  cityLabel?: string
  effectiveUserId: string
  db: Firestore | null
  firebaseUid?: string | null
  onClose: () => void
  onMarkFeatureTourSeen: () => void
  onDismissDemo: () => void
  onFirstStepsDismissed: () => void
  onNavigateTab: (tab: 'home' | 'explore' | 'map' | 'profile') => void
  onToggleLive: (mode?: 'on' | 'off') => void | Promise<void>
  onOpenPactWizard: () => void
}

/** Fase 384 — post-register activation guide extracted from App.tsx. */
export function ActivationGuideMount({
  open,
  isLive,
  isDemoMode,
  hasTeam,
  hasPact,
  cityLabel,
  effectiveUserId,
  db,
  firebaseUid,
  onClose,
  onMarkFeatureTourSeen,
  onDismissDemo,
  onFirstStepsDismissed,
  onNavigateTab,
  onToggleLive,
  onOpenPactWizard,
}: ActivationGuideMountProps) {
  const finishGuide = (persist: boolean) => {
    onClose()
    onMarkFeatureTourSeen()
    if (isDemoMode) {
      onDismissDemo()
      return
    }
    if (persist && db && firebaseUid) {
      void markActivationGuideComplete(db, firebaseUid).then(onFirstStepsDismissed)
    }
  }

  return (
    <ActivationGuide
      open={open}
      isLive={isLive}
      isDemoMode={isDemoMode}
      hasTeam={hasTeam}
      hasPact={hasPact}
      onClose={() => finishGuide(true)}
      onPrimaryAction={() => {
        finishGuide(true)
        if (isLive) {
          onNavigateTab('map')
        } else {
          void onToggleLive('on')
        }
      }}
      onStep={(step) => {
        if (step === 'profile') onNavigateTab('profile')
        if (step === 'live') void onToggleLive()
        if (step === 'explore') onNavigateTab('explore')
        if (step === 'sync') onNavigateTab('map')
        if (step === 'pact') {
          onNavigateTab('home')
          onOpenPactWizard()
        }
      }}
      onShareInvite={() => {
        const inviteUrl = buildInviteLink(effectiveUserId)
        const inviteText = `Únete a EntrenaMatch — entrena en sync con gente de ${cityLabel || 'tu ciudad'}`
        void (async () => {
          try {
            if (navigator.share) {
              await navigator.share({ title: 'EntrenaMatch', text: inviteText, url: inviteUrl })
            } else {
              await navigator.clipboard.writeText(`${inviteText}\n${inviteUrl}`)
              toast.success('Invitación copiada')
            }
          } catch {
            toast.error('No se pudo compartir')
          }
        })()
      }}
    />
  )
}
