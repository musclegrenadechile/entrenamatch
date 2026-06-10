# Registro local — Play Store (EntrenaMatch)

Documento de referencia para el equipo. **No contiene secretos** (contraseñas/keys están en archivos gitignored en esta máquina).

## App en Play Console

| Campo | Valor |
|-------|--------|
| Package | `com.entrenamatch.app` |
| App name | EntrenaMatch |
| Track objetivo | **Closed testing** (beta cerrada, app oculta) |
| Última subida conocida (dispositivo) | `versionCode` **324** · `versionName` **0.1.324** |
| **Próxima subida (preparada)** | `versionCode` **325** · `versionName` **0.1.325** (fix descartar sesión / gadget fantasma) |
| Doc release | `PLAY_INTERNAL_v0.1.325.md` |
| AAB para subir | `EntrenaMatch-release.aab` (raíz del repo) |
| Script build | `build-play-store.bat` |

> Play Store exige que cada AAB tenga `versionCode` **estrictamente mayor** que el anterior. No subir 91 hasta confirmar que 90 ya está en Console.

## Archivos locales (máquina de desarrollo)

Ubicación esperada en `C:\Users\muscl\fitvina\android\`:

| Archivo | Propósito | En repo |
|---------|-----------|---------|
| `keystore.properties` | Alias + rutas del keystore release | ❌ gitignored |
| `release-key.keystore` (o ruta en properties) | Firma release | ❌ gitignored |
| `play-service-account.json` | Gradle Play Publisher → subida automática | ❌ gitignored |
| `app/google-services.json` | FCM, Firebase nativo | ❌ gitignored |

Plantilla: `android/keystore.properties.example`

### Verificar en tu PC (PowerShell)

```powershell
cd C:\Users\muscl\fitvina\android
Test-Path keystore.properties
Test-Path play-service-account.json
Test-Path app\google-services.json
```

Si los tres son `True`, puedes publicar con:

```cmd
cd /d C:\Users\muscl\fitvina
publish-play.bat closed
```

## Scripts de publicación

| Script | Qué hace |
|--------|----------|
| `build-play-store.bat` | **Recomendado** — version check + web + AAB firmado (`EntrenaMatch-release.aab`) |
| `build-play-store.bat publish internal` | Igual + subida automática vía Play API |
| `build-release.bat` | Solo Gradle bundleRelease (sin rebuild web) |
| `publish-play.bat closed` | Build web + Cap sync + `gradlew publishBundle` → track closed |
| `build-aab-now.bat` | Solo AAB debug sin subir |

## URLs legales (Play Console)

- Privacidad: https://musclegrenadechile.github.io/entrenamatch/privacy.html
- Términos: https://musclegrenadechile.github.io/entrenamatch/terms.html

## Web vs APK (testers)

| Canal | URL / install |
|-------|----------------|
| Web (principal testers) | https://musclegrenadechile.github.io/entrenamatch/ |
| APK closed | Link privado Play Console |

## Troubleshooting `publish-play.bat`

### "No se esperaba . en este momento"
Bug corregido: un `echo` dentro de `( )` tenía paréntesis en el texto `(Firebase/push init fails)` y CMD cerraba el bloque antes de tiempo. Actualiza el `.bat` del repo.

### "No se esperaba :" 
Ejecuta desde **cmd.exe**, no PowerShell:
```cmd
cd /d C:\Users\muscl\fitvina
publish-play.bat closed
```
(`close` también funciona — se normaliza a `closed`.)

### "Version code 91 has already been used"
Play ya tiene ese código. Sube `versionCode` en `android/app/build.gradle` (ahora **92** / `0.1.88`) y vuelve a correr el script.

## Google Sign-In

Ver checklist completo: [`GOOGLE_AUTH_SETUP.md`](GOOGLE_AUTH_SETUP.md)

Dominio obligatorio en Firebase: `musclegrenadechile.github.io`

## Checklist antes de subir 0.1.88 (92)

- [ ] `versionCode` 92 en `android/app/build.gradle`
- [ ] `versionName` 0.1.88
- [ ] `webContentsDebuggingEnabled` desactivado en builds Play (default en `capacitor.config.ts`)
- [ ] `google-services.json` con package `com.entrenamatch.app`
- [ ] Probar E2E: live + EntrenaSync + Arena FOMO + push (Functions desplegadas)
- [ ] Firebase Auth: dominio `musclegrenadechile.github.io` autorizado (web testers)
- [ ] Release notes en Play Console (español): Arena FOMO, testigos reales, fixes live/sync

## Release notes sugeridas (0.1.87)

```
• Arena EntrenaSync: ticker FOMO en vivo, contador de presencia, ondas en cada acción
• Barra flotante cuando minimizas la Arena — no pierdes el sync
• Contador real de testigos en Firestore (quien abre GymPulse/feed durante tu sync)
• Mejoras live + Entrenar juntos + geolocalización
• Preparación beta cerrada: versión estable 0.1.87
```

## Firebase backend (deploy)

CI (`firebase-deploy.yml`) en push a `main` despliega:

- Firestore rules + indexes
- **Storage rules** (fotos muro, voz chat)
- **Cloud Functions** (`notifyRedNetworkLiveOrSync` — push a tu Red)
- Firebase Hosting (base `/`)

Deploy manual si hace falta:

```bash
firebase deploy --only storage,functions --project entrenamatch
```

## Notas de seguridad

- Nunca commitear `keystore.properties`, `.keystore`, `play-service-account.json`, `.env`
- Service account: rol **Release manager** mínimo en Play Console → API access
- Primera vez en track closed: a veces hace falta un upload manual del AAB para crear el track
