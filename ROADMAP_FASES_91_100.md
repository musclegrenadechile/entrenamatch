# EntrenaMatch — Roadmap Fases 91–100 (Escala post FuelBalance)

**Versión base:** v0.1.220 · **Meta fase 100:** v0.1.230

---

## Bloque 13 — Partner + Constancia real (91–95)

| # | Fase | Entregable | P | Estado |
|---|------|------------|---|--------|
| 91 | `healthBurnKcal` en `dailyEnergy` cache | Persist + restore al login | P2 | ✅ |
| 92 | `earnConstancia()` post-EntrenaLog | Firestore + toast reward | P2 | ✅ |
| 93 | `ensureConstanciaBalance()` seed | Migración desde momentum | P2 | ✅ |
| 94 | Partner gym Firestore rules + indexes | checkIns, daily, gyms | P1 | ✅ |
| 95 | Tests health + constancia + fuel balance | vitest | P0 | ✅ |

---

## Bloque 14 — Comunidad & release (96–100)

| # | Fase | Entregable | P | Estado |
|---|------|------------|---|--------|
| 96 | `fetchTopPartnerGyms()` | Ranking check-ins del día | P3 | ✅ |
| 97 | FuelDayCard import wearable UX | Botón + hint en Home | P2 | ✅ |
| 98 | Restore health burn desde cache | Login → `loadDailyEnergyCache` | P2 | ✅ |
| 99 | Partner dashboard stats reales | `PartnerGymDashboard` + App wiring | P2 | ✅ |
| 100 | Open beta v1.0.230 | Deploy + roadmap cerrado | P1 | ✅ |

---

## Comandos

```powershell
node scripts/bump-version-phase.mjs 100
npm test
npm run build
firebase deploy --only hosting,firestore:rules,firestore:indexes
```
