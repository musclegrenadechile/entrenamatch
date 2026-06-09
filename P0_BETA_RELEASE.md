# P0 Beta Release — v0.1.300

Checklist para cerrar Fase 100 + piloto Viña × Santiago.

## Versiones alineadas

| Artefacto | Valor |
|-----------|-------|
| Web / `APP_VERSION` | **0.1.300** |
| `package.json` | 0.1.300 |
| Android `versionCode` | **300** |
| Android `versionName` | 0.1.300 |

Verificar: `node scripts/version-check.mjs`

## 1. Deploy (CI en push a `main`)

- GitHub Pages: `deploy.yml`
- Firebase Hosting + rules: `firebase-deploy.yml`

Manual si hace falta:

```powershell
cd C:\Users\muscl\fitvina
firebase deploy --only firestore:rules,hosting
```

## 2. Matriz QA mínima (2 dispositivos) — v0.1.300

| # | Flujo | Pass |
|---|-------|------|
| 1 | Registro → onboarding completo → Tab Hoy (v0.1.300) | ☐ |
| 2 | LIVE **no** se activa solo al terminar onboarding | ☐ |
| 3 | Una sola guía (3 pasos), sin tour apilado | ☐ |
| 4 | CityDerbyCard visible 0 vs 0 + índice población | ☐ |
| 5 | LIVE → visible en mapa otro usuario | ☐ |
| 6 | EntrenaSync ≥2 min → minutos al derby | ☐ |
| 7 | Matches tab carga (sin error chunk tras hard refresh) | ☐ |
| 8 | Invitar amigo desde piloto strip | ☐ |
| 9 | Toast derby si rival supera (simular minutos) | ☐ |
| 10 | Crashlytics nativo (APK) | ☐ |

## 3. Scripts piloto (lunes)

```bash
node scripts/pilot-cohort-report.mjs
node scripts/pilot-sync-report.mjs
node scripts/pilot-retention-report.mjs
```

## 4. Criterios Fase 100

- Crash-free >99% (7 días post-AAB)
- ≥1 sync real/semana documentado
- ≥10 testers por ciudad piloto

Ver `GESTION_FASES_101_120.md` para fases 101–106.
