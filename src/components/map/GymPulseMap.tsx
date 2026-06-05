// @ts-nocheck
/**
 * GymPulseMap - Componente extraído (inicio de modularización 2026-06-05)
 * 
 * Este es el PRIMER paso para sacar la lógica pesada del mapa (GymPulse en tiempo real)
 * fuera del monolito App.tsx (~13k líneas).
 * 
 * Actualmente es un stub con la estructura recomendada + algunos helpers movidos.
 * El siguiente paso es mover:
 *   - El useEffect gigante de renderizado de markers/ripples/partners
 *   - La creación de divIcon / L.circle para lives, partners, ripples, clusters
 *   - La lógica de heartbeats + pulso maestro
 * 
 * Props que necesitará (se irán refinando):
 *   - liveTrainingNow, ritualRipples, partnerLocations, echoPins
 *   - userLocation, mapNearOnly, selectedMapZone, showPartners
 *   - syncBonds, networkStats, isDeveloper
 *   - callbacks: setShowFullProfile, startSyncWith, etc.
 *   - refs y funciones internas del mapa (mapInstanceRef, etc.)
 */

import * as L from 'leaflet'
import { useEffect, useRef } from 'react'

export interface GymPulseMapProps {
  // Datos en vivo
  liveTrainingNow: any[]
  ritualRipples: any[]
  partnerLocations: any[]
  echoPins?: any[]
  
  // Ubicación y filtros
  userLocation: { lat: number; lng: number } | null
  mapNearOnly: boolean
  selectedMapZone: string | null
  showPartners: boolean
  
  // Datos de red
  syncBonds: Record<string, any>
  networkStats?: any
  
  // Dev / controls
  isDeveloper?: boolean
  mapForceTick?: number
  
  // Callbacks principales
  onShowProfile?: (profile: any) => void
  onStartSync?: (id: string, name: string) => void
  onPartnerClick?: (partner: any) => void
  
  // Para inyectar el contenedor desde fuera (por ahora el mapa se monta en un div con id fijo)
  // En futuras iteraciones podemos hacer que este componente monte su propio <div id="gym-pulse-map" />
}

export function GymPulseMap(props: GymPulseMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)

  // TODO (próxima iteración): mover aquí toda la inicialización de Leaflet + tile layer + listeners de click/zoom

  // TODO: mover la lógica de creación de ripples (ritualRipples → círculos animados + polylines)
  // TODO: mover la lógica de markers de live users (con foto, glow, tether si están en sync)
  // TODO: mover la lógica de partners (logo <img>, badge PARTNER, activity count)
  // TODO: mover clusters cuando zoom bajo
  // TODO: mover heartbeats / ambient pulse rings

  useEffect(() => {
    // Placeholder: cuando movamos el código real, aquí irá el useEffect principal
    // que depende de liveTrainingNow, ritualRipples, partnerLocations, mapForceTick, etc.
    // console.log('[GymPulseMap] props actualizados', { live: props.liveTrainingNow?.length })
  }, [
    props.liveTrainingNow,
    props.ritualRipples,
    props.partnerLocations,
    props.mapForceTick,
    props.showPartners,
    props.selectedMapZone,
  ])

  // Por ahora renderizamos un placeholder.
  // El mapa real sigue montado desde App.tsx en el div #live-map o similar.
  // Cuando terminemos la extracción, este componente devolverá el <div ref={mapContainerRef} ... />
  return (
    <div className="gym-pulse-map-container" style={{ width: '100%', height: '100%' }}>
      {/* El contenido real del mapa (Leaflet) sigue en App.tsx por ahora.
          Este componente es el punto de anclaje para la refactorización. */}
      <div 
        ref={mapContainerRef} 
        id="gym-pulse-map-root" 
        style={{ width: '100%', height: '100%', background: 'transparent' }} 
      />
    </div>
  )
}

export default GymPulseMap
