# Informe de cierre — Open Beta v1 (Fases 75–100)

**Proyecto:** EntrenaMatch  
**Versión de referencia:** `0.1.284` (versionCode 284)  
**Fecha del informe:** 9 de junio de 2026  
**Rama:** `main`  
**Deploy web:** https://entrenamatch.web.app · https://musclegrenadechile.github.io/entrenamatch/  
**Documento maestro:** `GESTION_FASES_1_100.md`

---

## 1. Resumen ejecutivo

EntrenaMatch completó **97 de 100 fases** del roadmap unificado (fases 1–74 legado + 75–99 oleadas A–D). El producto entrega un loop social-fitness funcional: **mapa LIVE (GymPulse) + EntrenaSync en tiempo real + Fuel + pacto semanal + reto por ciudad + share post-sync**.

La **Fase 100 (open beta v1)** queda **parcialmente cerrada en código** pero **no cerrada en validación de producto**: faltan métricas de Play internal (crash-free), evidencia de sync real en piloto Viña/Santiago, y reducción de `App.tsx` bajo 8.000 líneas.

**Veredicto:** Beta técnica lista para piloto cerrado; beta de producto pendiente de medición con usuarios reales.

| Dimensión | Estado |
|-----------|--------|
| Features fases 75–99 | ✅ Implementadas |
| CI / tests / build | ✅ Verde local y en GitHub Actions |
| Deploy Firebase + GH Pages | ✅ Automático en push `main` |
| Estabilidad EntrenaSync | ✅ Fixes v0.1.280–281 |
| Fase 100 DoD completo | 🔄 1/5 criterios documentales; 0/4 operativos |

---

## 2. Versiones y artefactos

| Artefacto | Valor |
|-----------|-------|
| `APP_VERSION` / `package.json` | **0.1.281** |
| Android `versionCode` | **281** |
| Android `versionName` | **0.1.281** |
| Últimos commits relevantes | `dcb37b6` (fix crash sync) · `da059b0` (filtro ejercicios Arena) |
| Tests Vitest | **118/118** (30 archivos) |
| Build producción | ✅ `tsc --noEmit && vite build` |
| App chunk (gzip baseline) | ~171 KB (`scripts/bundle-size-baseline.json`) |
| `App.tsx` líneas | **13.059** (meta fase 100: <8.000) |

---

## 3. Cierre por oleada (fases 75–99)

### Oleada A — Confianza técnica (75–84)

| Fase | Entregable | Versión ref. | Estado informe |
|------|------------|--------------|----------------|
| 75 | `livePresence` fuente primaria | v0.1.264 | ✅ Código + tests; auditar fallback `trainingNow` en perfiles |
| 76 | GymPulseMap tipos estrictos | — | 🔄 Props tipados; `@ts-nocheck` pendiente en `GymPulseMap.tsx` |
| 77 | CI vitest en PR | v0.1.264 | ✅ `.github/workflows/ci.yml` |
| 78 | Vitest mapa | v0.1.264 | ✅ |
| 79 | `useChatSession` | v0.1.264 | ✅ Extraído de App |
| 80 | `useFeedState` | v0.1.264 | ✅ Extraído de App |
| 81 | App.tsx < 10k | — | 🔄 **13.059 líneas** — extracción insuficiente |
| 82 | Bundle budget CI | v0.1.264 | ✅ `scripts/check-bundle-size.mjs` |
| 83 | Firestore rules tests | v0.1.264 | ✅ |
| 84 | E2E smoke CI | v0.1.264 | ✅ Smoke básico; no cubre sync/mapa profundo |

### Oleada B — Mapa hero + Perfil (85–91)

| Fase | Entregable | Versión ref. | Estado informe |
|------|------------|--------------|----------------|
| 85 | City challenge overlay (hex) | v0.1.271 | ✅ Mapa + `cityZoneBounds.ts` |
| 86 | Deep link check-in `?gym=id` | v0.1.271 | ✅ Código; QA dispositivo pendiente |
| 87 | MapLibre GL opt-in | v0.1.271 | 🔄 Código listo; **no activo en build prod** (`VITE_MAP_USE_MAPLIBRE=1`) |
| 88–90 | Perfil progresivo / hero / sin ruido | v0.1.271 | ✅ |
| 91 | Map view cache | v0.1.271 | ✅ |

### Oleada C — Fuel + EntrenoLog (92–95)

| Fase | Entregable | Versión ref. | Estado informe |
|------|------------|--------------|----------------|
| 92 | Fuel wizard ≤3 preguntas | v0.1.275 | ✅ |
| 93 | Fuel card siempre en Hoy | v0.1.275 | ✅ |
| 94 | Gráfico semanal burn vs consumo | v0.1.275 | ✅ + dominio `fuelBalance/` |
| 95 | PRs por ejercicio | v0.1.275 | ✅ |

### Oleada D — Social viral + red (96–99)

| Fase | Entregable | Versión ref. | Estado informe |
|------|------------|--------------|----------------|
| 96 | Share card post-sync | v0.1.279 | ✅ `SyncDuelSummary` + `downloadSyncStory`; validar 1-tap móvil |
| 97 | Deep links notificaciones | v0.1.279 | ✅ `pushNavigation.ts` + tests |
| 98 | Chat read receipts + typing | v0.1.279 | ✅ `chatPresence.ts`; lógica aún en App |
| 99 | Training Network grafo | v0.1.279 | ✅ Perfil |

### Mapa 2.0 (roadmaps 101–110, absorbidos)

| Bloque | Estado |
|--------|--------|
| 101–105 Fullscreen, dark tiles, cluster, markers, bottom sheet | ✅ v0.1.231+ |
| 106–110 Partner POI, halos, navigate, popups React, marker diff | ✅ v0.1.233+ |

---

## 4. Criterios de salida Fase 100 — checklist honesto

| # | Criterio | Meta | Estado | Evidencia / gap |
|---|----------|------|--------|-----------------|
| 1 | Crash-free sessions | >99% (7 días Play internal) | 🔄 | AAB **v0.1.281** publicado en track `internal` (9 jun 2026); medir Crashlytics 7 días — ver `PLAY_INTERNAL_v0.1.281.md` |
| 2 | Sync real piloto | ≥1 sync/semana entre 2 usuarios distintos (Viña o Santiago) | 🔄 | Instrumentado en `pilotSyncMetrics` (v0.1.282+) — consultar `pilotWeeklyMetrics` / `scripts/pilot-sync-report.mjs` |
| 3 | CI verde | vitest + E2E smoke + rules emulator | 🔄 | CI en PR/push `main` ✅; E2E = smoke superficial; rules en vitest ✅ |
| 4 | `App.tsx` < 8.000 líneas | <8.000 | ❌ | **13.059** líneas |
| 5 | `OPEN_BETA_INFORME.md` | Este documento + 20 pasos post-100 | ✅ | Completado jun 2026 |

**Fase 100:** 🔄 **Cerrada en documentación** · **Abierta en validación operativa**

---

## 5. Métricas técnicas (snapshot jun 2026)

```
Tests:           118 passed / 118
Test files:      30
Build:           OK (Vite 8 + tsc)
CI jobs:         vitest → build → bundle budget → e2e-smoke
Firestore rules: contract tests (livePresence, posts, messages, cityWeeklyStats)
E2E:             e2e/smoke.spec.ts (shell, demo login, nav Hoy, Fuel card)
App.tsx:         13.059 LOC
@ts-nocheck:     App.tsx, GymPulseMap.tsx, ExploreLivePanel, useFilters, useSquads, useSessions, constants, capacitor-plugins
```

### Fixes post–v0.1.279 (no reflejados en GESTION hasta este informe)

| Versión | Fix |
|---------|-----|
| v0.1.280 | Crash EntrenaSync `(n \|\| []) is not iterable` — `mergeLiveUsersById` + normalización legacy |
| v0.1.281 | Filtro ejercicios Arena por grupo muscular; tab Cardio incluye Full body; extras de sesión sin contaminar filtros |

---

## 6. Estado por área de producto

| Área | Madurez | Notas |
|------|---------|-------|
| **GymPulse / mapa** | Alta | Map 2.0 completo; MapLibre opt-in sin activar en prod |
| **EntrenaSync** | Media-alta | Estable tras fixes; falta QA 2 dispositivos sistemático |
| **Fuel / FuelBalance** | Alta | Wizard + dominio `computeDailyEnergyBalance` + tests |
| **EntrenoLog / PRs** | Media | Biblioteca ejercicios; EntrenaLog sin filtro Cardio+Full body unificado |
| **City challenge** | Media | `cityWeeklyStats` Firestore + hex mapa + `CityChallengeV2`; sin duelo Viña vs Santiago UI |
| **Chat / matches** | Media-alta | Hooks extraídos; typing/read en Firestore |
| **Marketplace / MP** | Baja | Checkout stub; sin Mercado Pago producción |
| **EntrenaCoach / PT** | Baja | Dispatch stub; dashboard partner simulado |
| **Android / Play** | Media | Scripts publish; último informe P0 en v0.1.147 — desactualizado |

---

## 7. Deuda técnica prioritaria (heredada + activa)

1. **`App.tsx` monolito** — bloquea fase 81 y criterio fase 100.
2. **`@ts-nocheck`** en 8 archivos — fase 76 incompleta.
3. **Documentación dispersa** — `CURRENT_ROADMAP`, `ORDEN_ATAQUE_111_160`, `P0_BETA_RELEASE` con versiones antiguas.
4. **E2E insuficiente** — no protege flujo sync ni mapa LIVE.
5. **Métricas de producto** — sin dashboard DAU/D1/D7/syncs por ciudad.
6. **`livePresence` vs `trainingNow`** — consolidación fase 75 requiere auditoría final en `gymPulseLive.ts`.

---

## 8. Riesgos para open beta

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Pocos usuarios por ciudad | Reto ciudad y mapa vacíos | Piloto cerrado Viña + Santiago, 50–200 MAU |
| Regresiones en App monolito | Crashes en sync/map | CI + extracción Arena; Play internal |
| Dispersión de features | Usuario no entiende valor | Simplificar Hoy: ciudad + LIVE + sync |
| Marketplace/Coach visibles | Ruido, expectativas falsas | Ocultar o colapsar hasta post-piloto |
| Docs desactualizados | Decisiones erróneas | `GESTION_FASES_1_100.md` + este informe como fuente única |

---

## 9. Próximos 20 pasos post-100

Priorizados por impacto en tracción y cierre de beta real.

| # | Paso | Tipo | Prioridad |
|---|------|------|-----------|
| 1 | Subir **AAB v0.1.281** a Play **internal** | Ops | ✅ 9 jun 2026 |
| 2 | Activar monitoreo **Crashlytics** 7 días; registrar crash-free % | Ops | 🔄 En curso — ver `PLAY_INTERNAL_v0.1.281.md` |
| 3 | Instrumentar métrica **syncs reales/semana** por ciudad (Firestore o Analytics) | Producto | ✅ `pilotSyncSessions` + `pilotWeeklyMetrics` |
| 4 | Lanzar piloto cerrado **Viña + Santiago** (50–200 usuarios) | Growth | ✅ Ver `PILOTO_VINA_SANTIAGO.md` + `PilotProgramStrip` |
| 5 | **Derby Viña vs Santiago** — UI duelo semanal (barras + mapa) | Producto | ✅ `cityDerby` + `CityDerbyCard` + overlay mapa |
| 6 | Extraer bloque **EntrenaSync/Arena** de `App.tsx` | Técnico | P0 |
| 7 | Quitar `@ts-nocheck` de **GymPulseMap.tsx** (cerrar fase 76) | Técnico | P0 |
| 8 | E2E ampliado: demo → mapa → iniciar sync (mock) | QA | P1 |
| 9 | Activar **MapLibre** en build prod (`VITE_MAP_USE_MAPLIBRE=1`) | Producto | P1 |
| 10 | Post-sync share **opt-out** con métrica de publicación | Growth | P1 |
| 11 | Simplificar tab **Hoy** — una historia: ciudad + LIVE + sync | UX | P1 |
| 12 | Alinear filtro **EntrenaLog** con Arena (Cardio + Full body) | Bug | P1 |
| 13 | QA matriz **P0_BETA_RELEASE** actualizada a v0.1.281 | QA | P1 |
| 14 | Ocultar **marketplace / admin / coach** del nav principal | UX | P1 |
| 15 | Actualizar **PLAY_OPEN_BETA.md** y listing Play ES+EN | Ops | P1 |
| 16 | Push derby: "Tu rival te superó" 2×/semana | Growth | P2 |
| 17 | Badge **Defensor de [ciudad]** por minutos aportados | Retención | P2 |
| 18 | **Mercado Pago producción** — 1 producto test | Monetización | P2 |
| 19 | Partner gym **dashboard real** (check-ins Firestore) | B2B | P2 |
| 20 | Crear **`GESTION_FASES_101_120.md`** — derby + loop viral + métricas | Planificación | P2 |

---

## 10. Definición de “beta cerrada con éxito”

La open beta v1 se considerará **cerrada operativamente** cuando se cumplan **todos**:

- [ ] Crash-free ≥ 99% durante 7 días consecutivos (Play internal, v0.1.281+)
- [ ] ≥ 10 syncs reales/semana en piloto (Viña o Santiago, usuarios distintos)
- [ ] D7 retention ≥ 20% en cohorte piloto (mínimo 30 usuarios activos)
- [ ] Derby ciudad visible y ≥ 30% de MAU aporta minutos al reto
- [ ] `App.tsx` < 10.000 líneas (hito intermedio; < 8.000 como meta stretch)

---

## 11. Comandos de verificación (reproducibles)

```powershell
cd C:\Users\muscl\fitvina
npm test
npm run build -- --base=/entrenamatch/
node scripts/check-bundle-size.mjs
# Play internal (requiere keystore + service account):
.\publish-play.bat internal
# Deploy hosting:
npx -y firebase-tools@latest deploy --only hosting
```

---

## 12. Referencias

| Documento | Uso |
|-----------|-----|
| `GESTION_FASES_1_100.md` | Planificación fases 75–100 |
| `P0_BETA_RELEASE.md` | Matriz QA (actualizar a 0.1.281) |
| `PLAY_OPEN_BETA.md` | Play listing y comandos |
| `DIAGNOSTICO_FASES_71+.md` | FuelBalance y deuda 31–70 |
| `ROADMAP_FASES_101_105.md` / `106_110.md` | Mapa 2.0 (implementado) |

---

*Informe generado como entregable Fase 100 — EntrenaMatch open beta v1. Próxima revisión recomendada: tras 7 días de Play internal con v0.1.281.*
