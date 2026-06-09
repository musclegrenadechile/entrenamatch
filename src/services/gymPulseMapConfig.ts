/**
 * GymPulse Map 2.0 — basemap (Fases 102 + 87).
 * Prod builds set VITE_MAP_USE_MAPLIBRE=1 (npm run build / CI).
 * Dev defaults to Carto Dark raster unless .env.local sets VITE_MAP_USE_MAPLIBRE=1.
 */

export function resolveGymPulseUseMaplibre(
  env: { VITE_MAP_USE_MAPLIBRE?: string } | undefined
): boolean {
  return env?.VITE_MAP_USE_MAPLIBRE === '1'
}

export const GYMPULSE_USE_MAPLIBRE =
  typeof import.meta !== 'undefined' && resolveGymPulseUseMaplibre(import.meta.env)

export const GYMPULSE_MAPLIBRE_STYLE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAPLIBRE_STYLE_URL) ||
  'https://demotiles.maplibre.org/style.json'

export const GYMPULSE_MAP_TILE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAP_TILE_URL) ||
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

export const GYMPULSE_MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

export const GYMPULSE_MAP_SUBDOMAINS = ['a', 'b', 'c', 'd'] as const
