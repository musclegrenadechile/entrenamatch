# Release checklist — EntrenaMatch APK / Play

**Versión activa:** 0.1.345 · `npm run version:check`

## Antes de cada release

- [ ] `npm run version:check` — versiones alineadas
- [ ] `npm test` — vitest verde
- [ ] `npm run build` — web producción OK
- [ ] `npm run build:web:native` + `npx cap sync android` **sin** `CAP_DEV=1`
- [ ] Verificar `android/app/src/main/assets/capacitor.config.json` → `webContentsDebuggingEnabled: false`

## Debug APK (USB / prueba rápida)

```powershell
npm run android:apk
```

Salida: `android/app/build/outputs/apk/debug/app-debug.apk`

> No usar `build-apk.bat` legacy — delega a `npm run android:apk`.

## Play Store AAB firmado

```powershell
.\build-play-store.bat
# o con upload:
.\build-play-store.bat publish internal
```

Requisitos: `android/keystore.properties`, `android/app/google-services.json`

Salida: `EntrenaMatch-release.aab`

## QA manual APK (5 min)

1. Login / demo entra sin boot loop
2. Toggle LIVE → pin en Mapa LIVE
3. Explorar: swipe + botones PASAR/ENTRENAR visibles
4. Wearable: pasos/kcal en tarjeta actividad (Samsung + Health Connect)
5. Fuel: balance del día muestra quema del reloj
6. Back hardware cierra overlays

## Play Console

- [ ] Health features declaration (Health Connect)
- [ ] Release notes user-facing (`PLAY_INTERNAL_vX.md`)
- [ ] Track: `internal` o `closed` para beta
