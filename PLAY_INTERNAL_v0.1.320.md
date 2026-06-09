# Play Store — v0.1.320 (versionCode 320)

**Fecha:** 9 junio 2026  
**Paquete:** `com.entrenamatch.app`  
**Track recomendado:** `internal` o `closed` (beta cerrada)  
**AAB local:** `android/app/build/outputs/bundle/release/app-release.aab`  
**Copia raíz:** `EntrenaMatch-release.aab`

## Cambios incluidos (FTUE Sprints 1–6)

- **Sprint 1 (107):** legalConsents sync, invite links, LIVE unificado, Google redirect móvil, toast pre-match
- **Sprint 2 (108):** GPS gated, tour post-guía, nav Hoy primero, perfil día 1, chat unreads, explore a11y
- **Sprint 3 (109):** nav 5 tabs, mapa polish, explore móvil, derby nav, WhyEntrenaMatch strip
- **Sprint 4 (110):** LIVE perfil directo, alt fotos, RedTab a11y, derby badge, invite loop post-match, FAB mapa
- **Sprint 5 (111):** copy mapa LIVE, derby siempre visible, demo banner, ocultar shop/coach 7 días
- **Sprint 6 (112):** unlock coach/shop tras 2 syncs, tour 4 pasos, onboarding demo "Entrar ya", a11y sweep

## Subir a Play Console (manual)

1. [Play Console](https://play.google.com/console) → **EntrenaMatch**
2. **Pruebas** → **Prueba interna** (o **Prueba cerrada**)
3. **Crear nueva versión**
4. Subir `EntrenaMatch-release.aab`
5. Pegar **What's new** (abajo)
6. Revisar y **Publicar** al track

## Subir automático (esta PC)

```cmd
cd /d C:\Users\muscl\fitvina
build-play-store.bat
```

Solo AAB local (sin subir):

```cmd
build-play-store.bat build
```

AAB + upload API:

```cmd
build-play-store.bat publish internal
```

## What's new (ES — Play Console)

```
v0.1.320 — Piloto Viña × Santiago (FTUE polish)
• Primera sesión más clara: guía 3 pasos + tour de 4 tabs
• LIVE unificado en perfil, mapa y FAB flotante
• Derby regional siempre visible (0 vs 0 al inicio)
• Invitar gym desde guía y tras primer match
• Modo prueba etiquetado + atajo "Entrar ya"
• Menos ruido día 1: Fuel/shop/coach ocultos al inicio
• Accesibilidad: fotos con alt, tabs Matches/chat, chat actualizado
• Mapa LIVE + Explorar mejorados en móvil
```

## What's new (EN)

```
v0.1.320 — Viña × Santiago pilot (FTUE polish)
• Clearer first session: 3-step guide + 4-tab discovery tour
• Unified LIVE toggle across profile, map, and FAB
• Regional derby always visible (0 vs 0 at start)
• Invite gym from guide and after first match
• Labeled demo mode + "Enter now" shortcut
• Less day-1 noise: Fuel/shop/coach hidden early
• Accessibility: alt text, Matches/chat tabs, chat refresh copy
• Improved LIVE map + Explore on mobile
```

## Matriz QA mínima (antes de ampliar testers)

| # | Flujo | Pass |
|---|-------|------|
| 1 | Instalar desde Play → abre sin crash | ☐ |
| 2 | Registro o demo → llega a Hoy | ☐ |
| 3 | ActivationGuide + tour 4 pasos | ☐ |
| 4 | Activar LIVE → visible en mapa | ☐ |
| 5 | Explorar swipe → match → chat | ☐ |
| 6 | Derby card 0 vs 0 visible | ☐ |
| 7 | Perfil → Activar/Terminar Live directo | ☐ |
| 8 | Crashlytics recibe sesión (24h) | ☐ |

## Versiones alineadas

| Archivo | Valor |
|---------|--------|
| `package.json` | 0.1.320 |
| `APP_VERSION` | 0.1.320 |
| `versionCode` | 320 |
| `versionName` | 0.1.320 |

Verificar: `npm run version:check`
