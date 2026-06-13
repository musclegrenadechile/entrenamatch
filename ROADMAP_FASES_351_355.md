# EntrenaMatch — Roadmap 351–355 (refactor App.tsx + QA sync)

**Versión cierre:** v0.1.351 · **Estado:** ✅ jun 2026

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| 351 | `useNotificationRouter` | Deep links push / panel / toast → tab/chat/sync | ✅ |
| 352 | `FeedComposerModal` | Modal publicar en Muro fuera de App.tsx | ✅ |
| 353 | Tests push + nav | `pushNavigation.test` team_live/sync; escenarios E2E | ✅ |
| 354 | E2E sync harness | `e2eSyncScenarios.ts` checklist 2 dispositivos | ✅ |
| 355 | Docs + bump + deploy | Play internal v0.1.351 | ✅ |

## Archivos nuevos

- `src/hooks/useNotificationRouter.ts`
- `src/components/feed/FeedComposerModal.tsx`
- `src/utils/e2eSyncScenarios.ts` + test

## Próximo sprint (356+)

1. Extraer notificaciones panel de App.tsx
2. `useFeedState` → wiring completo en HomeTab
3. Piloto LIVE sábado (2 dispositivos + mapa)
4. Screenshots Play reales
5. QA matriz `P0_BETA_RELEASE.md`
