# Gestión fases 101–120 — EntrenaMatch

**Versión actual:** v0.1.345  
**Deploy:** https://entrenamatch.web.app · https://musclegrenadechile.github.io/entrenamatch/

---

## Fase 101 — Primera impresión ✅

| DoD | Estado |
|-----|--------|
| Auth sin “142 live”; copy piloto honesto | ✅ |
| Una guía post-registro (3 pasos) | ✅ ActivationGuide |
| LIVE opt-in (no auto al terminar onboarding) | ✅ |
| `isProfileComplete` con ciudad, bio, tipos, consentimientos | ✅ |
| Tab Hoy día 1 simplificado | ✅ `compactDayOne` |
| Derby visible 0 vs 0 | ✅ |
| Botón logout duplicado eliminado | ✅ |
| Demo sin onboarding si perfil completo | ✅ |
| PWA no agresivo a los 3s | ✅ |

---

## Fase 102 — Cierre operativo Fase 100 🔄

| DoD | Estado |
|-----|--------|
| `versionCode` alineado (299→300) | ✅ |
| QA 2 dispositivos | 🔄 Ver `P0_BETA_RELEASE.md` |
| Crashlytics 7 días >99% | 🔄 Medir post-deploy |
| `pilot-sync-report.mjs` con sync real | 🔄 Ops |
| `P0_BETA_RELEASE.md` actualizado | ✅ |

---

## Fase 103 — Activación piloto 🔄

| DoD | Estado |
|-----|--------|
| Push/toast derby “rival te superó” | ✅ `derbyLeaderNotify.ts` |
| CTA Sábado LIVE en `PilotProgramStrip` | ✅ |
| Invitar amigo (share piloto) | ✅ |
| Script D1/D7 | ✅ `pilot-retention-report.mjs` |
| Ocultar marketplace/coach <7d y <2 syncs | ✅ `pilotFeatureFlags.ts` |
| ≥10 miembros/cohorte | 🔄 Ops |

---

## Fase 104 — Competencia regional ✅

| DoD | Estado |
|-----|--------|
| Histórico ganador semanal | ✅ `derbyWeeklyHistory.ts` |
| Badge defensor en derby card | ✅ `DerbyDefenderBadge` |
| Story share derby PNG | ✅ `derbyStoryShare.ts` |
| Índice por población | ✅ v0.1.298+ |

---

## Fase 105 — Estabilidad 🔄

| DoD | Estado |
|-----|--------|
| FCM en `userPushTokens` | ✅ |
| `App.tsx` <9k líneas | 🔄 ~11.9k |
| Quitar `@ts-nocheck` mapa | 🔄 |
| Chunk reload post-deploy | ✅ v0.1.299 |
| Go/no-go 2ª ciudad | 🔄 Con D7 |

---

## Fase 106 — Monetización (gated) 🔄

| Criterio entrada | ≥50 MAU, D7>25%, 7 días cuenta, 2 syncs |
| DoD MP producción | 🔄 `VITE_PILOT_MONETIZATION=1` para forzar |
| EntrenaCoach pin real | 🔄 |
| Partner dashboard | 🔄 |

**Gate:** `isMonetizationUnlocked()` en `ProfileTab` — tienda/coach ocultos hasta cumplir.

---

## Scripts operativos

```bash
node scripts/pilot-cohort-report.mjs
node scripts/pilot-sync-report.mjs
node scripts/pilot-retention-report.mjs
```

## Oleada 341–345 ✅ (v0.1.345)

| Entregable | Estado |
|------------|--------|
| `useFuelBalancePipeline` + chart wearable | ✅ |
| CTA Mapa LIVE siempre en Explorar | ✅ |
| Spec screenshots Play | ✅ |
| `PLAY_INTERNAL_v0.1.345.md` | ✅ |

## Próximo sprint

1. `.\build-play-store.bat` → AAB 345 → Play internal
2. QA matriz 2 dispositivos (`P0_BETA_RELEASE.md`)
3. Capturar 8 screenshots (`SCREENSHOTS_v0.1.345.md`)
4. Sábado LIVE piloto + `pilot-retention-report.mjs`
5. Extracción `App.tsx` (chat shell)
