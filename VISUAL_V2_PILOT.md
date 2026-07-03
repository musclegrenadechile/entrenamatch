# Visual 2.0 — Piloto COMPLETO ✅

**Live:** https://entrenamatch.web.app  
**Versión cierre:** v0.1.468
**Font:** Plus Jakarta Sans (global con `.em-visual-v2`)

## Changelog público (340 → 360)

| Oleada | Capa | Detalle |
|--------|------|---------|
| 340–341 | **Design system** | `emVisualV2.css` — tokens, badges, cards, nav polish |
| 340–341 | **App shell** | `.em-visual-v2` en `app-container` |
| 340–341 | **Explorar** | Card flagship, match ring glass, map CTA glow |
| **342** | **Top bar** | Glass + chip LIVE con glow |
| **342** | **Hoy** | Hero «¿Quién entrena cerca?», CTA mapa, reto del día v2 |
| **343** | **Mapa LIVE** | Pills, overlays, leyenda, filtros v2 |
| **344** | **Auth** | Plus Jakarta + card glass v2 |
| **345** | **Hoy + Perfil** | «Más de tu día» colapsable; fondo v2 en Perfil |
| **346** | **Matches** | Cards premium, Red sub-nav v2 |
| **347** | **Entreno de Hoy** | Modal v2, biblioteca colapsable |
| **348** | **Landing** | Tailwind build (`landing-v2.css`), sin métricas fake |
| **349** | **Perfil** | Hero atleta + tabs Actividad / Red / Ajustes |
| **350** | **Polish global** | `EmV2EmptyState`, skeletons shimmer |
| **351** | **Nav + transiciones** | Bottom nav v2, `EmV2TabShell` |
| **352** | **Onboarding** | Tour 5 pasos + activation guide v2 |
| **353** | **Cierre** | Sesiones, Squads, Notificaciones, match modal v2; changelog landing |
| **354** | **Modales backlog** | FullProfileSheet, filtros Explorar, páginas legales v2 |
| **355** | **Cards Squads/Sesiones** | `em-v2-card` compartida, fuel banner, CTAs inline |
| **356** | **Overlays post-piloto** | LIVE cerca, verificación biométrica, reseña entreno v2 |
| **357** | **Seguridad + muro** | Moderación, sheet reportar/bloquear, captura facial, composer muro v2 |
| **358** | **Perfil + Explorar** | Ajustes/Red cards v2, mini-cards recomendaciones, LIVE pills, onboarding CTA |
| **359** | **Secundarios** | GymSound, wearable Hoy, admin community cards v2 |
| **360** | **Cierre post-piloto** | Mount components wired (legal, report, verify, moderación, reseña); form sheets + sync memory modals v2 |
| **361** | **Entreno polish** | Cards training v2, resumen semanal visible en Hoy, gym-log interior tokens, perfil empty states |
| **362** | **Entreno deep** | Arena Sync v2, dictado por voz tokens, banner post-guardar Share+Fuel |
| **363** | **EntrenoPlan + FAB** | WeeklyPlan v2 visible en Hoy, Fuel×entreno, FAB sesión v2, tutorial Arena 15s |
| **364** | **Entreno gym-log** | Rest timer v2, repetir entreno v2, EntrenaPlan empty solo día 1, lazy SyncArena, typo pulse/witness |
| **365** | **Entreno arena + UX** | LiveRoutines + GymSound v2, banner post-guardar sticky, footer modal colapsable móvil, tests rest preset |
| **366** | **Entreno micro-UX** | Meta chip + combo v2, banner entrada animada, FAB colapsa acciones al abrir modal, tests Fuel EntrenaPlan |
| **367** | **Entreno arena + Fuel** | Dock/set stepper v2, haptic rest timer, sparkline semanal, banner → prefill Fuel log |
| **368** | **Entreno cards + PR** | PR strip + post card v2, arena picker v2, macros sugeridos Fuel, confetti PR al guardar |
| **369** | **Cierre pulido entreno** | Share sheet v2, reacciones muro v2, badge Nuevo PR en banner, changelog landing 361–369 ✅ |
| **370** | **Entreno post-cierre** | Draft banner v2, GymSound modal v2, bubble sync flotante v2, marcador duel + FOMO strip en Arena, tests meta |
| **371** | **Entreno overlays** | SyncDuelSummary overlay v2, historial Perfil con chips PR/Sync, tests workoutHistoryBadges |
| **372** | **Entreno micro-UX** | Sparkline volumen en historial Perfil, banner sesión recuperada v2 en modal, reseña post-entreno stars v2 |
| **373** | **Entreno gadget + progreso** | Barras progreso ejercicio v2 en Perfil, FAB autosave con bloques/edad, tests workoutFabDraftMeta |
| **374** | **Gym-log biblioteca** | Filtros músculo/tipo v2, empty states picker+biblioteca, badge Sync en repetir entreno |
| **375** | **Gym-log series** | Set rows v2 unificadas, resumen volumen por ejercicio, búsqueda sin resultados, tests gymLogDisplay |
| **376** | **Gym-log UX móvil** | Steppers +/- en series (móvil), sugerencias recientes en búsqueda vacía, tests gymLogSetStep |
| **377** | **Gym-log duplicar serie** | Botón copiar serie anterior en cada fila, add-set unificado con copyWorkoutSetValues, tests gymLogDuplicateSet |
| **378** | **E2E entreno** | Harness openWorkout/openReview, workout-flow.spec Playwright, checklist e2eWorkoutScenarios |
| **379** | **E2E flujo completo** | training-full-flow.spec (entreno→sync→reseña), closeArena harness, CI Playwright ampliado |
| **380** | **E2E entreno→Fuel** | workout-fuel-flow.spec, harness Fuel + banner post-guardar, dialog Fuel accesible |
| **381** | **E2E mega entreno** | training-mega-flow.spec (entreno→Fuel→sync→reseña), closeFuelLogModal harness |
| **382** | **Cierre E2E entreno** | Inventario e2eTrainingSuite, docs bloque 378–381, landing changelog E2E CI |
| **383** | **Gym-log progreso sesión** | Chip sesión en vivo, barra progreso por ejercicio, tests gymLogSessionDisplay |
| **384** | **Gym-log PR en vivo** | Badge 🏆 por serie + chip sesión con PRs, tests gymLogLivePR, E2E workout-flow |
| **385** | **Gym-log feedback PR** | Haptic + micro-confetti al nuevo PR, chip compacto en footer móvil, tests gymLogPRFeedback |
| **386** | **Gym-log hint PR** | «+5 kg vs 70 kg» / primer récord bajo serie PR, tests gymLogLivePRHint, E2E workout-flow |
| **387** | **Cierre gym-log vivo** | Inventario gymLogTrainingSuite, chip sesión en FAB minimizado, bloque 383–386 ✅ |
| **388** | **E2E FAB entreno** | workout-fab-flow.spec, harness FAB, borrador demo, CI 5 specs entreno |
| **389** | **FAB chat-strip** | Chip sesión en strip de chat + cierre E2E ampliado 378–388 ✅ |
| **390** | **Post-entreno UX** | Hints dinámicos reseña + resumen sesión en banner guardado, tests trainingReviewDisplay |
| **391** | **E2E post-entreno** | workout-flow: banner sessionSummary + hints reseña; harness getWorkoutSaveBannerSessionSummary |
| **392** | **Fuel balance banner** | Hint macros sugeridos + proteína restante en banner; E2E workout-fuel-flow ampliado |
| **393** | **Fuel prefill entreno** | Macros sugeridos en modal Fuel + chip «Sugerido del entreno»; E2E mega/fuel-flow |
| **394** | **Cierre post-entreno** | Inventario postWorkoutTrainingSuite, harness getFuelLogPrefillMacros, bloque 390–394 ✅ |
| **395** | **Historial PR** | Resumen compacto en filas, kicker «N con PR», aria badges, tests workoutHistoryDisplay |
| **396** | **Sparkline PR** | Puntos dorados en sparkline de historial cuando la sesión tiene PR, tests sparkline data |
| **397** | **Cierre historial** | Inventario workoutHistoryTrainingSuite + aria-label sparkline, bloque 395–397 ✅ |
| **398** | **Mega pulido entreno** | Inventario trainingPolishSuite unifica gym-log, FAB, post-entreno e historial 383–397 ✅ |
| **399** | **Puente E2E↔pulido** | e2eTrainingPolishBridge mapea specs 378–394 → oleadas pulido; mega bloque 378–397 |
| **400** | **E2E historial Perfil** | workout-history-flow.spec, harness historial, demo history en Perfil; puente 395–397 |
| **401** | **EntrenaPlan × historial** | Hint PR reciente en WeeklyPlanCard; weeklyPlanHistoryDisplay + entrenaPlanTrainingSuite |
| **402** | **E2E EntrenaPlan×historial** | workout-plan-history-flow.spec guardar→hint PR; harness seedDemoFuelProfile |
| **403** | **Mega cierre 361–402** | trainingMegaSuite unifica polish-v1, E2E, polish-v2 y EntrenaPlan×historial |
| **404** | **EntrenaPlan rotación PR** | weeklyPlanPrRotation evita repetir músculo con PR; merge historial demo |
| **405** | **E2E rotación + mega** | workout-plan-history valida nota rotación; training-mega-flow con EntrenaPlan hint |
| **406** | **Cierre inventarios** | trainingPolishV1Suite (361–377), trainingPolishSuite + entrena-plan (383–405), mega E2E rotación |
| **407** | **Historial×EntrenaPlan** | Chip rotación PR visible en card; E2E Perfil guardar → hint + rotación en Hoy |
| **408** | **E2E chip rotación + aria** | plan-history y mega-flow validan chip; aria «tras PR en X: siguiente sesión Y» |
| **409** | **Cierre EntrenaPlan×historial** | e2ePlanRotationCoverage (3 specs); bloque 401–409 cerrado; chip oculto en rest/cardio |

## Mega entrenamiento (361–409) ✅

Inventario `trainingMegaSuite`: 4 sub-bloques (pulido I 361–377, E2E 378–409, pulido II 383–409, EntrenaPlan×historial 401–409). 49 oleadas documentadas; puente E2E↔pulido vía `e2eTrainingPolishBridge`.

## EntrenaPlan × historial (401–409) ✅

Chip dorado con PR del último entreno (≤7 días) en EntrenaPlan cuando la recomendación es fuerza/cardio. Chip índigo de rotación PR visible solo en fuerza, con aria descriptiva. Rotación evita repetir el tipo de entreno del músculo con PR reciente. E2E consolidado `e2ePlanRotationCoverage` (plan-history, mega-flow, history-flow). Bloque cerrado oleada 409. Utils: `weeklyPlanHistoryDisplay`, `weeklyPlanRotationDisplay`, `weeklyPlanPrRotation`, `entrenaPlanTrainingSuite`.

## Pulido entrenamiento II (383–409) ✅

Mega-inventario `trainingPolishSuite`: gym-log en vivo (383–387), FAB sesión (387–389), post-entreno (390–394), historial PR (395–397), EntrenaPlan×historial (401–409). 27 oleadas, 5 sub-bloques cerrados.

## Historial entreno (395–397) ✅

Resumen compacto, badges PR, sparkline con puntos dorados y aria accesible. Utils: `workoutHistoryDisplay`, `workoutHistoryBadges`, `workoutHistorySparkline`, `workoutHistoryTrainingSuite`.

## Post-entreno (390–394) ✅

Reseña dinámica, banner con sessionSummary + fuel hint, prefill Fuel con macros y E2E harness. Utils: `trainingReviewDisplay`, `workoutSaveBannerDisplay`, `fuelLogPrefill`, `postWorkoutTrainingSuite`.

## Gym-log en vivo (383–387) ✅

Chip progreso, PR badge, haptic/confetti, hint delta y resumen en FAB al minimizar. Utils: `gymLogSessionDisplay`, `gymLogLivePR`, `gymLogPRFeedback`, `gymLogLivePRHint`, `gymLogTrainingSuite`.

## Pulido entrenamiento (361–377) ✅

Arena Sync, gym-log, EntrenaPlan, Fuel×entreno, PRs, FAB sesión, banner post-guardar y cards de muro unificados al design system v2. Oleadas 374–377 cierran biblioteca, series, UX móvil y duplicar serie del gym-log. Inventario dedicado: `trainingPolishV1Suite`.

## E2E entrenamiento (378–402) ✅

Playwright con harness `?e2e=1` en CI (`e2e-smoke`). 7 specs cubren gym-log, Fuel, sync, reseña, FAB, banner, prefill, historial Perfil y EntrenaPlan×historial. Puente `e2eTrainingPolishBridge` → oleadas pulido 384–397, 401, 404–409. Mega bloque total: 361–409 (`trainingMegaSuite` / `trainingMegaBlockRange`).

## Auditoría cohesión (360)

| Pantalla | Estado |
|----------|--------|
| Explorar, Matches, Red | ✅ v2 |
| Mapa LIVE, Hoy, Auth | ✅ v2 |
| Perfil, Entreno modal | ✅ v2 |
| Bottom nav + tabs | ✅ v2 |
| Empty states + skeletons | ✅ `EmV2EmptyState` |
| Onboarding tour + activation | ✅ v2 |
| Sesiones + Squads | ✅ v2 cards + form sheets (360) |
| Notificaciones + match celebration | ✅ v2 (353) |
| Landing changelog | ✅ sección Novedades |
| FullProfile + filtros + legal | ✅ v2 Mount (354–360) |
| Seguridad (report, verify, moderación) | ✅ v2 Mount (360) |
| EntrenaSync replay + witness | ✅ v2 sync memory (360) |

## Pendiente post-piloto

- Ninguno crítico — barrido Visual 2.0 cerrado

*jul 2026 — piloto Visual 2.0 + post-piloto 356–360 completos*