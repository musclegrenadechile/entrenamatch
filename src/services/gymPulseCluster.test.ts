import { describe, expect, it } from 'vitest'
import { buildLiveClusterIndex, getLiveClusters } from './gymPulseCluster'

describe('gymPulseCluster (fase 78)', () => {
  it('clusters nearby live users at low zoom', () => {
    const index = buildLiveClusterIndex([
      { id: 'a', lat: -33.02, lng: -71.55 },
      { id: 'b', lat: -33.021, lng: -71.551 },
      { id: 'c', lat: -34.5, lng: -71.0 },
    ])
    const bbox: [number, number, number, number] = [-72, -35, -71, -33]
    const atLowZoom = getLiveClusters(index, bbox, 10)
    const cluster = atLowZoom.find((f) => f.properties.cluster)
    expect(cluster?.properties.point_count).toBeGreaterThanOrEqual(2)
  })

  it('expands to individual pins at high zoom', () => {
    const index = buildLiveClusterIndex([
      { id: 'a', lat: -33.02, lng: -71.55 },
      { id: 'b', lat: -33.021, lng: -71.551 },
    ])
    const bbox: [number, number, number, number] = [-72, -34, -71, -33]
    const atHighZoom = getLiveClusters(index, bbox, 16)
    const singles = atHighZoom.filter((f) => !f.properties.cluster)
    expect(singles.length).toBe(2)
  })
})
