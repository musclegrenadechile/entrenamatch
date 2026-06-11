import { Suspense } from 'react'
import { LazyExploreLivePanel, TAB_LOADING } from '../app/LazyTabs'

export type MapExplorePanelMountProps = Record<string, unknown> & {
  dedicatedMapTab: boolean
}

/**
 * Lazy map shell — Leaflet + GymPulseMap load only when map/explore banner mounts.
 */
export function MapExplorePanelMount({ dedicatedMapTab, ...panelProps }: MapExplorePanelMountProps) {
  const panel = (
    <Suspense fallback={TAB_LOADING}>
      <LazyExploreLivePanel
        key={dedicatedMapTab ? 'map-full' : 'explore-live-banner'}
        dedicatedMapTab={dedicatedMapTab}
        {...panelProps}
      />
    </Suspense>
  )

  if (dedicatedMapTab) {
    return (
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative z-10">{panel}</div>
    )
  }

  return <div className="flex-shrink-0 relative z-30">{panel}</div>
}
