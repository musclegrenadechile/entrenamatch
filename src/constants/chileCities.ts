import { normalizeCity } from '../services/localNetwork'

export type ChileRegistrationCity = {
  label: string
  norm: string
  country: 'Chile'
  lat: number
  lng: number
  region: string
}

type ChileCitySeed = {
  label: string
  region: string
  lat: number
  lng: number
}

/** Principales ciudades y comunas de Chile — registro de perfil (todas las regiones). */
const CHILE_CITY_SEEDS: readonly ChileCitySeed[] = [
  // Arica y Parinacota
  { label: 'Arica', region: 'Arica y Parinacota', lat: -18.4783, lng: -70.3126 },
  // Tarapacá
  { label: 'Iquique', region: 'Tarapacá', lat: -20.2307, lng: -70.1357 },
  { label: 'Alto Hospicio', region: 'Tarapacá', lat: -20.2677, lng: -70.1122 },
  // Antofagasta
  { label: 'Antofagasta', region: 'Antofagasta', lat: -23.6509, lng: -70.3975 },
  { label: 'Calama', region: 'Antofagasta', lat: -22.4569, lng: -68.9237 },
  { label: 'Mejillones', region: 'Antofagasta', lat: -23.1, lng: -70.45 },
  // Atacama
  { label: 'Copiapó', region: 'Atacama', lat: -27.3668, lng: -70.3322 },
  { label: 'Vallenar', region: 'Atacama', lat: -28.576, lng: -70.759 },
  // Coquimbo
  { label: 'La Serena', region: 'Coquimbo', lat: -29.9027, lng: -71.2519 },
  { label: 'Coquimbo', region: 'Coquimbo', lat: -29.9533, lng: -71.3436 },
  { label: 'Ovalle', region: 'Coquimbo', lat: -30.6011, lng: -71.2002 },
  { label: 'Illapel', region: 'Coquimbo', lat: -31.633, lng: -71.166 },
  // Valparaíso — piloto costa central
  { label: 'Viña del Mar', region: 'Valparaíso', lat: -33.0153, lng: -71.5528 },
  { label: 'Valparaíso', region: 'Valparaíso', lat: -33.0472, lng: -71.6127 },
  { label: 'Concón', region: 'Valparaíso', lat: -32.923, lng: -71.522 },
  { label: 'Quilpué', region: 'Valparaíso', lat: -33.0472, lng: -71.4425 },
  { label: 'Villa Alemana', region: 'Valparaíso', lat: -33.045, lng: -71.373 },
  { label: 'San Antonio', region: 'Valparaíso', lat: -33.594, lng: -71.607 },
  { label: 'Casablanca', region: 'Valparaíso', lat: -33.321, lng: -71.41 },
  { label: 'Quintero', region: 'Valparaíso', lat: -32.783, lng: -71.533 },
  { label: 'Los Andes', region: 'Valparaíso', lat: -32.834, lng: -70.598 },
  { label: 'San Felipe', region: 'Valparaíso', lat: -32.751, lng: -70.726 },
  // Metropolitana
  { label: 'Santiago', region: 'Metropolitana', lat: -33.4489, lng: -70.6693 },
  { label: 'Puente Alto', region: 'Metropolitana', lat: -33.611, lng: -70.575 },
  { label: 'Maipú', region: 'Metropolitana', lat: -33.511, lng: -70.758 },
  { label: 'La Florida', region: 'Metropolitana', lat: -33.522, lng: -70.598 },
  { label: 'Las Condes', region: 'Metropolitana', lat: -33.417, lng: -70.55 },
  { label: 'Ñuñoa', region: 'Metropolitana', lat: -33.456, lng: -70.598 },
  { label: 'San Bernardo', region: 'Metropolitana', lat: -33.592, lng: -70.7 },
  { label: 'Peñalolén', region: 'Metropolitana', lat: -33.483, lng: -70.542 },
  { label: 'Quilicura', region: 'Metropolitana', lat: -33.367, lng: -70.728 },
  { label: 'Pudahuel', region: 'Metropolitana', lat: -33.439, lng: -70.785 },
  { label: 'Colina', region: 'Metropolitana', lat: -33.202, lng: -70.674 },
  { label: 'Melipilla', region: 'Metropolitana', lat: -33.686, lng: -71.217 },
  // O'Higgins
  { label: 'Rancagua', region: "O'Higgins", lat: -34.1708, lng: -70.7444 },
  { label: 'San Fernando', region: "O'Higgins", lat: -34.587, lng: -70.988 },
  { label: 'Pichilemu', region: "O'Higgins", lat: -34.383, lng: -72.003 },
  // Maule
  { label: 'Talca', region: 'Maule', lat: -35.4264, lng: -71.6554 },
  { label: 'Curicó', region: 'Maule', lat: -34.983, lng: -71.239 },
  { label: 'Linares', region: 'Maule', lat: -35.847, lng: -71.593 },
  { label: 'Constitución', region: 'Maule', lat: -35.333, lng: -72.417 },
  // Ñuble
  { label: 'Chillán', region: 'Ñuble', lat: -36.6067, lng: -72.1034 },
  { label: 'San Carlos', region: 'Ñuble', lat: -36.425, lng: -71.958 },
  // Biobío
  { label: 'Concepción', region: 'Biobío', lat: -36.8201, lng: -73.0444 },
  { label: 'Talcahuano', region: 'Biobío', lat: -36.724, lng: -73.116 },
  { label: 'Los Ángeles', region: 'Biobío', lat: -37.469, lng: -72.352 },
  { label: 'Coronel', region: 'Biobío', lat: -37.034, lng: -73.14 },
  { label: 'Chiguayante', region: 'Biobío', lat: -36.925, lng: -73.033 },
  // La Araucanía
  { label: 'Temuco', region: 'La Araucanía', lat: -38.7359, lng: -72.5904 },
  { label: 'Villarrica', region: 'La Araucanía', lat: -39.285, lng: -72.227 },
  { label: 'Angol', region: 'La Araucanía', lat: -37.795, lng: -72.716 },
  { label: 'Pucón', region: 'La Araucanía', lat: -39.282, lng: -71.954 },
  // Los Ríos
  { label: 'Valdivia', region: 'Los Ríos', lat: -39.8142, lng: -73.2459 },
  { label: 'La Unión', region: 'Los Ríos', lat: -40.293, lng: -73.082 },
  // Los Lagos
  { label: 'Puerto Montt', region: 'Los Lagos', lat: -41.4693, lng: -72.9424 },
  { label: 'Osorno', region: 'Los Lagos', lat: -40.573, lng: -73.135 },
  { label: 'Puerto Varas', region: 'Los Lagos', lat: -41.319, lng: -72.985 },
  { label: 'Castro', region: 'Los Lagos', lat: -42.482, lng: -73.763 },
  { label: 'Ancud', region: 'Los Lagos', lat: -41.87, lng: -73.817 },
  { label: 'Calbuco', region: 'Los Lagos', lat: -41.773, lng: -73.13 },
  // Aysén
  { label: 'Coyhaique', region: 'Aysén', lat: -45.575, lng: -72.066 },
  { label: 'Puerto Aysén', region: 'Aysén', lat: -45.407, lng: -72.692 },
  // Magallanes
  { label: 'Punta Arenas', region: 'Magallanes', lat: -53.1638, lng: -70.9171 },
  { label: 'Puerto Natales', region: 'Magallanes', lat: -51.724, lng: -72.487 },
]

export const CHILE_REGISTRATION_CITIES: ChileRegistrationCity[] = CHILE_CITY_SEEDS.map(
  (city) => ({
    label: city.label,
    norm: normalizeCity(city.label),
    country: 'Chile' as const,
    lat: city.lat,
    lng: city.lng,
    region: city.region,
  })
)

/** Legacy label kept for Firestore docs written as "Concon". */
export const CHILE_CITY_LEGACY_ALIASES: Record<string, string> = {
  concon: 'Concón',
}
