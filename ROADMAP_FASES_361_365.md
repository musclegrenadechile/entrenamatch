# EntrenaMatch — Roadmap 361–365 (notificaciones state + perfil)

**Versión cierre:** v0.1.361 · **Estado:** ✅ jun 2026

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| 361 | `useNotificationsState` | Lista, prefs, addNotification fuera de App | ✅ |
| 362 | `FullProfileSheetMount` | Perfil completo + métricas computadas | ✅ |
| 363 | `notificationGating` | Tests prefs + dedup 5 min | ✅ |
| 364 | `livePilotChecklist` | QA piloto LIVE sábado (5 pasos) | ✅ |
| 365 | Docs + bump + deploy | Play internal v0.1.361 | ✅ |

## Archivos nuevos

- `src/hooks/useNotificationsState.ts`
- `src/utils/notificationGating.ts`
- `src/components/profile/FullProfileSheetMount.tsx`
- `src/utils/livePilotChecklist.ts`

## Próximo sprint (366+)

1. `TrainerCoachView` mount wrapper
2. `MarketplaceView` mount wrapper
3. Piloto LIVE sábado — ejecución manual
4. Screenshots Play
5. QA `P0_BETA_RELEASE.md` en 2 dispositivos
