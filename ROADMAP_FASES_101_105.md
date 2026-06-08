# Roadmap GymPulse Map 2.0 — Fases 101–105

**Estado:** ✅ Implementado (v0.1.231+)  
**Referencia:** `INFORME_REVISION_EXHAUSTIVA_v0.1.230.md` §5.3 Bloque A

| Fase | Entregable | Archivos clave |
|------|------------|----------------|
| **101** | Fullscreen toggle + safe-area iOS/Android | `GymPulseMapShell.tsx`, `ExploreLivePanel.tsx`, `index.css` |
| **102** | Mapa dark (Carto Dark / `VITE_MAP_TILE_URL`) | `gymPulseMapConfig.ts`, `GymPulseMap.tsx` |
| **103** | supercluster + expand zoom | `gymPulseCluster.ts`, `GymPulseMap.tsx` |
| **104** | Markers unificados `.iconic-live-marker` | `gymPulseMarkers.ts` |
| **105** | Bottom sheet lista live (red + distancia) | `GymPulseBottomSheet.tsx`, `sortLiveUsersForSheet()` |

## Cómo probar

1. Explorar → **Ver el mapa en tiempo real**
2. Botón **⛶** (esquina superior derecha) → fullscreen
3. Mapa oscuro + clusters con número al alejar zoom
4. Bottom sheet: lista ordenada por vínculo RED y km
5. Tap fila → vuela al pin · **Sync** → EntrenaSync

## Config opcional

```env
# .env.local — tiles personalizados (MapTiler raster, etc.)
VITE_MAP_TILE_URL=https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```

## Siguiente bloque (106–110)

- Partner POI cards premium
- Pin animación respiración + heat halo
- Deep link navegación a gym
- Popups React (sin `window.*`)
- Marker diffing 60fps
