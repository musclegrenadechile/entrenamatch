# EntrenaMatch — Roadmap 30 Fases

Plan maestro de evolución post-beta (v0.1.148+). Cada fase es entregable, testeable y desplegable por sí sola.

| # | Fase | Área | Estado |
|---|------|------|--------|
| 1 | **Ciclo de vida pedidos** — `shipped` / `delivered` + UI admin y cliente | Marketplace | ✅ v0.1.149 |
| 2 | **Push pedido actualizado** — FCM al cambiar estado del pedido | Push | ✅ v0.1.149 |
| 3 | **Retry pago MP** — botón "Pagar" en Mis pedidos | Marketplace | ✅ v0.1.149 |
| 4 | **Deep link marketplace** — push abre Tienda → Mis pedidos | Push | ✅ v0.1.149 |
| 5 | **Admin filtros pedidos** — tabs por estado en Admin Ops | Admin | ✅ v0.1.149 |
| 6 | **EntrenaCoach solo verificados** — filtro en Explorar PT | EntrenaCoach | ✅ v0.1.149 |
| 7 | Distancia en cards PT (km desde tu ubicación) | EntrenaCoach | ✅ v0.1.150 |
| 8 | Calendario disponibilidad entrenador (slots semanales) | EntrenaCoach | ✅ v0.1.150 |
| 9 | Paquetes multi-sesión con descuento | EntrenaCoach | ✅ v0.1.150 |
| 10 | Historial dispatch Uber-mode (cliente + PT) | EntrenaCoach | ✅ v0.1.150 |
| 11 | Mercado Pago producción (token + webhook QA) | Pagos | ✅ v0.1.160 |
| 12 | Comisión plataforma dashboard admin | Admin | ✅ v0.1.160 |
| 13 | Onboarding post-registro (3 pasos guiados) | UX | ✅ v0.1.160 |
| 14 | First Steps con progreso persistente en Firestore | UX | ✅ v0.1.160 |
| 15 | Daily Pulse push re-engagement (opt-in) | Push | ✅ v0.1.160 |
| 16 | Weekly Pact recordatorios domingo | Engagement | ✅ v0.1.160 |
| 17 | Fuel AI — mejoras foto + corrección manual | Fuel | ✅ v0.1.160 |
| 18 | Fuel reporte semanal macros | Fuel | ✅ v0.1.160 |
| 19 | Squads retos semanales (meta grupal) | Squads | ✅ v0.1.160 |
| 20 | Live map clustering + rendimiento 100+ pins | Explore | ✅ v0.1.160 |
| 21 | Gym check-in leaderboard por sede | Explore | ✅ v0.1.160 |
| 22 | City Challenge v2 (premios + ranking) | Explore | ✅ v0.1.160 |
| 23 | EntrenaSync resumen post-sesión exportable | Sync | ✅ v0.1.160 |
| 24 | Chat — indicador "escribiendo…" + read receipts | Mensajes | ✅ v0.1.160 |
| 25 | Muro perfil — soporte video corto | Perfil | ✅ v0.1.160 |
| 26 | Matching — pesos por objetivo/zona horaria | Matches | ✅ v0.1.160 |
| 27 | Modularizar App.tsx (tabs → lazy routes) | Tech debt | ✅ v0.1.160 |
| 28 | E2E smoke Playwright (login → live → chat) | QA | ✅ v0.1.160 |
| 29 | Analytics admin (DAU, live, bookings, orders) | Admin | ✅ v0.1.160 |
| 30 | Play closed → open beta + store listing ES/EN | Release | ✅ v0.1.160 |

## Prioridad inmediata (Semanas 1–2)

1. Fases 1–6 (marketplace + admin + EntrenaCoach filtros)
2. Fase 11 (MP producción — bloqueante monetización)
3. Fases 13–14 (retención onboarding)

## Cómo usar este doc

- Marca ✅ al mergear + deploy de cada fase.
- Bump `APP_VERSION` + `versionCode` en cada release.
- Correr `npm run qa:smoke` antes de deploy.

## Comandos release

```powershell
npm run qa:smoke
npm run build
firebase deploy --only hosting,functions,firestore:indexes --project entrenamatch
publish-play.bat internal
```
