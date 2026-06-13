# EntrenaMatch — Roadmap 381–450

**Versión actual:** v0.1.384 · **Meta:** open beta multi-país (CL · PE · MX · US)

Cada fase = entregable + test + deploy. Oleadas de 10 fases.

---

## Oleada A — Cierre beta piloto (381–390)

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| **381** | Lanzamiento multi-país | Registro CL/PE/MX/US + filtros edad 18–70 + distancia sin límite | ✅ v0.1.381 |
| **382** | QA beta 17 ítems | `betaReleaseChecklist` en 2 dispositivos + `BETA_QA_382.md` | 🔄 ops |
| **383** | Discovery normalizado | `profileDiscoveryQuery` — ciudad canónica + país | ✅ v0.1.382 |
| **384** | `ActivationGuideMount` | Guía post-registro fuera de App.tsx | ✅ v0.1.382 |
| **385** | Docs P0 actualizados | `P0_BETA_RELEASE.md` v0.1.382 | ✅ v0.1.382 |
| **386** | Play internal AAB 384 | `publish-play.bat internal` | 🔄 |
| **387** | Screenshots Play multi-país | 8 capturas + listing ES | ☐ ops |
| **388** | Piloto LIVE sábado | `livePilotChecklist` 5 pasos documentados | ☐ ops |
| **389** | `PROFILE_LIST_LIMIT` 120 | Más perfiles en Explorar | ✅ v0.1.384 |
| **390** | Firestore index país+ciudad | `firestore.indexes.json` discovery | ☐ |

---

## Oleada B — Extracción App.tsx (391–400)

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| **391** | `FeatureTourMount` | Tour primer uso fuera de App | ✅ v0.1.383 |
| **392** | `ExploreFiltersSheetMount` | Modal filtros Explorar | ✅ v0.1.383 |
| **394** | `MatchCelebrationMount` | Modal match | ✅ v0.1.383 |
| **396** | `useExploreDeck` hook | Deck filtrado + ordenado | ✅ v0.1.383 |
| **393** | `LiveNearModalMount` | Lista LIVE full-screen | ✅ v0.1.384 |
| **395** | `SafetyActionSheetMount` | Sheet reportar/bloquear | ✅ v0.1.384 |
| **397** | `useFeedPipeline` hook | feed ranking + filters | ☐ |
| **398** | App.tsx < 12k líneas | Medición + extracción batch | ☐ |
| **399** | `appOverlayRegistry` v2 | Todos los mounts registrados | ☐ |
| **400** | Tests mounts batch | Vitest por overlay | ☐ |

---

## Oleada C — Explorar & matches (401–410)

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| **401** | Match score breakdown UI | Expandible en card Explorar | ☐ |
| **402** | Icebreakers desde overlap | Mensajes sugeridos post-match | ☐ |
| **403** | Geo prompt v3 multi-país | Copy por país + preview km | ☐ |
| **404** | Seeds contextuales PE/MX/US | Demo por ciudad de lanzamiento | ☐ |
| **405** | Derby multi-ciudad | Lima vs CDMX overlay opcional | ☐ |
| **406** | Invitar amigo deep link | `?ref=` por país | ☐ |
| **407** | Sparse city banner v2 | CTA por país | ☐ |
| **408** | Swipe undo 1x/día | Recuperar pass accidental | ☐ |
| **409** | Perfil verificado badge feed | Visible en Muro/Explorar | ☐ |
| **410** | Explorar solo LIVE toggle polish | Filtro mapa sincronizado | ☐ |

---

## Oleada D — Mapa & LIVE (411–420)

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| **411** | LIVE zombie guard 72h | Auto-off + notif | ☐ |
| **412** | Mapa radar 2 km multi-país | `brandCopy` por locale | ☐ |
| **413** | GymPulse `@ts-nocheck` off | Tipos estrictos mapa | ☐ |
| **414** | City zone bounds PE/MX/US | `cityZoneBounds` expandido | ☐ |
| **415** | LIVE modal sort default dist | Siempre más cerca primero | ☐ |
| **416** | Post-LIVE share banner v2 | Story + mapa CTA | ☐ |
| **417** | Map clustering 150+ pins | Perf en CDMX/Lima | ☐ |
| **418** | Ghost mode tooltip v2 | Educación privacidad | ☐ |
| **419** | Check-in QR multi-gym | Deep link gym por país | ☐ |
| **420** | LIVE motion score visible | Badge en marcador | ☐ |

---

## Oleada E — Social & sync (421–430)

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| **421** | Sync replay gallery perfil | Replays ordenados por fecha | ☐ |
| **422** | Share card sync v2 | CTA invite en PNG | ☐ |
| **423** | Network Power dashboard | Grafo RED en perfil | ☐ |
| **424** | Squad invite post-sync | 1-tap desde resumen | ☐ |
| **425** | Chat read receipts polish | Typing + seen | ☐ |
| **426** | Voice note streak badge | Retención chat | ☐ |
| **427** | Weekly Pact reminder push | Domingo opt-in | ☐ |
| **428** | Derby story share v2 | Multi-país template | ☐ |
| **429** | City celebration modal v2 | PE/MX/US copy | ☐ |
| **430** | Moments reel semanal | Highlights auto | ☐ |

---

## Oleada F — Fuel & coach (431–440)

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| **431** | Fuel × workout insight v2 | Post-pierna → proteína | ☐ |
| **432** | Fuel retake foto | Re-analizar comida | ☐ |
| **433** | Wearable auto-sync polish | Health Connect/iOS | ☐ |
| **434** | Coach calendario cliente | Vista reservas | ☐ |
| **435** | Dispatch ETA PT mapa | En camino visible | ☐ |
| **436** | Monetización gate v2 | `pilotFeatureFlags` multi-país | ☐ |
| **437** | MP producción QA | Webhook + retry pago | ☐ |
| **438** | PT dashboard ingresos | Self-service comisiones | ☐ |
| **439** | Fuel reporte semanal push | Domingo resumen macros | ☐ |
| **440** | EntrenoLog PRs sync | Records en perfil | ☐ |

---

## Oleada G — Open beta launch (441–450)

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| **441** | Crash-free >99% 7 días | Play internal métricas | ☐ |
| **442** | ≥10 testers / ciudad lanzamiento | Scripts cohorte | ☐ |
| **443** | ≥1 sync real/semana documentado | `pilot-sync-report` | ☐ |
| **444** | ASO Play ES + EN | Listing multi-país | ☐ |
| **445** | Landing ES/EN | `landing.html` refresh | ☐ |
| **446** | Open beta track Play | Promote internal → open | ☐ |
| **447** | `OPEN_BETA_INFORME.md` | Métricas D1/D7 | ☐ |
| **448** | App.tsx < 8k líneas | Meta fase 100 | ☐ |
| **449** | E2E Playwright 5 flujos | CI verde | ☐ |
| **450** | **Release open beta v1** | v0.1.450 · deploy web + Play | ☐ |

---

## Orden de ataque inmediato

1. **382** — QA manual 17 ítems (2 teléfonos)
2. **386** — AAB Play internal 382
3. **391–400** — Extracción mounts (reducir App.tsx)
4. **401–410** — Explorar multi-país polish
5. **441–450** — Cierre open beta

## Comandos

```powershell
npm test
npm run deploy
.\publish-play.bat internal
node scripts/pilot-cohort-report.mjs
```
