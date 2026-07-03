# P0 Beta Release — v0.1.403

Checklist piloto **costa central Chile** (Viña · Valparaíso · Concón) + registro multi-país.

## Versiones alineadas

| Artefacto | Valor |
|-----------|-------|
| Web / `APP_VERSION` | **0.1.403** |
| `package.json` | 0.1.403 |
| Android `versionCode` | **403** |
| Android `versionName` | 0.1.403 |

Verificar: `node scripts/version-check.mjs`

## Marketing GTM (oleada 511 + 402)

- Foco geográfico piloto en landing + `BRAND_COPY.pilotGeo`
- Copa Zona solo si comuna participa (`isDerbyParticipantCity`)
- Home compacto **7 días** — sin Fuel/wearable/coach/marketplace
- Copy visible: **Conectar** (no “match” en UI clave)
- KPI piloto: **primer LIVE en 24h**
- **Dictado entreno (Android):** grabación audio nativa primero — Parar responde al instante

## Matriz QA mínima (2 dispositivos)

| # | Flujo | Pass |
|---|-------|------|
| 1 | Registro → onboarding → Tab Hoy | ☐ |
| 2 | Guía activación → CTA **Activar LIVE** | ☐ |
| 3 | Usuario fuera piloto: **no** ve Copa Zona (sí invitación) | ☐ |
| 4 | Usuario Viña/Valpo: ve Copa Zona | ☐ |
| 5 | Día 1–6: Home sin Fuel ni marketplace | ☐ |
| 6 | Explorar: badge **CONECTAR** + modal **¡Conectaron!** | ☐ |
| 7 | LIVE → visible en mapa (<60 s) | ☐ |
| 8 | EntrenaSync ≥2 min → minutos al derby (si aplica) | ☐ |
| 9 | Invitar amigo desde strip / QR | ☐ |
| 10 | Guardar entreno → story Instagram | ☐ |
| 11 | **Dictar entreno** → “Grabando audio…” → Parar → preview o error claro | ☐ |

## Deploy

| Paso | Estado |
|------|--------|
| Web hosting (`npm run deploy`) | ✅ v0.1.403 + fix fotos Explorar |
| Firestore rules | ✅ |
| Cloud Functions `parseWorkoutVoice` + `parseWorkoutVoiceText` | ✅ |
| Play internal AAB **403** | ✅ |

```powershell
cd C:\Users\muscl\fitvina
npm run deploy
npx firebase deploy --only firestore:rules,functions:parseWorkoutVoice,functions:parseWorkoutVoiceText --project entrenamatch
.\publish-play.bat internal
```

**Guía testers:** `GUIA_PILOTO_RAPIDA.md` · **Métricas:** `PILOTO_METRICAS_SEMANAL.md` · `npm run pilot:reports`

## Play internal

```powershell
cd C:\Users\muscl\fitvina
.\publish-play.bat internal
```

Doc release: `PLAY_INTERNAL_v0.1.403.md` · Marketing: `assets/play-store/PLAY_MARKETING_v0.1.402.md`

## Criterios beta

- Crash-free >99% (7 días post-AAB)
- ≥1 sync real/semana documentado en piloto
- ≥10 testers activos en **Viña / Valparaíso / Concón**
- ≥40% nuevos usuarios con **primer LIVE en 24h**
- Dictado voz usable en Samsung (Parar + preview sin colgarse)

## Smoke web (automático)

| Check | Estado |
|-------|--------|
| Landing piloto costa + CTA lista espera | ✅ |
| App auth muestra v0.1.403 | ✅ (local) |
| Badge piloto `BRAND_COPY.pilotGeo` | ✅ |
| `npm run qa:smoke` (396 tests + versiones) | ✅ 0.1.403 |
| Fix discovery multi-ciudad | ✅ código + índices Firestore; web 402+; Android **403** Play |

**Invitación WhatsApp:** `PILOTO_INVITACION_WHATSAPP.txt` (pegar link Play opt-in)

## APK local (USB)

```
android/app/build/outputs/apk/release/app-release.apk
```

```powershell
cd C:\Users\muscl\fitvina\android
.\gradlew.bat installRelease
```

## Métricas semanales

Plantilla: `PILOTO_METRICAS_SEMANAL.md` · CLI: `npm run pilot:reports`
