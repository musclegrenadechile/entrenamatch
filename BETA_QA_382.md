# Beta QA — Fase 382 (17 ítems)

**Versión:** v0.1.382 · **Dispositivos:** 2 físicos (Android recomendado)

Marcar ✅ en cada fila. Bloqueante para fase 450.

## P0 — 12 flujos (`p0BetaQaMatrix`)

| # | ID | Flujo | A | B |
|---|-----|-------|---|---|
| 1 | p0-01 | Registro → onboarding → Tab Hoy | ☐ | ☐ |
| 2 | p0-02 | LIVE **no** auto al terminar onboarding | ☐ | ☐ |
| 3 | p0-03 | Una guía (3 pasos), sin tour apilado | ☐ | ☐ |
| 4 | p0-04 | CityDerby visible 0 vs 0 | ☐ | ☐ |
| 5 | p0-05 | LIVE → visible mapa otro usuario (<60 s) | ☐ | ☐ |
| 6 | p0-06 | EntrenaSync ≥2 min → minutos derby | ☐ | ☐ |
| 7 | p0-07 | Matches tab sin crash tras hard refresh | ☐ | ☐ |
| 8 | p0-08 | Invitar amigo desde piloto strip | ☐ | ☐ |
| 9 | p0-09 | Toast derby si rival supera | ☐ | ☐ |
| 10 | p0-10 | Notificaciones → deep link chat/map | ☐ | ☐ |
| 11 | p0-11 | Publicar en Muro (texto + foto) | ☐ | ☐ |
| 12 | p0-12 | Guardar entreno → toast Compartir → Instagram | ☐ | ☐ |

## LIVE piloto — 5 pasos (`livePilotChecklist`)

| # | ID | Actor | Acción | Pass | A | B |
|---|-----|-------|--------|------|---|---|
| 1 | live-01 | A | Activar LIVE en gym real | Badge LIVE en perfil/mapa | ☐ | ☐ |
| 2 | live-02 | B | Abrir mapa misma ciudad | Marcador A <60 s | ☐ | ☐ |
| 3 | live-03 | B | Tap marcador → perfil | FullProfileSheet sin crash | ☐ | ☐ |
| 4 | live-04 | both | EntrenaSync ≥2 min | Arena estable; derby suma | ☐ | ☐ |
| 5 | live-05 | A | Desactivar LIVE | Desaparece mapa B; sin zombie | ☐ | ☐ |

## Extra v0.1.382 (multi-país)

| # | Flujo | Pass |
|---|-------|------|
| 13 | Onboarding → Perú/México/USA + ciudad | ☐ |
| 14 | Explorar filtros default: todos + edad 70 | ☐ |
| 15 | Dos testers misma ciudad se ven en Explorar | ☐ |

## Criterios beta (fase 450)

- Crash-free >99% (7 días)
- ≥10 testers por ciudad de lanzamiento
- ≥1 sync real/semana documentado
