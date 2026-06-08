# EntrenaMatch — Informe de revisión exhaustiva

**Versión:** v0.1.230 · **Deploy:** https://entrenamatch.web.app  
**Fecha:** Junio 2026  
**Alcance:** Fases 1–100 completadas + sesión de pulido reciente + propuesta GymPulse Map 2.0

---

## 1. Resumen ejecutivo

EntrenaMatch es hoy una **red social de entrenamiento en vivo** con nutrición inteligente (FuelBalance), sync en tiempo real (EntrenaSync), marketplace, EntrenaCoach y capa de mapa social (GymPulse). Tras **100 fases de roadmap**, el producto es **funcional en producción** con backend Firebase real, pero convive con **deuda técnica estructural** (App.tsx monolito ~13k líneas) y un **mapa ambicioso pero a medio refactor**.

### Veredicto por madurez

| Área | Madurez | Comentario |
|------|---------|------------|
| Auth + perfiles + live | ⭐⭐⭐⭐ | Sólido, RT Firestore, presencia dedicada |
| EntrenaSync / Arena | ⭐⭐⭐⭐ | Diferenciador real; permisos syncSessions pulidos |
| FuelBalance Engine | ⭐⭐⭐⭐ | Diferenciador vs MFP; MET + IA + target dinámico |
| EntrenaLog | ⭐⭐⭐ | ~80 ejercicios; sets/peso mejorados recientemente |
| Chat + Matches | ⭐⭐⭐ | Funcional; falta polish de apps maduras |
| EntrenaCoach | ⭐⭐⭐ | MVP reservas + dispatch; falta escala PT |
| Marketplace | ⭐⭐⭐ | MP checkout + 3 imágenes; falta catálogo real |
| **GymPulse Map** | ⭐⭐ | **Mayor gap vs visión Uber/Rappi/Pokémon GO** |
| Tech / mantenibilidad | ⭐⭐ | Lazy tabs parcial; App.tsx sigue siendo cuello de botella |

---

## 2. Inventario de lo implementado (fases 1–100)

### 2.1 Fundamentos (fases 1–30) — v0.1.160

Documentado en `ROADMAP_30_FASES.md`. Hitos clave:

- Firebase Auth, perfiles, matches, chat, muro, live toggle
- GymPulse v1 (Leaflet + pins live)
- Fuel AI base (TDEE, logs, Gemini foto/texto)
- EntrenaSync MVP, squads, sesiones grupales
- PWA + Capacitor Android, push nativo
- Onboarding, verificación, legal, feedback beta

### 2.2 Open Beta + escala (fases 31–70) — v0.1.200

Documentado en `ROADMAP_40_FASES.md`.

| Bloque | Entregables principales |
|--------|-------------------------|
| 31–35 | Beta polish, skeletons, onboarding unificado |
| 36–40 | Nav 5 tabs, sub-tabs Hoy/Muro, tour GymPulse |
| 41–45 | First live guiado, geo v2, Weekly Pact wizard |
| 46–50 | Bond graph, replays sync, city challenge |
| 51–55 | Chat menú, icebreakers, match breakdown, safety |
| 56–60 | Fuel edit post-IA, coach calendario, dispatch ETA |
| 61–65 | Lazy tabs, sync module, E2E smoke, error boundaries |
| 66–70 | Referral, partner gym UI, Moments, Constancia UX, landing EN |

### 2.3 FuelBalance Engine (fases 71–90) — v0.1.220

Documentado en `ROADMAP_FASES_71_90.md` y `DIAGNOSTICO_FASES_71+.md`.

| Bloque | Entregables principales |
|--------|-------------------------|
| 71–75 | `estimateWorkoutBurn`, `computeDailyEnergyBalance`, FuelDayCard dinámico, post-EntrenaLog → Fuel, Gemini context |
| 76–80 | Live burn, inferencia músculo, SyncDuelSummary kcal, squad fuel, health import stub |
| 81–85 | `useFuelBalance`, lazy Squads/Sessions, `dailyEnergy` cache, E2E fuel |
| 86–90 | PT FuelBalance panel, Constancia Firestore, partner gym backend, open beta |

### 2.4 Post-launch + pulido (fases 91–100 + sesión reciente) — v0.1.230

Documentado en `ROADMAP_FASES_91_100.md`.

| Entregable | Estado |
|------------|--------|
| `healthBurnKcal` en cache `dailyEnergy` | ✅ |
| `earnConstancia()` post-EntrenaLog | ✅ |
| `ensureConstanciaBalance()` seed momentum | ✅ |
| Partner gym Firestore (checkIns, daily, gyms) | ✅ |
| EntrenaLog: ~80 ejercicios, filtros músculo, sets/peso móvil | ✅ |
| Marketplace: hasta 3 imágenes + carrusel + Storage | ✅ |
| Checkout Mercado Pago + link pago directo | ✅ |
| EntrenaCoach: “Postúlate como socio” / “Trabaja con nosotros” | ✅ |
| Ocultar SYNC flotante en Coach/Tienda/EntrenaLog | ✅ |
| Ocultar paneles uso interno (debug, admin UID tienda) | ✅ |
| Fix `refreshFuelData` resiliente + syncSessions rules | ✅ |

### 2.5 Stack técnico actual

| Capa | Tecnología |
|------|------------|
| Frontend | React + Vite + TypeScript |
| Estilos | CSS custom (~7k+ líneas index.css) + motion |
| Mapa | **Leaflet 1.9.4 + OpenStreetMap raster** |
| Backend | Firebase (Auth, Firestore, Storage, Functions) |
| IA | Gemini via Cloud Function `analyzeFood` |
| Pagos | Mercado Pago Checkout Pro (marketplace + coach) |
| Mobile | Capacitor (Android APK) |
| Tests | Vitest (35 tests) + Playwright smoke |

---

## 3. Revisión exhaustiva por dominio

### 3.1 App.tsx — el elefante en la habitación

**Estado:** ~13.000 líneas. Contiene auth, live pipeline, sync, fuel, map filters, marketplace, coach, feed, chat hooks, partner dev tools.

**Riesgos:**
- Cualquier feature nueva aumenta regresiones
- Difícil testear unidades de negocio
- Re-renders costosos en cascada hacia el mapa

**Pulido recomendado (P1):**
- Extraer `useLiveMapPipeline`, `useFuelState`, `useSyncSession` a hooks dedicados
- Mover partner dev CRUD fuera de App
- Meta: App.tsx < 4.000 líneas en 6–8 semanas

### 3.2 Live + presencia

**Fortalezas:**
- Colección `livePresence` + listener `profiles.trainingNow` (dual source)
- `gymPulseLive.ts` — TTL 3h, merge, enrich distance/bonds
- Optimistic self pin al activar live
- Auto check-in gym si < 600 m de partner al ir live

**Debilidades:**
- 4 fuentes de verdad (presence, profiles, realProfiles poll 45s, demo seeds) — posible inconsistencia
- Coordenadas faltantes → fallback Viña del Mar (-33.02, -71.55)
- Sin streaming de ubicación (solo snapshot al toggle live)

**Pulir:**
- [ ] P0: Una sola fuente primaria (`livePresence`) + profiles solo como fallback documentado
- [ ] P1: Modo “ubicación aproximada” (radio 500 m) estilo Snapchat
- [ ] P2: Trail de sesión (polyline suave mientras entrenas)

### 3.3 EntrenaSync + Arena

**Fortalezas:**
- `syncSessions` RT con acciones, vibe, participantState, witnesses
- Arena inmersiva, tethers en mapa, ripples, echo pins
- Reglas Firestore endurecidas (`hasAny`, validación create)

**Debilidades:**
- Permisos intermitentes si auth token no listo (retry existe pero UX confusa)
- Burbuja SYNC flotante compite con otras modales
- Lógica sync aún repartida App + syncSessions.ts + arena components

**Pulir:**
- [ ] P1: Estado sync 100% en `useSyncSession` hook
- [ ] P2: Replay de sesión sync en mapa (línea dorada persistente 24h)

### 3.4 FuelBalance

**Fortalezas:**
- Motor puro testeable (`src/domain/fuelBalance/`)
- Target dinámico post-entreno visible en FuelDayCard
- PT ve balance cliente; dailyEnergy cache; Gemini con contexto burn/músculo
- 35 tests vitest pasando

**Debilidades:**
- Wearables stub (health import solo nativo futuro)
- Fuel semanal no cruza burn agregado de todos los días en UI rica
- Post-workout tip genérico en algunos edge cases

**Pulir:**
- [ ] P1: Gráfico semana consumo vs target ajustado vs burn
- [ ] P2: Apple Health / Health Connect bridge real en APK
- [ ] P3: Sugerencia comida post-entreno con foto directa desde FuelDayCard

### 3.5 EntrenaLog

**Fortalezas:**
- Biblioteca ~80 ejercicios LATAM/SmartFit style
- Filtros por músculo, publicación automática en muro
- Integración Fuel post-save + Constancia earn

**Debilidades:**
- Sin historial de PRs / progresión por ejercicio
- Sin plantillas de rutina (“Push día A”)
- Sin integración directa con Arena sync log

**Pulir:**
- [ ] P1: “Copiar último entreno” one-tap
- [ ] P2: PR detection + badge en muro
- [ ] P2: Rutinas guardadas / favoritos

### 3.6 Social (muro, feed, chat, matches)

**Fortalezas:**
- Comentarios Firestore con merge local/remote
- Match score breakdown, icebreakers, safety sheet
- Voice notes en chat

**Debilidades:**
- Feed global puede sentirse ruidoso sin ranking por señal
- Sin stories efímeras
- Chat sin typing indicator persistente en todos los flujos

**Pulir:**
- [ ] P1: Feed ranking por proximidad + live + bond strength
- [ ] P2: Reacciones rápidas en posts de entreno (🔥💪⚡)
- [ ] P3: Stories 24h post-sync

### 3.7 EntrenaCoach

**Fortalezas:**
- Explorar / Ahora / Sesiones / Perfil PT
- Dispatch on-demand, Mercado Pago, calendario
- CTAs socio + trabaja con nosotros

**Debilidades:**
- Pocos PT reales en catálogo (cold start)
- ETA en mapa dispatch incompleto visualmente
- Verificación PT manual vía Admin Ops

**Pulir:**
- [ ] P0: Onboarding PT self-service con video + verificación automática parcial
- [ ] P1: PT en mapa con pin distinto (como Rappi repartidor)
- [ ] P2: Reviews post-sesión visibles en card PT

### 3.8 Marketplace + monetización

**Fortalezas:**
- Admin Firestore gated, MP checkout, 3 imágenes Storage
- Mis pedidos con estados

**Debilidades:**
- Catálogo demo / vacío para usuarios finales
- Sin inventario / stock
- Sin notificaciones push de envío

**Pulir:**
- [ ] P1: 5–10 productos reales merch EntrenaMatch
- [ ] P2: Email/push al cambiar estado pedido
- [ ] P3: Cupones / referral descuento

### 3.9 Partner gyms + B2B

**Fortalezas:**
- Check-ins reales Firestore, dashboard stats, promos
- Auto check-in al ir live cerca del gym
- Leaderboard local + gym

**Debilidades:**
- Sin panel web para dueños de gym
- Top gyms ranking implementado en servicio pero no en UI principal
- Sin QR check-in físico en recepción

**Pulir:**
- [ ] P1: QR check-in en partner popup del mapa
- [ ] P2: Portal gym web (React admin lite)
- [ ] P3: Revenue share promos trackeables

### 3.10 QA, accesibilidad, performance

| Métrica | Estado |
|---------|--------|
| `npm test` | 35/35 ✅ |
| `npm run build` | ✅ |
| Playwright E2E | Smoke básico |
| `@ts-nocheck` | GymPulseMap, partes App |
| Lighthouse mobile | No medido sistemáticamente |
| Accesibilidad mapa | Popups HTML string, botones 8px |

**Pulir:**
- [ ] P0: E2E entreno → fuel → mapa live
- [ ] P1: Quitar `@ts-nocheck` de GymPulseMap
- [ ] P1: Lighthouse budget en CI
- [ ] P2: Reducir bundle App chunk (691 kB gzip 189 kB)

---

## 4. GymPulse Map — diagnóstico profundo

### 4.1 Qué es hoy

GymPulse **no es un mapa de navegación** — es un **mapa social de FOMO**: quién entrena ahora, dónde, con quién hace sync, qué gyms partners tienen actividad.

**Implementación:**
- `GymPulseMap.tsx` (~1.140 líneas, `@ts-nocheck`)
- Leaflet + tiles OSM estándar
- Altura fija **340px** embebida en tab Explorar
- Markers HTML custom, popups string, tethers sync, ripples arena
- Filtros: cerca (10 km), zona ciudad, solo red, mi gym, partners
- ~950 líneas CSS map-specific (muchas clases huérfanas)

### 4.2 Deuda técnica del mapa

| Issue | Impacto |
|-------|---------|
| Clustering calculado pero **UI rota** (no badge count) | Mal UX con 20+ pins |
| Rebuild completo markers cada ~280ms debounce | Jank en móvil |
| `window.startSyncFromMap` bridges | Frágil, no React |
| CSS `.map-sync-tether` vs JS `sync-tether` | Animaciones rotas |
| Sin vector tiles / dark map style | Se ve “web 2015” vs Uber |
| 340px height | No inmersivo |
| Sin direcciones / “ir al gym” | Expectativa usuario Rappi |
| Popups no accesibles | a11y |

### 4.3 Benchmark: qué hace bien cada referencia

| App | Patrón a robar | Aplicación EntrenaMatch |
|-----|----------------|-------------------------|
| **Uber** | Mapa fullscreen, vehículo animado, ETA pill flotante, bottom sheet sobre mapa | Bottom sheet “X entrenando cerca” + CTA sync; ETA si PT dispatch |
| **Google Maps** | Vector tiles, dark mode nativo, clustering real, POI rico, gesture polish | MapLibre dark style; clusters con expand; ficha gym rica |
| **Rappi** | Mapa como hero, pins comercio + repartidor, tracking en vivo suave | Partner gym pins + “live count” pulsante; rider = usuario live |
| **Pokémon GO** | Mapa como **razón principal** de abrir la app, spawn points, radar, colectibles | Gyms = spawn de actividad; ripples = “eventos”; Daily challenge en mapa |

---

## 5. Propuesta: GymPulse Map 2.0 — Remasterización

### 5.1 Visión producto

> **“Abrir EntrenaMatch = abrir el mapa de tu ciudad entrenando.”**

El mapa pasa de widget en Explorar a **experiencia primaria** (tab dedicado o fullscreen overlay), estilo Pokémon GO + utilidad Rappi.

### 5.2 Arquitectura técnica propuesta

```
┌─────────────────────────────────────────────────────────┐
│  GymPulseMapShell (fullscreen, safe-area, gestures)      │
├─────────────────────────────────────────────────────────┤
│  MapEngine (abstracción)                                 │
│   ├─ Fase A: Leaflet + MapLibre GL style (dark vector)  │
│   └─ Fase B: Mapbox GL JS / MapLibre nativo (opcional)  │
├─────────────────────────────────────────────────────────┤
│  LayerManager                                            │
│   ├─ LiveUsersLayer (WebGL markers o DivIcon optimizado)│
│   ├─ PartnerGymsLayer (POI con live heat)               │
│   ├─ SyncTethersLayer (Canvas/WebGL lines)              │
│   ├─ RipplesLayer (CSS/WebGL pulse)                     │
│   └─ SelfLayer (premium pin + accuracy circle)          │
├─────────────────────────────────────────────────────────┤
│  ClusterService (supercluster npm)                       │
├─────────────────────────────────────────────────────────┤
│  BottomSheet (Vaul / custom) — lista live + filtros     │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Roadmap mapa — fases 101–115

#### Bloque A — Fundación visual (101–105) · 2 semanas

| Fase | Entregable | Referencia |
|------|------------|------------|
| **101** | Mapa **fullscreen** toggle + safe-area iOS/Android | Uber |
| **102** | **MapLibre GL** dark style (Protomap / Maptiler free tier) | Google Maps dark |
| **103** | **supercluster** — clusters con badge count + expand zoom | Google Maps |
| **104** | Unificar CSS markers (`iconic-live-marker` only) | — |
| **105** | Bottom sheet: lista live sorted by distance + bond | Uber |

#### Bloque B — Interacción premium (106–110) · 2 semanas

| Fase | Entregable | Referencia |
|------|------------|------------|
| **106** | **Partner POI cards** — foto, promos, check-in CTA, QR | Rappi restaurant |
| **107** | Pin animado “respiración” + heat halo por densidad | Pokémon GO spawn |
| **108** | **Navigate to gym** — deep link Google/Apple Maps | Google Maps |
| **109** | React Leaflet popups (sin `window.*`) | — |
| **110** | Marker diffing (no full rebuild) — 60fps mobile | Uber driver |

#### Bloque C — Diferenciador social (111–115) · 2 semanas

| Fase | Entregable | Referencia |
|------|------------|------------|
| **111** | **Radar mode** — sweep + “X personas en 2 km” | Pokémon GO |
| **112** | Eventos mapa: city challenge zone overlay | Pokémon GO raids |
| **113** | PT dispatch: pin en movimiento simulado hacia cliente | Uber |
| **114** | Ghost mode / fuzzy location (privacidad) | Snapchat |
| **115** | Mapa offline tiles cache (última zona) | Google Maps |

### 5.4 Mockup conceptual (layout fullscreen)

```
┌──────────────────────────────────────┐
│ ◀  GYMPULSE          🔍  ⚙️  📍      │  ← header glass
│  ● 12 en vivo · Viña del Mar         │  ← pulse pill (tap = fly to hottest)
├──────────────────────────────────────┤
│                                      │
│     [ MAPA VECTOR DARK ]             │
│        ◉ cluster (8)                 │
│     👤 ← live pin                    │
│     🏋 HUB partner                   │
│     ═══ sync tether                  │
│                                      │
├──────────────────────────────────────┤
│ ▔▔▔▔  drag handle                    │
│ 🔥 Ana · 0.8 km · Pecho · [SYNC]     │  ← bottom sheet
│ 💪 Cote · 1.2 km · Live 23 min       │
│ 🏋 SmartFit · 4 check-ins hoy        │
└──────────────────────────────────────┘
```

### 5.5 Decisiones técnicas recomendadas

| Decisión | Opción A (rápida) | Opción B (premium) | Recomendación |
|----------|-------------------|---------------------|---------------|
| Motor | Leaflet + MapLibre style URL | MapLibre GL JS directo | **A primero**, B en fase 102+ |
| Clustering | supercluster | Deck.gl | **supercluster** |
| Markers | DivIcon optimizado + pool | WebGL symbol layer | DivIcon + diff |
| Tiles | Maptiler 100k free/mes | Self-host Protomap | Maptiler dev |
| Fullscreen | CSS `position:fixed` shell | Tab Map dedicado | **Tab “Mapa”** o hero Explorar |

### 5.6 Coste estimado

| Item | Costo |
|------|-------|
| Maptiler / Mapbox free tier | $0–50/mes según MAU |
| Dev time Bloque A–C | ~6 semanas 1 dev |
| Riesgo regresión live | Medio — requiere E2E mapa |

---

## 6. Backlog consolidado de pulido (priorizado)

### P0 — Rompe confianza / conversión

1. Mapa clustering roto con muchos usuarios live
2. App.tsx extracción hooks críticos (live, fuel, sync)
3. E2E: login → live → mapa → sync → entreno → fuel
4. Una fuente verdad live (`livePresence` primario)
5. Onboarding PT para cold start EntrenaCoach

### P1 — Sensación producto premium

6. GymPulse fullscreen + bottom sheet
7. Vector dark map tiles
8. EntrenaLog: copiar último entreno + PRs
9. Feed ranking por señal social
10. Quitar `@ts-nocheck` mapa + tipos estrictos
11. Marketplace catálogo real (5+ productos)
12. Partner gym QR check-in en mapa

### P2 — Diferenciación y retención

13. Radar mode + eventos city challenge en mapa
14. Fuel gráfico semanal burn vs consumo
15. Stories / share cards post-sync en feed
16. PT pin animado dispatch
17. Ghost location / privacidad granular
18. Portal web partner gym

### P3 — Escala y monetización

19. Health Connect / Apple Health real
20. Inventario marketplace
21. Mapa offline
22. ASO Play Store automatizado
23. Internacionalización EN completa

---

## 7. Métricas sugeridas (si aún no se trackean)

| Métrica | Por qué |
|---------|---------|
| `map_open` / DAU | ¿El mapa retiene? |
| `live_toggle` → `sync_start` funnel | Core loop |
| `entrenalog_save` → `fuel_log` &lt; 30 min | FuelBalance loop |
| `gym_checkin` manual vs auto | Partner B2B |
| `map_cluster_expand` | UX clustering |
| Time on map vs otras tabs | Decisión tab dedicado |

---

## 8. Documentos relacionados

| Documento | Contenido |
|-----------|-----------|
| `ROADMAP_30_FASES.md` | Fases 1–30 |
| `ROADMAP_40_FASES.md` | Fases 31–70 |
| `ROADMAP_FASES_71_90.md` | FuelBalance 71–90 |
| `ROADMAP_FASES_91_100.md` | 91–100 |
| `DIAGNOSTICO_FASES_71+.md` | Arquitectura FuelBalance |
| **`INFORME_REVISION_EXHAUSTIVA_v0.1.230.md`** | **Este informe** |

---

## 9. Conclusión y siguiente paso recomendado

EntrenaMatch tiene **tres pilares diferenciadores reales**:

1. **Live social graph** (mapa + presencia)
2. **EntrenaSync** (entrenamiento sincronizado con consecuencias)
3. **FuelBalance** (nutrición ajustada al entreno real)

El **cuello de botella de percepción de calidad** hoy es el **mapa**: funcional y ambicioso en CSS, pero **no compite visualmente** con Uber/Rappi/Pokémon GO. Una remasterización en **3 bloques (101–115)** convertiría GymPulse de “widget en Explorar” a **la cara icónica del producto**.

**Recomendación inmediata:** iniciar **Fase 101–105** (fullscreen + dark vector + clustering real + bottom sheet) antes de más features de growth — el mapa es el demo que vende EntrenaMatch en el gym.

---

*Generado tras revisión de código, roadmaps 1–100, exploración de `GymPulseMap.tsx`, `gymPulseLive.ts`, `App.tsx` pipeline, y sesión de pulido v0.1.230.*
