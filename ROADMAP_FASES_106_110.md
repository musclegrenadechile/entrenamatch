# Roadmap GymPulse Map 2.0 — Fases 106–110

**Estado:** ✅ Implementado (v0.1.233+)  
**Referencia:** `INFORME_REVISION_EXHAUSTIVA_v0.1.230.md` §5.3 Bloque B

| Fase | Entregable | Archivos clave |
|------|------------|----------------|
| **106** | Partner POI cards — promo, check-in CTA, badge live en pin | `GymPulsePartnerCard.tsx`, `gymPulseMarkers.ts`, `PartnerLocation` type |
| **107** | Pin respiración + heat halo por densidad | `index.css`, `gymPulseMarkerRegistry.ts`, clusters/partners |
| **108** | Navigate to gym (Google/Apple Maps) | `gymPulseNavigation.ts`, partner card |
| **109** | Popups React (sin `window.*`) | `GymPulsePopupLayer.tsx`, `GymPulseLivePopup.tsx` |
| **110** | Marker diffing — pool reutilizable | `gymPulseMarkerRegistry.ts`, `GymPulseMap.tsx` |

## Cómo probar

1. Explorar → **Ver mapa**
2. Toca un pin **partner dorado** → card con promo + **Check-in aquí** + **Cómo llegar**
3. Toca un pin **live** → panel React con **Ver perfil** y **Sync**
4. Aleja zoom con muchos live → clusters + halos verdes de densidad
5. Header debe mostrar **v0.1.233**

## Deploy Firebase

```powershell
npm run build -- --base=/
firebase deploy --only hosting --project entrenamatch
```
