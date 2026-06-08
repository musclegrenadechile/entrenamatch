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
| 7 | Distancia en cards PT (km desde tu ubicación) | EntrenaCoach | 🔲 |
| 8 | Calendario disponibilidad entrenador (slots semanales) | EntrenaCoach | 🔲 |
| 9 | Paquetes multi-sesión con descuento | EntrenaCoach | 🔲 |
| 10 | Historial dispatch Uber-mode (cliente + PT) | EntrenaCoach | 🔲 |
| 11 | Mercado Pago producción (token + webhook QA) | Pagos | 🔲 |
| 12 | Comisión plataforma dashboard admin | Admin | 🔲 |
| 13 | Onboarding post-registro (3 pasos guiados) | UX | 🔲 |
| 14 | First Steps con progreso persistente en Firestore | UX | 🔲 |
| 15 | Daily Pulse push re-engagement (opt-in) | Push | 🔲 |
| 16 | Weekly Pact recordatorios domingo | Engagement | 🔲 |
| 17 | Fuel AI — mejoras foto + corrección manual | Fuel | 🔲 |
| 18 | Fuel reporte semanal macros | Fuel | 🔲 |
| 19 | Squads retos semanales (meta grupal) | Squads | 🔲 |
| 20 | Live map clustering + rendimiento 100+ pins | Explore | 🔲 |
| 21 | Gym check-in leaderboard por sede | Explore | 🔲 |
| 22 | City Challenge v2 (premios + ranking) | Explore | 🔲 |
| 23 | EntrenaSync resumen post-sesión exportable | Sync | 🔲 |
| 24 | Chat — indicador "escribiendo…" + read receipts | Mensajes | 🔲 |
| 25 | Muro perfil — soporte video corto | Perfil | 🔲 |
| 26 | Matching — pesos por objetivo/zona horaria | Matches | 🔲 |
| 27 | Modularizar App.tsx (tabs → lazy routes) | Tech debt | 🔲 |
| 28 | E2E smoke Playwright (login → live → chat) | QA | 🔲 |
| 29 | Analytics admin (DAU, live, bookings, orders) | Admin | 🔲 |
| 30 | Play closed → open beta + store listing ES/EN | Release | 🔲 |

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
