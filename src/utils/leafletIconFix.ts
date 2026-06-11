/**
 * Leaflet default icon paths — import only from map chunks (keeps App bundle lean).
 */
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

let applied = false

export function ensureLeafletDefaultIcons(): void {
  if (applied) return
  applied = true
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

ensureLeafletDefaultIcons()
