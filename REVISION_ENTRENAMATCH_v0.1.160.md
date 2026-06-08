# Revisión total EntrenaMatch — v0.1.160

**Fecha:** 8 jun 2026 · **URL:** [entrenamatch.web.app](https://entrenamatch.web.app)  
**Alcance:** Producto, UX visual, features, pulido, diferenciación, gaps técnicos.

---

## Resumen ejecutivo

EntrenaMatch **ya no es un clon de Tinder con pesas**. Tiene una tesis de producto clara: **tu red de entrenamiento es un activo visible y compuesto** (Live → Equipo → Sync → Semana). GymPulse + EntrenaSync + Weekly Pact forman un loop que la mayoría de apps fitness no tienen.

El problema principal **no es falta de features** — es **carga cognitiva**, **señales de beta/debug visibles**, y **distancia al “aha moment”** (encender live y aparecer en el mapa). Con pulido de activación y retiro de fricción, el producto puede sentirse premium y único en open beta.

| Dimensión | Nota (1–10) | Comentario |
|-----------|-------------|------------|
| Propuesta única | **9** | Live map + sync social + pact semanal |
| Coherencia visual | **7** | Dark premium consistente; mezcla inline hex + vars |
| Primera sesión | **5** | Triple onboarding; boot puede colgar |
| Navegación | **6** | 7 tabs densos; monetización oculta en Perfil |
| Pulido / loading | **5** | “Cargando…”, “...”, sin skeletons |
| Chat & matches | **8** | Voz, typing, bond — muy sólido |
| Monetización | **6** | Stack existe; poca discoverability |
| QA / confianza | **5** | 24 unit tests; E2E smoke mínimo |
| Código / mantenibilidad | **4** | App.tsx ~13k LOC |

---

## Qué se siente único (fortalecer)

### 1. GymPulse — mapa vivo de entrenamiento
Pins en tiempo real, clusters, gimnasios partner, sync tethers, ripples. **Ninguna app mainstream hace “quién está entrenando ahora cerca de mí” con esta profundidad.**

**Fortalecer:** tour de primer uso, check-in con recompensa visible, FOMO cuando hay 10+ live en tu ciudad.

### 2. EntrenaSync — entrenar juntos en vivo
Arena post-sesión, bond levels, Network Power, auto-post al muro. Convierte un match en **experiencia compartida**, no solo chat.

**Fortalecer:** replay/galería de syncs, invitar a squad post-sync, share card tipo story.

### 3. Loop Live → Equipo → Sync → Semana
`DailyHome` + `HomeLoopStepper` + `WeeklyPactCard` narran bien el producto. Es el **core habit loop**.

**Fortalecer:** una sola guía de activación; celebración al completar cada paso; menos scroll antes del CTA live.

### 4. Red local (ciudad + gym)
City Challenge v2, leaderboard por sede, check-in. Gamificación **hiperlocal** — ideal para Chile primero.

**Fortalecer:** push al completar reto, ranking entre ciudades más visible, premios tangibles (badges, descuentos partner).

### 5. EntrenaCoach + dispatch Uber-mode
PT verificados, slots, paquetes, dispatch con historial. **Monetización B2C real**, no solo suscripción.

**Fortalecer:** entrada contextual desde Home post-live; ETA en mapa cuando PT va en camino.

### 6. Fuel AI + muro social
Foto → macros (Gemini), reporte semanal, posts de nutrición. Conecta **nutrición con la red social**, no silo aparte.

---

## Testeos realizados

| Prueba | Resultado |
|--------|-----------|
| `npx vitest run` | **24/24 OK** (matching, dispatch, push, availability) |
| `node scripts/qa-smoke.mjs` | **OK** — versiones alineadas 0.1.160 |
| `npm run build` | **OK** — tsc + vite |
| Browser prod [entrenamatch.web.app](https://entrenamatch.web.app) | Boot “Cargando EntrenaMatch…” con barra naranja; **sin progreso a auth en sesión anónima headless** (posible hang Firebase/auth) |
| E2E Playwright (`e2e/smoke.spec.ts`) | Solo verifica `body` visible — **no cubre login → live → chat** |

---

## Fricciones UX (prioridad de pulido)

### P0 — Rompen sensación “producto terminado”

1. **Badge PRE-ALPHA** visible en shell (`App.tsx` ~9455).
2. **“Actualizar reales”** en Explore y Matches — lenguaje de tester, no consumidor.
3. **Boot colgado** — “Preparando mapa, live y tu equipo” sin timeout ni CTA alternativo (`RootApp.tsx`, `BootShell.tsx`).
4. **Triple onboarding** — `OnboardingFlow` + `PostRegisterGuide` + `FirstStepsGuide` antes del primer live.
5. **Loading genérico** — `Cargando…`, `...` en botones; sin skeleton cards.

### P1 — Carga cognitiva

6. **7 tabs** iguales (Explorar, Hoy, Squads, Sesiones, Matches, Mensajes, Perfil) — Sesiones vs Squads vs Matches confunde.
7. **Tab Hoy = loop + feed global** — dos productos en un scroll largo (`HomeTab.tsx`).
8. **Coach / Tienda / Admin** solo desde Perfil — revenue escondida.
9. **GymPulse filtros** potentes pero steep para día 1 (`GymPulseMap.tsx`).
10. **Sync requiere live** — lógica correcta; falta hand-holding al tocar Sync sin live.

### P2 — Detalle visual / marca

11. Comentario CSS legacy “FitViña” (`index.css`).
12. Keys `fitvina_*` en localStorage.
13. `@ts-nocheck` en tabs principales — riesgo de bugs UX silenciosos.
14. Lazy tabs inefectivos — imports estáticos anulan code-splitting (warnings en build).
15. Hover `.card` duplicado en CSS.

### P3 — Features a medio pulir

16. Video en muro — render OK; **falta upload UI** completa.
17. MP producción — `checkMpHealth` OK; token real pendiente.
18. Explore “Relajar filtros” abre modal, no relaja filtros.
19. Seeds verificados hardcodeados `['p1','p2',...]` en Explore.
20. Chat header muy cargado (Perfil, Sync, Entrenar, Reportar, Bloquear, reseña).

---

## Mapa de flujos (estado actual)

```
Auth → OnboardingFlow (largo)
     → PostRegisterGuide (modal 3 pasos)
     → Home: FirstStepsGuide + DailyHome loop
              └─ EL MURO (feed global, mismo tab)

Explorar: Swipe + GymPulse map overlay
Matches → Chat (voz, typing, bond)
Perfil: Muro | Fuel | Tienda | Coach | Admin (gated)
```

**Aha moment ideal:** Auth → 1 guía → **Live ON** → aparecer en mapa → 1 swipe → 1 mensaje.  
**Hoy:** ~5–8 pantallas/modal antes del live.

---

## Qué pulir para sentir “único y premium”

| Área | Acción |
|------|--------|
| **Sonido & haptics** | Ya hay haptics; añadir micro-animaciones al toggle live y match |
| **Celebraciones** | Confetti en city challenge existe; extender a first live, first sync, pact complete |
| **Identidad** | Retirar PRE-ALPHA; copy 100% ES natural; eliminar “REAL”, “cross-device”, “testers” |
| **Skeletons** | Cards shimmer en Explore, Matches, feed — percepción de velocidad |
| **Empty states** | Ya son buenos; unificar tono y quitar CTAs debug |
| **Network graph** | Mostrar bonds y sync history como “tu capital social fitness” |
| **Momentos** | Reel semanal auto (live days, sync highlights, fuel streak) — diferenciador viral |

---

## Fortalezas a no diluir

- Dark UI naranja/verde con semántica live clara.
- Empty states con copy motivacional en español.
- Push ecosystem rico (live, sync, pact, orders, chat).
- EntrenaSync arena + duel summary.
- Admin Ops maduro para operar Chile launch.
- Roadmap 30 fases completado y desplegado.

---

## Conclusión

**EntrenaMatch está listo en features para open beta técnica, pero no en percepción de producto terminado.**  
La inversión siguiente debe ir a:

1. **Activación** (menos pasos → primer live en &lt;3 min)  
2. **Pulido visual** (skeletons, retirar beta chrome)  
3. **IA simplificada** (5 tabs, monetización visible)  
4. **Profundizar diferenciadores** (bond graph, sync moments, city/gym gamification)  
5. **QA real** (E2E login → live → chat)

Ver plan de implementación: **`ROADMAP_40_FASES.md`** (fases 31–70) + **`SISTEMA_IMPLEMENTACION_FASES.md`**.
