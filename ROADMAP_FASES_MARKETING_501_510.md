# EntrenaMatch — Roadmap Marketing & GTM (Fases 501–510)

**Versión base:** v0.1.385 · **Meta cierre:** v0.1.386 · **Estado:** ✅ cerrada

Oleada post-revisión marketing (jun 2026). Alinea mensaje, landing, app visible y Play sin nuevas features core.

**Preparación previa:** `PREPARACION_FASE_MARKETING_GTM.md` · oleada 331–340 ✅

---

## Bloque — Credibilidad & multi-país (501–503) · P0

| # | Fase | Entregable | P |
|---|------|------------|---|
| **501** | Landing ES sin stats inventadas | Quitar 94% / 3.2 km; pilares honestos | P0 |
| **502** | Landing ES multi-país | CL · PE · MX · US en hero y trust | P0 |
| **503** | Landing EN + `manifest.json` | Mapa LIVE, sin GymPulse ni v0.1.220 | P0 |

---

## Bloque — Copy visible en app (504–506) · P0

| # | Fase | Entregable | P |
|---|------|------------|---|
| **504** | `WhyEntrenaMatchStrip` | “Match por deporte y horario”, no solo gym | P0 |
| **505** | Retos diarios sin GymPulse | `dailyPulseCore` → “Reto Comunidad” | P0 |
| **506** | Stories workout hashtags | `#EntrenaMatch #MapaLIVE` en PNG share | P1 |

---

## Bloque — Activación & tienda (507–510) · P1–P2

| # | Fase | Entregable | P |
|---|------|------------|---|
| **507** | `BRAND_COPY` activación multi-país | Guía post-registro + meta description | P0 |
| **508** | Play assets doc v386 | `PLAY_MARKETING_v0.1.386.md` + `ASSETS.md` refresh | P1 |
| **509** | Test marketing copy | Vitest: 0 GymPulse user-facing en retos/share | P0 |
| **510** | Deploy web v0.1.386 | Firebase hosting + bump versión | P0 |

---

## DoD oleada 501–510

- [x] Landing sin métricas falsas ni testimonios con números inventados
- [x] Copy piloto = multi-país (no solo Viña × Santiago)
- [x] 0 strings “GymPulse” visibles al usuario en retos y stories
- [x] `npm test` verde
- [x] `npm run deploy`

## Comandos

```powershell
npm test
npm run deploy
node scripts/version-check.mjs
```
