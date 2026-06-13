# P0 Beta Release — v0.1.382

Checklist para cerrar piloto multi-país (CL · PE · MX · US).

## Versiones alineadas

| Artefacto | Valor |
|-----------|-------|
| Web / `APP_VERSION` | **0.1.382** |
| `package.json` | 0.1.382 |
| Android `versionCode` | **382** |
| Android `versionName` | 0.1.382 |

Verificar: `node scripts/version-check.mjs`

Código: `src/utils/p0BetaQaMatrix.ts` (12 filas) + `src/utils/betaReleaseChecklist.ts` (17 ítems) + `BETA_QA_382.md`

## Cambios v0.1.381–382

- Registro/edición: Chile, Perú, México, USA (selector país + ciudad)
- Filtros Explorar: edad 18–70, distancia sin límite, orden por cercanía
- Discovery normalizado (`profileDiscoveryQuery`)
- `ActivationGuideMount` extraído de App.tsx
## 1. Deploy

```powershell
cd C:\Users\muscl\fitvina
npm run deploy
firebase deploy --only firestore:rules,hosting
```

## 2. Matriz QA mínima (2 dispositivos) — v0.1.377

| # | Flujo | Pass |
|---|-------|------|
| 1 | Registro → onboarding completo → Tab Hoy | ☐ |
| 2 | LIVE **no** se activa solo al terminar onboarding | ☐ |
| 3 | Una sola guía (3 pasos), sin tour apilado | ☐ |
| 4 | CityDerbyCard visible 0 vs 0 + índice población | ☐ |
| 5 | LIVE → visible en mapa otro usuario (<60 s) | ☐ |
| 6 | EntrenaSync ≥2 min → minutos al derby | ☐ |
| 7 | Matches tab carga (sin error chunk tras hard refresh) | ☐ |
| 8 | Invitar amigo desde piloto strip | ☐ |
| 9 | Toast derby si rival supera (simular minutos) | ☐ |
| 10 | Panel notificaciones → deep link chat/map | ☐ |
| 11 | Publicar en Muro (texto + foto) desde Home | ☐ |
| 12 | Crashlytics nativo (APK internal) | ☐ |
| 13 | Guardar entreno → toast **Compartir** → imagen Instagram | ☐ |
| 14 | Muro + perfil propio → botón 📸 Instagram | ☐ |

## 3. Scripts piloto

```bash
node scripts/pilot-cohort-report.mjs
node scripts/pilot-sync-report.mjs
node scripts/pilot-retention-report.mjs
```

## 4. Criterios beta

- Crash-free >99% (7 días post-AAB)
- ≥1 sync real/semana documentado
- ≥10 testers por ciudad piloto
