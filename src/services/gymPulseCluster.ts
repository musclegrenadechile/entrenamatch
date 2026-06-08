/**
 * GymPulse Map 2.0 — supercluster (Fase 103).
 */

import Supercluster from 'supercluster'

export type LiveClusterProps = Record<string, unknown> & {
  id: string
  lat: number
  lng: number
  cluster?: boolean
  cluster_id?: number
  point_count?: number
  point_count_abbreviated?: string
}

export type LiveClusterFeature = GeoJSON.Feature<GeoJSON.Point, LiveClusterProps>

const DEFAULT_OPTIONS: Supercluster.Options<LiveClusterProps, LiveClusterProps> = {
  radius: 58,
  maxZoom: 16,
  minZoom: 0,
  minPoints: 2,
}

export function buildLiveClusterIndex(
  users: LiveClusterProps[],
  options?: Partial<Supercluster.Options<LiveClusterProps, LiveClusterProps>>
): Supercluster<LiveClusterProps, LiveClusterProps> {
  const index = new Supercluster<LiveClusterProps, LiveClusterProps>({
    ...DEFAULT_OPTIONS,
    ...options,
  })
  index.load(
    users
      .filter((u) => Number.isFinite(u.lat) && Number.isFinite(u.lng))
      .map((u) => ({
        type: 'Feature',
        properties: { ...u },
        geometry: { type: 'Point', coordinates: [u.lng, u.lat] },
      }))
  )
  return index
}

/** bbox: [west, south, east, north] */
export function getLiveClusters(
  index: Supercluster<LiveClusterProps, LiveClusterProps>,
  bbox: [number, number, number, number],
  zoom: number
): LiveClusterFeature[] {
  return index.getClusters(bbox, Math.floor(zoom)) as LiveClusterFeature[]
}

export function bboxFromLeafletBounds(bounds: {
  getWest: () => number
  getSouth: () => number
  getEast: () => number
  getNorth: () => number
}): [number, number, number, number] {
  return [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]
}
