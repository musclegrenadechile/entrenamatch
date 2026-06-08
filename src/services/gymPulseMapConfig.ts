/**
 * GymPulse Map 2.0 — tile layer (Fase 102).
 * Default: Carto Dark (vector-style dark basemap, free, no API key).
 * Override: VITE_MAP_TILE_URL in .env.local (e.g. MapTiler dark style as raster tiles).
 */

export const GYMPULSE_MAP_TILE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAP_TILE_URL) ||
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

export const GYMPULSE_MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

export const GYMPULSE_MAP_SUBDOMAINS = ['a', 'b', 'c', 'd'] as const
