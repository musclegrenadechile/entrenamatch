// @ts-nocheck
/**
 * GymPulseMap - Extracted Live Map Component (modularization started 2026-06-05)
 *
 * Goal: Remove ~800+ lines of complex Leaflet + marker/ripple/partner/sync-line rendering
 * from the giant App.tsx monolith.
 *
 * This component now owns:
 * - The Leaflet map instance and container
 * - All map-specific refs (markers, self, area, syncLines, timeouts, etc.)
 * - Initialization
 * - The heavy debounced real-time update effect (live users, clusters, ripples, partners, tethers, heartbeats)
 * - Dev click-to-place support
 * - Zoom cluster behavior
 *
 * Parent (App) is responsible for:
 * - All the data (liveTrainingNow, partnerLocations, ritualRipples, etc.)
 * - Higher level state (showLiveMap, filters like mapNearOnly, selectedMapZone, showPartners, showOnlyLegends)
 * - Callbacks for user actions (show profile, start sync, partner placed by dev, force tick)
 * - The partner Firestore listener (can be moved here later)
 *
 * Next iterations can move even more (the partner listener, some filter state, the "Centrar" button logic).
 */

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { toast } from 'sonner'

// Fix Leaflet icons (same as before)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

import { getDistanceKm } from '../../utils' // adjust if needed

export interface GymPulseMapProps {
  showLiveMap: boolean
  liveTrainingNow: any[]
  ritualRipples: any[]
  partnerLocations: any[]
  echoPins?: any[]
  userLocation: { lat: number; lng: number } | null
  mapNearOnly: boolean
  selectedMapZone: string | null
  showOnlyLegends?: boolean
  showPartners: boolean
  mapForceTick: number
  syncBonds: Record<string, any>
  isDeveloper?: boolean
  isPlacingPartner?: boolean
  isQuickAddPartner?: boolean
  selfIsLive?: boolean // so we can style the self marker with live pulse/glow when the user has activated "Entrenando Ahora"

  // Callbacks
  onShowProfile?: (p: any) => void
  onStartSync?: (id: string, name: string) => void
  onPartnerPositionSelected?: (lat: number, lng: number) => void
  onPartnerMoved?: (id: string, lat: number, lng: number) => void
  onPartnerDelete?: (id: string) => void
  onPartnerEdit?: (id: string) => void
  onForceTick?: () => void
  onRequestLocation?: () => void

  // For centrar button from parent
  onRegisterCentrar?: (fn: () => void) => void
}

export interface GymPulseMapHandle {
  flyToSelf: () => void
  invalidateSize: () => void
  centerOn: (lat: number, lng: number, zoom?: number) => void
}

const ZONE_COLORS: Record<string, string> = {
  'Viña del Mar': '#22c55e',
  'Santiago': '#FF671F',
  'Valparaíso': '#3b82f6',
  'Concon': '#a855f7',
  default: '#eab308'
}

const PARTNER_SEEDS = [ /* keep seeds here or import from constants if moved later */
  { id: 'gym1', name: 'Power Gym Reñaca', type: 'gym', lat: -32.95, lng: -71.55, logo: null, city: 'Viña del Mar' },
  { id: 'gym2', name: 'CrossFit Viña', type: 'crossfit', lat: -33.02, lng: -71.55, logo: null, city: 'Viña del Mar' },
  { id: 'gym3', name: 'Iron Temple Santiago', type: 'gym', lat: -33.45, lng: -70.67, logo: null, city: 'Santiago' },
]

const GymPulseMap = forwardRef<GymPulseMapHandle, GymPulseMapProps>((props, ref) => {
  const {
    showLiveMap,
    liveTrainingNow,
    ritualRipples,
    partnerLocations,
    echoPins = [],
    userLocation,
    mapNearOnly,
    selectedMapZone,
    showOnlyLegends = false,
    showPartners,
    mapForceTick,
    syncBonds,
    isDeveloper = false,
    isPlacingPartner = false,
    isQuickAddPartner = false,
    selfIsLive = false,
    onShowProfile,
    onStartSync,
    onPartnerPositionSelected,
    onPartnerMoved,
    onPartnerDelete,
    onPartnerEdit,
    onForceTick,
    onRequestLocation,
    onRegisterCentrar,
  } = props

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const syncLinesRef = useRef<any[]>([])
  const selfMarkerRef = useRef<any>(null)
  const areaCircleRef = useRef<any>(null)
  const prevLiveCountRef = useRef(0)
  const prevLiveIdsRef = useRef<Set<string>>(new Set())
  const lastZoomTimeRef = useRef(0)
  const partnerLocationsRef = useRef<any[]>([])
  const mapUpdateTimeoutRef = useRef<any>(null)
  const isPlacingPartnerRef = useRef(false)
  const isQuickAddPartnerRef = useRef(false)
  const showAddPartnerFormRef = useRef(false)

  // Keep latest values in refs for closures inside Leaflet handlers / debounced updates
  useEffect(() => { partnerLocationsRef.current = partnerLocations }, [partnerLocations])
  useEffect(() => { isPlacingPartnerRef.current = isPlacingPartner }, [isPlacingPartner])
  useEffect(() => { isQuickAddPartnerRef.current = isQuickAddPartner }, [isQuickAddPartner])

  // Expose imperative handle for parent (centrar, invalidate, etc.)
  useImperativeHandle(ref, () => ({
    flyToSelf: () => {
      if (mapInstanceRef.current && selfMarkerRef.current) {
        const currentZoom = mapInstanceRef.current.getZoom()
        mapInstanceRef.current.flyTo(selfMarkerRef.current.getLatLng(), Math.max(currentZoom, 15), { duration: 0.85 })
      }
    },
    invalidateSize: () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.invalidateSize() } catch {}
      }
    },
    centerOn: (lat: number, lng: number, zoom = 15) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 0.8 })
      }
    }
  }), [])

  // Register centrar fn with parent if provided
  useEffect(() => {
    if (onRegisterCentrar) {
      onRegisterCentrar(() => {
        if (selfMarkerRef.current && mapInstanceRef.current) {
          const z = mapInstanceRef.current.getZoom()
          mapInstanceRef.current.flyTo(selfMarkerRef.current.getLatLng(), Math.max(z, 15), { duration: 0.85 })
        } else if (mapInstanceRef.current && markersRef.current.length > 0) {
          const group = L.featureGroup(markersRef.current)
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2))
        }
      })
    }
  }, [onRegisterCentrar])

  // Main map effect - the heart of GymPulse (moved from App.tsx monolith)
  useEffect(() => {
    if (!showLiveMap || !mapContainerRef.current) {
      // Aggressive cleanup when map should be hidden
      if (mapInstanceRef.current) {
        markersRef.current.forEach(m => { try { mapInstanceRef.current.removeLayer(m) } catch {} })
        markersRef.current = []
        if (selfMarkerRef.current) { try { mapInstanceRef.current.removeLayer(selfMarkerRef.current) } catch {}; selfMarkerRef.current = null }
        if (areaCircleRef.current) { try { mapInstanceRef.current.removeLayer(areaCircleRef.current) } catch {}; areaCircleRef.current = null }
        syncLinesRef.current.forEach(l => { try { mapInstanceRef.current.removeLayer(l) } catch {} })
        syncLinesRef.current = []
        try { mapInstanceRef.current.remove() } catch {}
        mapInstanceRef.current = null
      }
      return
    }

    // Request location the first time map opens (good UX)
    if (!userLocation && onRequestLocation) {
      onRequestLocation().catch(() => {})
    }

    // Initialize map if needed
    if (!mapInstanceRef.current) {
      const initialCenter = userLocation ? [userLocation.lat, userLocation.lng] : [-33.0, -71.5]
      const initialZoom = userLocation ? 13 : 10
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView(initialCenter, initialZoom)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(mapInstanceRef.current)

      setTimeout(() => { if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize() }, 50)

      // Dev click-to-place
      if (mapInstanceRef.current && !(mapInstanceRef.current as any)._emDevPlaceBound) {
        mapInstanceRef.current.on('click', (e: any) => {
          const shouldTrigger = isPlacingPartnerRef.current || isQuickAddPartnerRef.current
          if (shouldTrigger && onPartnerPositionSelected) {
            const { lat, lng } = e.latlng || {}
            if (typeof lat === 'number' && typeof lng === 'number') {
              onPartnerPositionSelected(lat, lng)
              try { /* haptic if available */ } catch {}
              if (isPlacingPartnerRef.current) {
                toast.success('Posición fijada', { description: `${lat.toFixed(4)}, ${lng.toFixed(4)} — ajusta o guarda` })
              }
            }
          }
        })
        ;(mapInstanceRef.current as any)._emDevPlaceBound = true
      }

      // Zoom listener for clusters + force tick
      if (mapInstanceRef.current && !(mapInstanceRef.current as any)._clusterZoomBound) {
        mapInstanceRef.current.on('zoomend', () => {
          lastZoomTimeRef.current = Date.now()
          if (onForceTick) onForceTick()
        })
        ;(mapInstanceRef.current as any)._clusterZoomBound = true
      }
    } else {
      setTimeout(() => { if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize() }, 50)
    }

    // Debounced heavy update (core of the living GymPulse)
    if (mapUpdateTimeoutRef.current) clearTimeout(mapUpdateTimeoutRef.current)
    const isRecentZoom = (Date.now() - lastZoomTimeRef.current) < 2000
    const updateDelay = isRecentZoom ? 60 : 280

    mapUpdateTimeoutRef.current = setTimeout(() => {
      if (!mapInstanceRef.current) return

      // Nuke previous markers (except self/area which we manage separately)
      markersRef.current.forEach(m => { try { mapInstanceRef.current.removeLayer(m) } catch {} })
      markersRef.current = []

      let liveUsers = [...liveTrainingNow].filter(u => u.lat && u.lng && u.trainingNow)
      if (mapNearOnly && userLocation) liveUsers = liveUsers.filter(u => (u.distance || 999) < 10)
      if (selectedMapZone) liveUsers = liveUsers.filter(u => u.city === selectedMapZone)
      if (showOnlyLegends) liveUsers = liveUsers.filter(u => u.isLegend)

      // Heartbeats when live count increases
      const currentLive = liveUsers.length
      const prevLive = prevLiveCountRef.current
      if (currentLive > prevLive && currentLive > 0) {
        const candidates = liveUsers.length > 0 ? liveUsers : (userLocation ? [userLocation] : [])
        for (let i = 0; i < Math.min(2, candidates.length); i++) {
          const pos = candidates[Math.floor(Math.random() * candidates.length)]
          try {
            const beat = L.circle([pos.lat, pos.lng], {
              radius: 420 + (currentLive * 18),
              color: '#22c55e', weight: 1.5, fillColor: '#22c55e', fillOpacity: 0.035, opacity: 0.28,
              className: 'map-heartbeat-ring iconic-ripple'
            }).addTo(mapInstanceRef.current)
            ;(beat as any)._isHeartbeat = true
            markersRef.current.push(beat)
            setTimeout(() => {
              if (mapInstanceRef.current && (beat as any)._isHeartbeat) try { mapInstanceRef.current.removeLayer(beat) } catch {}
            }, 1650)
          } catch {}
        }
        if (currentLive - prevLive >= 2) { try { /* haptic */ } catch {} }
      }
      prevLiveCountRef.current = currentLive

      // New lives ripples (FOMO)
      const currentIds = new Set(liveUsers.map((u: any) => u.id))
      const prevIds = prevLiveIdsRef.current
      const newLives = liveUsers.filter((u: any) => !prevIds.has(u.id))
      newLives.forEach((newUser: any) => {
        if (!newUser.lat || !newUser.lng) return
        const isHigh = (newUser.visibleLevel || 1) >= 15 || newUser.isLegend
        const hasPulso = (newUser.visibleLevel || 1) >= 20
        const color = hasPulso ? '#a855f7' : (isHigh ? '#FFD700' : '#22c55e')
        try {
          const r = L.circle([newUser.lat, newUser.lng], {
            radius: hasPulso ? 650 : (isHigh ? 550 : 320),
            color, weight: hasPulso || isHigh ? 2.8 : 1.8,
            fillColor: color, fillOpacity: hasPulso || isHigh ? 0.1 : 0.05, opacity: hasPulso || isHigh ? 0.7 : 0.45,
            className: `map-heartbeat-ring iconic-ripple ripple-new-live${hasPulso ? ' pulso-maestro-ripple' : (isHigh ? ' high-gadget-ripple' : '')}`
          }).addTo(mapInstanceRef.current)
          ;(r as any)._isNewLiveRipple = true
          markersRef.current.push(r)
          setTimeout(() => {
            if (mapInstanceRef.current && (r as any)._isNewLiveRipple) try { mapInstanceRef.current.removeLayer(r) } catch {}
          }, isHigh ? 2200 : 1600)
        } catch {}
      })
      prevLiveIdsRef.current = currentIds

      // Ambient pulso for high level users
      const pulsoUsers = liveUsers.filter((u: any) => (u.visibleLevel || 1) >= 20 && u.lat && u.lng)
      if (pulsoUsers.length > 0 && Math.random() < 0.4) {
        const p = pulsoUsers[Math.floor(Math.random() * pulsoUsers.length)]
        try {
          const amb = L.circle([p.lat, p.lng], {
            radius: 180, color: '#a855f7', weight: 1.2, fillColor: '#a855f7', fillOpacity: 0.03, opacity: 0.25,
            className: 'pulso-maestro-ripple iconic-ripple ripple-pulso-master'
          }).addTo(mapInstanceRef.current)
          ;(amb as any)._isAmbientPulso = true
          markersRef.current.push(amb)
          setTimeout(() => { if (mapInstanceRef.current && (amb as any)._isAmbientPulso) try { mapInstanceRef.current.removeLayer(amb) } catch {} }, 1800)
        } catch {}
      }

      // Clustering at low zoom
      let renderUsers = liveUsers
      const currentZoom = mapInstanceRef.current.getZoom()
      if (currentZoom < 11.5 && liveUsers.length > 3) {
        const gridSize = 0.04
        const buckets: Record<string, any[]> = {}
        liveUsers.forEach(u => {
          const k = `${Math.floor(u.lat / gridSize)}:${Math.floor(u.lng / gridSize)}`
          if (!buckets[k]) buckets[k] = []
          buckets[k].push(u)
        })
        renderUsers = Object.values(buckets).map(g => {
          if (g.length <= 1) return g[0]
          const avgLat = g.reduce((s, u) => s + u.lat, 0) / g.length
          const avgLng = g.reduce((s, u) => s + u.lng, 0) / g.length
          const maxLvl = Math.max(0, ...g.map((u: any) => u.visibleLevel || 1))
          return { id: `cluster-${avgLat.toFixed(3)}-${avgLng.toFixed(3)}`, lat: avgLat, lng: avgLng, isCluster: true, clusterCount: g.length, clusterMembers: g, visibleLevel: maxLvl, city: g[0]?.city }
        })
      }

      // Self marker (in-place update, not in markersRef)
      if (userLocation) {
        const isLive = !!selfIsLive;
        const liveClass = isLive ? ' live-self' : '';
        const liveBorder = isLive ? 'box-shadow:0 0 0 4px #22c55e55, 0 0 0 8px rgba(34,197,94,0.25); animation: live-pulse-green 2s ease-in-out infinite;' : 'box-shadow:0 0 0 3px rgba(34,197,94,0.3);';
        const liveBadgeSelf = isLive ? `<div style="position:absolute;top:-2px;right:-2px;background:#22c55e;color:#111;font-size:7px;font-weight:900;padding:0 3px;border-radius:3px;line-height:10px;border:1px solid #111">LIVE</div>` : '';
        const selfIcon = L.divIcon({
          html: `<div style="position:relative;width:28px;height:28px"><div style="width:28px;height:28px;border-radius:9999px;overflow:hidden;border:3px solid ${isLive ? '#22c55e' : '#22c55e'};${liveBorder}"><img src="${userLocation.photo || ''}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.background='#22c55e';this.innerHTML='<div style=\\'font-size:10px;color:white;display:flex;align-items:center;justify-content:center;height:100%\\'>TÚ</div>'"/></div>${liveBadgeSelf}</div>`,
          className: `self-marker${liveClass}`, iconSize: [28, 28], iconAnchor: [14, 14]
        })
        if (!selfMarkerRef.current) {
          selfMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: selfIcon }).addTo(mapInstanceRef.current)
          selfMarkerRef.current.bindPopup('<strong>TÚ</strong><br/>Tu ubicación actual (GPS)')
        } else {
          selfMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng])
        }
        if (!areaCircleRef.current) {
          areaCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
            radius: 10000, color: '#22c55e', weight: 1, fillColor: '#22c55e', fillOpacity: 0.06, opacity: 0.25
          }).addTo(mapInstanceRef.current)
        } else {
          areaCircleRef.current.setLatLng([userLocation.lat, userLocation.lng])
        }
      }

      // Live user markers + tethers + partner markers (simplified version of the original for extraction - full details can be expanded)
      // ... (the rest of the original marker creation for liveUsers, partners with logos, sync tethers, ritual ripples, echo pins, etc. would go here)
      // For this step we keep a functional core and note that the full rich version (with all the beautiful icons, popups, tethers, partner logos, legend gold, etc.) lives in the original until fully ported.

      // Enriched live markers for "Entrenando Ahora" (GymPulse) - makes the live status visually obvious
      // Uses data like seVaEnMin, joinCount, isLegend, visibleLevel from the parent liveTrainingNow computation.
      renderUsers.forEach((u: any) => {
        if (!u.lat || !u.lng) return
        const isBond = !!syncBonds[u.id]
        const isHigh = (u.visibleLevel || 1) >= 15 || u.isLegend
        const hasPulso = (u.visibleLevel || 1) >= 20
        const borderColor = isBond ? '#FFD700' : (hasPulso ? '#a855f7' : (isHigh ? '#eab308' : '#22c55e'))
        const ring = hasPulso || isHigh ? '0 0 0 3px ' + (hasPulso ? '#a855f755' : '#eab30855') + ', ' : ''
        const liveBadge = `<div style="position:absolute;top:-2px;right:-2px;background:#22c55e;color:#111;font-size:7px;font-weight:900;padding:0 3px;border-radius:3px;line-height:10px;border:1px solid #111">LIVE</div>`
        const timeBadge = u.seVaEnMin != null ? `<div style="position:absolute;bottom:-1px;left:50%;transform:translateX(-50%);background:#111;color:#22c55e;font-size:7px;padding:0 3px;border-radius:2px;white-space:nowrap;">~${u.seVaEnMin}m</div>` : ''
        const iconHtml = `
          <div style="position:relative;width:28px;height:28px">
            <div style="width:28px;height:28px;border-radius:9999px;overflow:hidden;border:2.5px solid ${borderColor};box-shadow:${ring}0 0 0 2px rgba(0,0,0,0.7);">
              <img src="${u.photos?.[0] || ''}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.background='#22c55e';this.innerHTML='<div style=\\'font-size:9px;color:white;display:flex;align-items:center;justify-content:center;height:100%\\'>LIVE</div>'" />
            </div>
            ${liveBadge}
            ${timeBadge}
            <div style="position:absolute;inset:-3px;border-radius:9999px;border:1.5px solid #22c55e;opacity:0.4;animation:live-pulse-green 1.8s ease-in-out infinite;"></div>
          </div>`
        try {
          const marker = L.marker([u.lat, u.lng], {
            icon: L.divIcon({ html: iconHtml, className: 'live-user-marker', iconSize: [28, 28], iconAnchor: [14, 14] })
          }).addTo(mapInstanceRef.current)

          const joinTxt = u.joinCount ? ` • ${u.joinCount} joined` : ''
          marker.bindPopup(`
            <div style="min-width:170px;font-size:12px">
              <strong>${u.name}</strong> ${isBond ? '⭐ RED' : ''} <span style="color:#22c55e;font-size:10px">🟢 EN VIVO</span><br/>
              <span style="font-size:10px">${u.trainingTypes?.[0] || ''} • ${(u.distance || 0).toFixed(1)}km${joinTxt}</span><br/>
              ${u.seVaEnMin != null ? `<span style="font-size:10px">Se va en ~${u.seVaEnMin} min</span><br/>` : ''}
              <button style="margin-top:5px;background:#22c55e;color:black;border:none;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:600" onclick="window.startSyncFromMap && window.startSyncFromMap('${u.id}', '${u.name}')">🔥 Entrenar juntos / Sync</button>
            </div>
          `)

          marker.on('click', () => onShowProfile && onShowProfile(u))
          markersRef.current.push(marker)
        } catch (e) {}
      })

      // Partner markers (logos if present). Enhanced for devs: draggable + dev actions in popup.
      if (showPartners) {
        partnerLocationsRef.current.forEach((p: any) => {
          if (!p.lat || !p.lng) return
          const logo = p.logoUrl || p.logo || ''
          const html = logo
            ? `<div style="width:32px;height:32px;border-radius:9999px;overflow:hidden;border:2px solid #FFD700;box-shadow:0 0 8px #FFD70044;"><img src="${logo}" style="width:100%;height:100%;object-fit:cover" onerror="this.outerHTML='<div style=width:32px;height:32px;background:#222;border:2px solid #FFD700;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:11px;color:#FFD700>🏋️</div>'" /></div>`
            : `<div style="width:28px;height:28px;background:#222;border:2px solid #FFD700;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#FFD700">🏋️</div>`

          try {
            const pm = L.marker([p.lat, p.lng], {
              icon: L.divIcon({ html, className: 'partner-marker', iconSize: [32, 32], iconAnchor: [16, 16] }),
              draggable: !!isDeveloper,  // devs can drag to reposition stores/tiendas instantly
              title: isDeveloper ? 'DEV: drag to move, tap for actions' : p.name
            }).addTo(mapInstanceRef.current)

            // Basic popup, enriched for devs with action buttons (using window helpers for simplicity)
            let popupContent = `<strong>${p.name}</strong><br/><span style="font-size:10px">${p.type || 'Partner'} • ${p.address || ''}</span>`
            if (isDeveloper) {
              popupContent += `<br/><small style="color:#FFD700">DEV MODE</small><br/>`
              popupContent += `<button onclick="window.devEditPartner && window.devEditPartner('${p.id}')" style="font-size:10px;margin-right:4px">✏️ Edit</button>`
              popupContent += `<button onclick="window.devDeletePartner && window.devDeletePartner('${p.id}')" style="font-size:10px;color:#f55">🗑️ Borrar tienda</button>`
            }
            pm.bindPopup(popupContent)

            // Drag support for devs - calls parent to persist move (to state + FS)
            if (isDeveloper) {
              pm.on('dragend', () => {
                const pos = pm.getLatLng()
                if (onPartnerMoved) {
                  onPartnerMoved(p.id, pos.lat, pos.lng)
                }
                try { /* haptic */ } catch {}
              })
            }

            markersRef.current.push(pm)
          } catch {}
        })
      }

      // TODO: full port of ritualRipples (waves + lines), sync tethers between bonded live users, echo pins, cluster popups with "expand", fitBounds on first load, etc.
      // The visual fidelity is high in the original; we can copy the exact blocks for ripples/tethers in the next pass.

      // Initial fit (once)
      if (markersRef.current.length > 0 && !(mapInstanceRef.current as any)._hasDoneInitialFit) {
        try {
          const group = L.featureGroup(markersRef.current)
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.15))
          ;(mapInstanceRef.current as any)._hasDoneInitialFit = true
        } catch {}
      }
    }, updateDelay)

    // Return cleanup for this effect invocation
    return () => {
      if (mapInstanceRef.current) {
        markersRef.current.forEach(m => { try { mapInstanceRef.current.removeLayer(m) } catch {} })
        syncLinesRef.current.forEach(l => { try { mapInstanceRef.current.removeLayer(l) } catch {} })
        syncLinesRef.current = []
        if (selfMarkerRef.current) { try { mapInstanceRef.current.removeLayer(selfMarkerRef.current) } catch {}; selfMarkerRef.current = null }
        if (areaCircleRef.current) { try { mapInstanceRef.current.removeLayer(areaCircleRef.current) } catch {}; areaCircleRef.current = null }
      }
      markersRef.current = []
    }
  }, [
    showLiveMap, liveTrainingNow, userLocation, mapNearOnly, selectedMapZone,
    ritualRipples, echoPins, showPartners, mapForceTick, partnerLocations.length,
    showOnlyLegends, syncBonds, isDeveloper, selfIsLive, onShowProfile, onStartSync, onPartnerPositionSelected, onPartnerMoved, onPartnerDelete, onPartnerEdit, onForceTick, onRequestLocation, isQuickAddPartner
  ])

  // Global window helpers for popups (quick bridge until we use React portals or better event system)
  // Also dev helpers for partner management from map popups
  useEffect(() => {
    ;(window as any).startSyncFromMap = (id: string, name: string) => {
      onStartSync && onStartSync(id, name)
    }
    ;(window as any).witnessEchoPin = (id: string) => {
      // TODO: wire to parent witness modal
      console.log('witness echo', id)
    }
    ;(window as any).devDeletePartner = (id: string) => {
      if (onPartnerDelete) onPartnerDelete(id)
    }
    ;(window as any).devEditPartner = (id: string) => {
      if (onPartnerEdit) onPartnerEdit(id)
    }
    return () => {
      delete (window as any).startSyncFromMap
      delete (window as any).witnessEchoPin
      delete (window as any).devDeletePartner
      delete (window as any).devEditPartner
    }
  }, [onStartSync, onPartnerDelete, onPartnerEdit])

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[340px] rounded-2xl overflow-hidden border border-[#22c55e]/30 bg-[#0a0a0c] shadow-inner"
      style={{ zIndex: 1 }}
    />
  )
})

GymPulseMap.displayName = 'GymPulseMap'

export { GymPulseMap }
export default GymPulseMap
