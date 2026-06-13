# Oleada visual v2 — EntrenaMatch

**Estado:** Implementada en código (v0.1.330+). El piloto `VISUAL_PILOT_V1` fue promovido a permanente y extendido.

---

## Cambios incluidos

| Área | Qué hace |
|------|----------|
| **Explorar** | Card ~380px, tipografía mín. 10px, sin goals/teaser/RPG badges |
| **Perfil** | "Tu perfil", reto diario, sin pill dev "REAL • Firebase" |
| **Bottom nav** | 5 tabs por defecto (Squads desde Matches), labels 12px/10px |
| **Barra superior** | Chip LIVE legible + detalle en segunda línea |
| **Copy** | GymPulse/legado → Mapa LIVE / Muro de la Comunidad (`brandCopy.ts`) |
| **Hoy compacto** | Primeros **3 días**: sin Copa Zona, sin piloto strip, sin meta semanal |
| **Un solo FAB** | Con sesión activa: gadget de entreno absorbe LIVE (chip integrado) |
| **Modales** | Sin hint "Dos vistas en Hoy"; tour mapa solo tras día 2+ y 3s delay |
| **Tokens CSS** | `--em-brand`, `--em-live`, `--em-sync`, etc. en `index.css` |

---

## Archivos clave

- `src/constants/brandCopy.ts` — SSOT de copy visible
- `src/index.css` — tokens semánticos
- `src/components/app/BottomNav.tsx`
- `src/components/explore/ExploreTab.tsx`
- `src/components/workout/WorkoutSessionFab.tsx` — LIVE integrado
- `src/utils/profileProgressive.ts` — `HOME_COMPACT_DAYS = 3`

---

## Pendiente (siguiente iteración)

1. Screenshots Play alineados con UI naranja (no teal landing)
2. Barrido residual de `text-[7px]`/`text-[8px]` en mapa y arena
3. Migrar colores hardcoded a tokens `--em-*` progresivamente

---

*jun 2026*
