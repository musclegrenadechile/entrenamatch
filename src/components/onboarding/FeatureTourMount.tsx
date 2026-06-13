import { AppFeatureTour, markAppFeatureTourSeen } from './AppFeatureTour'

export type FeatureTourMountProps = {
  open: boolean
  onClose: () => void
  onGoToTab: (tab: 'home' | 'map' | 'explore' | 'red') => void
}

/** Fase 391 — primer tour de la app extraído de App.tsx. */
export function FeatureTourMount({ open, onClose, onGoToTab }: FeatureTourMountProps) {
  return (
    <AppFeatureTour
      open={open}
      onClose={() => {
        markAppFeatureTourSeen()
        onClose()
      }}
      onGoToStep={(stepId) => {
        const tab =
          stepId === 'home'
            ? 'home'
            : stepId === 'map'
              ? 'map'
              : stepId === 'explore'
                ? 'explore'
                : 'red'
        onGoToTab(tab)
      }}
    />
  )
}

export { markAppFeatureTourSeen }
