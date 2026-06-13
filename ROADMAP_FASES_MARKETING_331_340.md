# EntrenaMatch — Roadmap Marketing & GTM (Fases 331–340)

**Versión base:** v0.1.330 · **Meta cierre:** v0.1.340 · **Estado:** ✅ Cerrada jun 2026  
**Preparación:** `PREPARACION_FASE_MARKETING_GTM.md`  
**Orden de ataque:** `ORDEN_ATAQUE_MARKETING.md`

Cada fase = **1 entregable de copy/posicionamiento/GTM** verificable (commit + deploy web; Play cuando aplique).

---

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ⏳ | Pendiente |
| 🔄 | En progreso |
| ✅ | Completada + deploy |
| **P0–P2** | Prioridad marketing |

---

## Bloque — Marca & mensaje (331–333) · P0

| # | Fase | Área | P | Estado |
|---|------|------|---|--------|
| 331 | Mensaje inclusivo multi-deporte en `BRAND_COPY` | Marca | P0 | ✅ |
| 332 | Glosario user-facing — eliminar GymPulse/Leyenda/ritual visible | Marca | P0 | ✅ |
| 333 | `TRAINING_OPTIONS` + chips: Fútbol, Pádel, Rugby, Básquet, Tenis, Otro | Producto/copy | P0 | ✅ |

**Done cuando:** pitch menciona deportes de equipo; onboarding permite elegirlos; 0 strings “GymPulse” visibles al usuario.

---

## Bloque — Primera impresión (334–335) · P0–P1

| # | Fase | Área | P | Estado |
|---|------|------|---|--------|
| 334 | Re-activar intro onboarding “Qué es EntrenaMatch” (3 pilares) antes del form | Activación | P1 | ✅ |
| 335 | Landing honesta — sin stats inventadas; piloto + deportes inclusivos | Adquisición | P0 | ✅ |

**Done cuando:** usuario nuevo entiende producto en <30 s; landing no contradice app vacía.

---

## Bloque — Tienda & distribución (336–337) · P0–P1

| # | Fase | Área | P | Estado |
|---|------|------|---|--------|
| 336 | Play Store ES unificado + spec screenshots UI actual (naranja #FF671F) | Play | P0 | ✅ |
| 337 | Invites/share copy: club / equipo / cancha (no solo gym) | Viral | P1 | ✅ |

**Done cuando:** listing copy pegable en Console; QR invite neutro multi-deporte.

---

## Bloque — GTM operativo (338–340) · P1–P2

| # | Fase | Área | P | Estado |
|---|------|------|---|--------|
| 338 | `GUIA_EMBAJADORES.md` — 1 página para clubes/canchas/gyms | Ops | P1 | ✅ |
| 339 | Empty states inclusivos (mapa, explorar, muro) | UX/copy | P1 | ✅ |
| 340 | Plantilla release notes user-facing + checklist QA marketing pre-Play | Ops | P2 | ✅ |

**Done cuando:** embajador tiene script de 30 s; cada release Play tiene “qué notarás” en español claro.

---

## Detalle por fase

### 331 — BRAND_COPY inclusivo
- Actualizar: `pitch`, `pitchShort`, `metaDescription`, `explore.*`, `activation.*`, `liveMap.empty*`
- Añadir bloque opcional `brandCopy.sportsExamples` para reutilizar en UI
- Test: snapshot o test de strings clave

### 332 — Glosario visible
- `grep` user-facing: GymPulse, Leyenda, ritual, Red Power → reemplazar
- Toasts en `App.tsx` que digan “Muro del GymPulse”
- Mantener identificadores de código (`GymPulseMap.tsx`) sin rename

### 333 — Deportes onboarding
```ts
// Propuesta TRAINING_OPTIONS ampliado
'Pesas/Gym', 'Running', 'Fútbol', 'Pádel', 'Rugby', 'Básquet', 'Tenis',
'Calistenia', 'CrossFit', 'Yoga', 'Funcional', 'Boxeo', 'Ciclismo', 'Natación', 'Pilates', 'Otro'
```
- Chips scroll horizontal si >10
- Demo seeds con al menos 2 perfiles pádel/fútbol

### 334 — Intro onboarding
- `showIntroStep = true` en create mode (no edit)
- 3 cards: Mapa LIVE · Match · EntrenaSync
- CTA: “Crear mi perfil” → paso 0 actual

### 335 — Landing
- Hero + stats bar honestos
- Sección deportes: íconos fútbol/pádel/running/gym
- CTA: entrenamatch.web.app + Play beta

### 336 — Play Store
- Crear/actualizar `PLAY_STORE_ASSETS.md` en raíz (symlink o copia de `assets/play-store/ASSETS.md`)
- Short ≤80 chars; full ES; “What’s new” plantilla user-facing
- Feature graphic prompt: naranja/rosa, no teal

### 337 — Invites
- `BRAND_COPY.gymInvite` → textos neutros “equipo/zona”
- Share text: incluir deporte genérico
- Referral card en Explorar

### 338 — Embajadores
- 1 página PDF/markdown: elevator pitch 30 s, QR, 3 objeciones, CTA LIVE
- Separado de `BETA_TESTERS_GUIDE.md` (técnico)

### 339 — Empty states
- Mapa, Explore, Feed empty — “cancha, pista, club, costanera”
- Copa Zona empty — “invita a tu equipo”

### 340 — Release & QA
- `PLAY_INTERNAL_TEMPLATE.md` con sección “Para testers”
- Checklist: glossary, deportes, landing, Play, health features Console

---

## Comandos

```powershell
npm test
npm run build
npm run deploy
npm run version:check
```

---

*Roadmap marketing — jun 2026. No reemplaza roadmaps técnicos (perf, mapa, App.tsx).*
