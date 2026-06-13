# EntrenaMatch — Roadmap 376–380 (workout story + activación)

**Versión cierre:** v0.1.382 · **Estado:** 🔄 jun 2026 (381–385 ✅ código · 382/386–450 ☐)

| # | Fase | Entregable | Estado |
|---|------|------------|--------|
| 376 | Rutina Story + Muro | `workoutStoryShare` + feed preview + Stories CTA | ✅ |
| 377 | Fix compartir Instagram + copy replays | Toast Compartir + Muro/perfil + `syncReplayCopy` | ✅ |
| 379 | Fix scroll filtros Explorar | Sheet desplazable + CTA fijo | ✅ |
| 380 | Fuel mounts | `FuelOverlaysMount` wizard + setup + log | ✅ |
| 381 | Multi-país + filtros | CL/PE/MX/US + edad/distancia | ✅ |
| 382 | QA 17 ítems | `BETA_QA_382.md` en 2 dispositivos | ☐ ops |
| 383 | Discovery normalizado | `profileDiscoveryQuery` | ✅ |
| 384 | ActivationGuideMount | Guía post-registro mount | ✅ |

Ver oleada completa 381–450: **`ROADMAP_FASES_381_450.md`**

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
