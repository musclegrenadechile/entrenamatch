# EntrenaMatch — Roadmap 40 Fases (31–70)

Continuación post v0.1.160. Cada fase es **entregable, testeable y desplegable sola**.  
Sistema de implementación: ver **`SISTEMA_IMPLEMENTACION_FASES.md`**.

**Versión base:** v0.1.160 · **Meta final fase 70:** v0.2.110 (incremento +1 patch por fase)

---

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| 🔲 | Pendiente |
| 🔄 | En progreso |
| ✅ | Completada + deploy |
| **P0–P3** | Prioridad |

---

## Bloque 1 — Open Beta Polish (31–35) · P0

| # | Fase | Área | P | Estado |
|---|------|------|---|--------|
| 31 | Retirar PRE-ALPHA badge + modal bienvenida beta | Release | P0 | 🔲 |
| 32 | Pull-to-refresh + sync silencioso (eliminar “Actualizar reales”) | UX | P0 | 🔲 |
| 33 | Boot screen: timeout 8s + CTA “Entrar demo / Reintentar” | UX | P0 | 🔲 |
| 34 | Skeleton loaders: Explore, Matches, Feed, Chat list | UX | P0 | 🔲 |
| 35 | Onboarding unificado: 1 flujo (merge PostRegister + FirstSteps) | UX | P0 | 🔲 |

---

## Bloque 2 — Navegación & Discoverability (36–40) · P0–P1

| # | Fase | Área | P | Estado |
|---|------|------|---|--------|
| 36 | Nav 5 tabs: Explorar · Hoy · Red (Matches+Chat) · Squads · Perfil | IA | P0 | 🔲 |
| 37 | Separar Hoy: sub-tabs “Mi día” / “Muro” | IA | P1 | 🔲 |
| 38 | Entrada contextual EntrenaCoach en Home (post-live, post-sync) | Monetización | P1 | 🔲 |
| 39 | Banner Tienda en Home (pedidos activos, merch destacado) | Monetización | P1 | 🔲 |
| 40 | GymPulse tour primer uso (3 tooltips: pins, check-in, sync) | Explore | P1 | 🔲 |

---

## Bloque 3 — Activación & First Session (41–45) · P0–P1

| # | Fase | Área | P | Estado |
|---|------|------|---|--------|
| 41 | Guided first Live: confetti + reveal mapa automático | Engagement | P0 | 🔲 |
| 42 | Empty Explore sin label “REAL”; seeds contextuales por ciudad | Matches | P1 | 🔲 |
| 43 | Sync blocker educativo: modal “Activa live primero” con CTA | Sync | P1 | 🔲 |
| 44 | Geo prompt v2: valor claro + preview distancia en cards | Explore | P1 | 🔲 |
| 45 | Weekly Pact inline wizard (primera meta en &lt;30s) | Engagement | P1 | 🔲 |

---

## Bloque 4 — Social Graph & EntrenaSync (46–50) · P1

| # | Fase | Área | P | Estado |
|---|------|------|---|--------|
| 46 | Bond graph visual en perfil (Network Power dashboard) | Perfil | P1 | 🔲 |
| 47 | Galería replays EntrenaSync en muro | Sync | P1 | 🔲 |
| 48 | Share card post-sync formato story (1080×1920) | Sync | P2 | 🔲 |
| 49 | Invitar a Squad desde resumen post-sync | Squads | P2 | 🔲 |
| 50 | City Challenge: push + modal celebración + badge ciudad | Explore | P1 | 🔲 |

---

## Bloque 5 — Chat & Matches (51–55) · P1–P2

| # | Fase | Área | P | Estado |
|---|------|------|---|--------|
| 51 | Chat header: acciones secundarias en menú “…” | Mensajes | P1 | 🔲 |
| 52 | Voice note: waveform polish + badge streak voz | Mensajes | P2 | 🔲 |
| 53 | Match score breakdown expandible (objetivo, zona, distancia) | Matches | P1 | 🔲 |
| 54 | Icebreakers IA desde overlap de perfil | Mensajes | P2 | 🔲 |
| 55 | Report/block flow unificado + confirmación clara | Safety | P1 | 🔲 |

---

## Bloque 6 — Fuel & EntrenaCoach (56–60) · P1–P2

| # | Fase | Área | P | Estado |
|---|------|------|---|--------|
| 56 | Fuel: retake foto + editar macros manual post-IA | Fuel | P1 | 🔲 |
| 57 | Fuel × workout insight (“post pierna → más proteína”) | Fuel | P2 | 🔲 |
| 58 | Coach: calendario reservas vista cliente | EntrenaCoach | P1 | 🔲 |
| 59 | Dispatch: ETA PT en mapa (en camino) | EntrenaCoach | P2 | 🔲 |
| 60 | PT dashboard ingresos + comisiones self-service | EntrenaCoach | P2 | 🔲 |

---

## Bloque 7 — Tech Debt & QA (61–65) · P1–P2

| # | Fase | Área | P | Estado |
|---|------|------|---|--------|
| 61 | Lazy load real ALL tabs (quitar imports estáticos) | Tech | P1 | 🔲 |
| 62 | Extraer Arena/Sync state de App.tsx → `sync/` module | Tech | P1 | 🔲 |
| 63 | TypeScript: quitar @ts-nocheck Explore + Home | Tech | P2 | 🔲 |
| 64 | Playwright E2E: login → toggle live → abrir chat | QA | P0 | 🔲 |
| 65 | Error boundaries por tab + retry automático | Tech | P1 | 🔲 |

---

## Bloque 8 — Growth & Diferenciación (66–70) · P2–P3

| # | Fase | Área | P | Estado |
|---|------|------|---|--------|
| 66 | Referral “Invita a tu gym” + deep link | Growth | P2 | 🔲 |
| 67 | Partner gym mini-dashboard (check-ins, promos) | B2B | P3 | 🔲 |
| 68 | EntrenaMatch Moments — reel semanal auto highlights | Engagement | P2 | 🔲 |
| 69 | Streak insurance (Constancia) UX completa + tienda | Engagement | P2 | 🔲 |
| 70 | ASO Play Store + landing ES/EN + open beta pública | Release | P1 | 🔲 |

---

## Cronograma sugerido

| Semanas | Fases | Objetivo |
|---------|-------|----------|
| 1–2 | 31–35, 64 | Sensación producto terminado + E2E |
| 3–4 | 36–41 | Nav + activación first live |
| 5–6 | 42–50 | Social graph + city/gym |
| 7–8 | 51–60 | Chat/coach/fuel polish |
| 9–10 | 61–65 | Deuda técnica |
| 11–12 | 66–70 | Growth + launch open beta |

---

## Dependencias clave

```
31–35 (polish) ──► 36–37 (nav) ──► 41 (first live)
40 (map tour) ──► 44 (geo)
61 (lazy tabs) ──► 62 (extract sync)
56–57 (fuel) ──► 68 (moments reel)
38–39 (monetización UI) ──► 70 (store)
```

---

## Comandos por fase

```powershell
# Antes de cada deploy
npm run qa:smoke
npm test
npm run build

# Deploy
firebase deploy --only hosting,functions,firestore:rules,firestore:indexes --project entrenamatch

# Android (cada 5 fases o fase release)
publish-play.bat internal
```

---

## Relación con roadmap anterior

| Doc | Fases | Estado |
|-----|-------|--------|
| `ROADMAP_30_FASES.md` | 1–30 | ✅ Completado v0.1.160 |
| **`ROADMAP_40_FASES.md`** | **31–70** | 🔲 Nuevo — pulido + escala |
