# EntrenaMatch — Roadmap 451–500

**Versión base:** v0.1.450 (open beta v1) · **Meta cierre:** v0.1.500 · **v1.1 multi-país**

Continúa `ROADMAP_FASES_381_450.md`. Misma convención: **1 fase = 1 entregable + test + deploy**. Oleadas de 10 fases alineadas con **tabs**, **mounts** y **dominios** de la app.

**Versión por fase:** `0.1.(450 + (N - 450))` → fase 451 = `0.1.451`, fase 500 = `0.1.500`.

---

## Mapa de la app → oleadas

| Área producto | Tab / módulo | Oleada |
|---------------|--------------|--------|
| Arquitectura | `App.tsx`, mounts, hooks | **H** 451–460 |
| Hoy + Muro | `HomeTab`, feed, Daily Pulse | **I** 461–470 |
| Mapa + LIVE | `MapExplorePanel`, GymPulse | **J** 471–480 |
| Explorar + Match | `ExploreTab`, swipe, filtros | **K** 481–490 |
| RED + Squads + Sesiones | `RedTab`, sync, grupos | **L** 491–500 |

---

## Oleada H — Arquitectura & deuda 398 (451–460)

Cierra la extracción de `App.tsx` (~12.6k → &lt;10k) y datos estáticos fuera del monolito.

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| **451** | `data/seedProfiles.ts` | `SEED_PROFILES` + `CHAT_OPENERS` fuera de App | ✅ v0.1.387 |
| **452** | `SquadOverlaysMount` | Crear squad + detalle + chat squad | ☐ |
| **453** | `GroupChatModalMount` | Chat grupal sesiones (~450 líneas) | ☐ |
| **454** | `SessionCreateModalMount` | Modal crear sesión entrenamiento | ☐ |
| **455** | `TrainingReviewModalMount` | Reseña post-entreno | ✅ v0.1.387 |
| **456** | `FeedCommentsModalMount` | Hilo comentarios muro full-screen | ☐ |
| **457** | `LegalPagesMount` + `ReportModalMount` | Legal + reportar usuario | ✅ v0.1.387 |
| **458** | `VerificationFlowMount` + `ModerationPanelMount` | Verificación facial + panel mod | ✅ v0.1.387 |
| **459** | `appLineCount.test.ts` | CI: `App.tsx` &lt; 12 500 líneas (interino) | ✅ v0.1.387 |
| **460** | `appOverlayRegistry` v3 | +9 overlays; test count 28 | ☐ |

**DoD oleada H:** `npm test` verde · `App.tsx` &lt; 12k · deploy web · commit `v0.1.460`.

---

## Oleada I — Dominio Hoy & Muro (461–470)

Tab **Hoy**: feed global, Daily Pulse, activación, composer.

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| **461** | `useHomeTabBridge` hook | Props facade HomeTab → App | ☐ |
| **462** | `HomeFeedOverlays` v2 | Composer + photo lightbox fuera de App | ☐ |
| **463** | Feed publish pipeline mount | `FeedPublishMount` (success + wizard) | ☐ |
| **464** | Daily Pulse card multi-país | Copy derby/pact por país en `brandCopy` | ☐ |
| **465** | Post-LIVE share banner v3 | Story + mapa + invite CTA unificado | ☐ |
| **466** | Muro personal lazy load | Paginación posts propios Firestore | ☐ |
| **467** | Echo posts ranking polish | Peso echo en `useFeedPipeline` tunable | ☐ |
| **468** | Home empty state v3 | CTA por ciudad piloto (PE/MX/US) | ☐ |
| **469** | Pull-to-refresh Hoy real | Sync feed + pulse en un gesto | ☐ |
| **470** | Tests dominio feed | Vitest `useFeedPipeline` + composer | ☐ |

**DoD oleada I:** Muro publica texto+foto en &lt;3 taps · feed carga en tab Hoy sin jank.

---

## Oleada J — Dominio Mapa & LIVE (471–480)

Tab **Mapa** + banner LIVE en Explorar: presencia, radar, motion.

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| **471** | LIVE zombie guard 72h | Auto-off + push opt-in (fase 411 carry) | ☐ |
| **472** | `cityZoneBounds` PE/MX/US | Zonas Lima, CDMX, LA, Miami | ☐ |
| **473** | Mapa radar copy locale | `brandCopy` distancia por país | ☐ |
| **474** | GymPulse tipos estrictos | Quitar `@ts-nocheck` mapa | ☐ |
| **475** | Clustering 150+ pins | Perf CDMX/Lima en MapLibre | ☐ |
| **476** | Ghost mode tooltip v2 | Educación privacidad en mapa | ☐ |
| **477** | Check-in QR multi-gym | Deep link `?gym=` por país | ☐ |
| **478** | LIVE motion badge | Score visible en marcador | ☐ |
| **479** | `useLiveMapPipeline` v2 | Menos props a `MapExplorePanelMount` | ☐ |
| **480** | LIVE pilot checklist auto | Script QA 5 pasos + métricas | ☐ |

**DoD oleada J:** LIVE visible en mapa &lt;60 s · 2 usuarios en misma ciudad se ven en radar.

---

## Oleada K — Dominio Explorar & Match (481–490)

Tab **Explorar** + celebración match: discovery, swipe, compatibilidad.

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| **481** | Match score breakdown UI | Expandible en `ExploreSwipeCard` | ☐ |
| **482** | Icebreakers desde overlap | Sugerencias post-match en chat | ☐ |
| **483** | Geo prompt v3 multi-país | Copy + preview km por país | ☐ |
| **484** | Seeds contextuales PE/MX/US | Demo por ciudad lanzamiento | ☐ |
| **485** | Derby multi-ciudad overlay | Lima vs CDMX opcional | ☐ |
| **486** | Invitar amigo `?ref=` | Deep link por país | ☐ |
| **487** | Sparse city banner v2 | CTA invitar por país | ☐ |
| **488** | Swipe undo 1×/día | Recuperar pass accidental | ☐ |
| **489** | Badge verificado en feed | Visible Muro + Explorar | ☐ |
| **490** | Filtro solo LIVE ↔ mapa | Toggle sincronizado | ☐ |

**DoD oleada K:** Deck ordenado red → distancia → compat · match abre chat con icebreaker.

---

## Oleada L — RED, Squads, Sync & v1.1 (491–500)

Tabs **Matches/Chat**, **Squads/Sesiones**, EntrenaSync + cierre v1.1.

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| **491** | Sync replay gallery perfil | Replays ordenados por fecha | ☐ |
| **492** | Share card sync v2 | PNG con CTA invite | ☐ |
| **493** | Network Power dashboard | Grafo RED en perfil | ☐ |
| **494** | Squad invite post-sync | 1-tap desde resumen sync | ☐ |
| **495** | Chat read receipts | Typing + seen polish | ☐ |
| **496** | Voice note streak badge | Retención chat | ☐ |
| **497** | Weekly Pact reminder push | Domingo opt-in | ☐ |
| **498** | Fuel × workout insight v2 | Post-pierna → proteína tip | ☐ |
| **499** | E2E Playwright 8 flujos | CI: auth, live, swipe, chat, sync | ☐ |
| **500** | **Release v1.1 multi-país** | `v0.1.500` web + Play open 100% | ☐ |

**DoD oleada L:** ≥1 sync real/semana documentado · crash-free &gt;99% · D7 baseline medido.

---

## Fases ops (paralelas, sin bump obligatorio)

| ID | Tarea | Cuándo |
|----|-------|--------|
| **OPS-382** | QA manual 17 ítems (`BETA_QA_382.md`) | Antes de 451 |
| **OPS-386** | Play internal AAB al día | Cada oleada H |
| **OPS-387** | Screenshots Play 8 capturas multi-país | Antes de 500 |
| **OPS-390** | Índice Firestore país+ciudad | Fase 451 o 484 |

---

## Orden de ataque recomendado

```
450 (open beta v1)
  → H 451–460  Arquitectura App.tsx
  → I 461–470  Hoy & Muro
  → J 471–480  Mapa & LIVE
  → K 481–490  Explorar & Match  (cierra oleadas C+D del 381–450)
  → L 491–500  RED/Sync + v1.1
```

**Paralelo posible:** ops 382/387 mientras corre oleada H.

---

## Convenciones (igual que 381–450)

| Paso | Comando / artefacto |
|------|---------------------|
| Test | `npm test` |
| Versión | `node scripts/version-check.mjs` |
| Deploy web | `npm run deploy` |
| Play internal | `.\publish-play.bat internal` |
| Piloto | `node scripts/pilot-cohort-report.mjs` |
| Commit | `v0.1.NNN: fase NNN — [título]` |
| Registry overlays | `src/utils/appOverlayRegistry.ts` |
| Mounts existentes | 14 en `src/components/**/**Mount.tsx` |

---

## Documentos relacionados

- `ROADMAP_FASES_381_450.md` — open beta v1 (oleadas A–G)
- `SISTEMA_IMPLEMENTACION_FASES.md` — DoD y ciclo de vida
- `P0_BETA_RELEASE.md` — checklist pre-451
- `GESTION_FASES_101_120.md` — piloto y monetización gated
