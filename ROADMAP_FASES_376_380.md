# EntrenaMatch — Roadmap 376–380 (workout story + activación)

**Versión cierre:** v0.1.380 · **Estado:** 🔄 jun 2026 (380 ✅ · 381–382 ☐)

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| 376 | Rutina Story + Muro | `workoutStoryShare` + feed preview + Stories CTA | ✅ |
| 377 | Fix compartir Instagram + copy replays | Toast Compartir + Muro/perfil + `syncReplayCopy` | ✅ |
| 379 | Fix scroll filtros Explorar | Sheet desplazable + CTA fijo | ✅ |
| 380 | Fuel mounts | `FuelOverlaysMount` wizard + setup + log | ✅ |
| 381 | Piloto LIVE manual | Ejecución sábado + screenshots Play | ☐ |
| 382 | QA 17 ítems | `betaReleaseChecklist` en 2 dispositivos | ☐ |

## Archivos nuevos (376)

- `src/utils/workoutStoryShare.ts`
- `src/utils/workoutStoryShare.test.ts`

## Cambios UX (376)

- Story PNG 1080×1920 con rutina, stats, CTA `?ref=USER_ID`
- Botón **Stories** en `WorkoutPostCard` (Muro + post-save toast)
- Muro: 4 ejercicios visibles + caption `post.text`
- `PostLiveShareBanner`: botón Story opcional post-LIVE

## Próximo sprint (377+)

1. `ActivationGuide` mount wrapper
2. `FuelSetupWizard` + `FuelLogModal` mounts
3. Piloto LIVE sábado — ejecución manual
4. Screenshots Play Console
5. QA 17 ítems `betaReleaseChecklist` en 2 dispositivos
