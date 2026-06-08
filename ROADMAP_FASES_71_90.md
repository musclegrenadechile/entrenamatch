# EntrenaMatch — Roadmap Fases 71–90 (FuelBalance + Escala)

**Versión base:** v0.1.200 · **Meta fase 90:** v0.1.220

Ver diagnóstico técnico: **`DIAGNOSTICO_FASES_71+.md`**

---

## Bloque 9 — FuelBalance Engine (71–75) · P0

| # | Fase | Entregable | P | Estado |
|---|------|------------|---|--------|
| 71 | `estimateWorkoutBurn()` MET + duración | `src/domain/fuelBalance/` + tests | P0 | ✅ |
| 72 | `computeDailyEnergyBalance()` | Join profile + logs + workouts | P0 | ✅ |
| 73 | FuelDayCard “Balance del día” | Target dinámico + líneas entreno | P0 | ✅ |
| 74 | Hook post-EntrenaLog → Fuel | CTA + modal post-guardar | P1 | ✅ |
| 75 | Gemini context enriquecido | burn + músculo en `analyzeFood` | P1 | ✅ |

---

## Bloque 10 — Live & Sync cruzado (76–80)

| # | Fase | Entregable | P | Estado |
|---|------|------------|---|--------|
| 76 | Live duration → burn | `trainingNowSince` en balance | P1 | ✅ |
| 77 | Inferencia músculo ejercicios | `inferDominantMuscle()` | P1 | ✅ |
| 78 | Post-sync Fuel insight | `SyncDuelSummary` burn line | P2 | ✅ |
| 79 | Squad weekly fuel summary | Banner en `SquadsTab` | P2 | ✅ |
| 80 | Health Connect stub | `services/healthImport.ts` | P3 | ✅ |

---

## Bloque 11 — Consolidación (81–85)

| # | Fase | Entregable | P | Estado |
|---|------|------------|---|--------|
| 81 | `useFuelBalance` hook | `src/hooks/useFuelBalance.ts` | P1 | ✅ |
| 82 | Lazy Squads/Sessions real | `LazySquadsTab` / `LazySessionsTab` | P2 | ✅ |
| 83 | `dailyEnergy` Firestore cache | `services/dailyEnergy.ts` + rules | P2 | ✅ |
| 84 | E2E workout → fuel card | `e2e/smoke.spec.ts` | P0 | ✅ |
| 85 | Fuel semanal report v2 | `FuelWeekReport` target dinámico | P2 | ✅ |

---

## Bloque 12 — Monetización inteligente (86–90)

| # | Fase | Entregable | P | Estado |
|---|------|------------|---|--------|
| 86 | PT ve FuelBalance cliente | `TrainerClientFuelPanel` | P2 | ✅ |
| 87 | Prescripción macros PT | CTA toast en panel | P2 | ✅ |
| 88 | Constancia economy Firestore | `constanciaEconomy.ts` + rules | P2 | ✅ |
| 89 | Partner gym check-ins | `partnerGym.ts` + dashboard + rules | P3 | ✅ |
| 90 | Open beta v1.0 + landing | `landing-en.html` + deploy | P1 | ✅ |

---

## Comandos

```powershell
node scripts/bump-version-phase.mjs 90
npm test
npm run build
firebase deploy --only hosting,functions,firestore:rules
```
