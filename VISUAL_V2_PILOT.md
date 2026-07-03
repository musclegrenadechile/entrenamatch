# Visual 2.0 — Piloto COMPLETO ✅

**Live:** https://entrenamatch.web.app  
**Versión cierre:** v0.1.424  
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