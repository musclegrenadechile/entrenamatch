# EntrenaMatch — iOS (Capacitor)

**Bundle ID:** `com.entrenamatch.app`  
**Versión inicial:** `0.1.324` (build `324`)  
**Estado:** proyecto Xcode generado en `ios/` — requiere **Mac + Xcode** para compilar y subir a TestFlight.

## Lo que ya está hecho (desde Windows)

- `@capacitor/ios` instalado
- Carpeta nativa `ios/App/` creada con Capacitor 8 (SPM)
- Web assets sincronizados (`npm run ios:build`)
- `Info.plist`: permisos (ubicación, cámara, galería, micrófono)
- Deep link Spotify: `com.entrenamatch.app://spotify-auth` (igual que Android)
- Scripts npm: `ios:build`, `ios:open`, `cap:open:ios`
- Mismo `appId` que Android y web

## Requisito: Mac con Xcode

No se puede firmar ni instalar en iPhone real desde Windows. Necesitas:

1. **Mac** con Xcode 15+ (recomendado 16)
2. **Apple Developer Program** ($99/año) para TestFlight / App Store
3. Cuenta **App Store Connect** con app iOS registrada (`com.entrenamatch.app`)

## Paso 1 — Clonar / abrir en Mac

```bash
cd entrenamatch   # o fitvina
npm install
npm run ios:build
npx cap open ios
```

Abre `ios/App/App.xcworkspace` o el proyecto en Xcode.

## Paso 2 — Firebase iOS

1. [Firebase Console](https://console.firebase.google.com/project/entrenamatch) → **Add app** → **iOS**
2. Bundle ID: **`com.entrenamatch.app`** (exacto)
3. Descargar **`GoogleService-Info.plist`**
4. Arrastrarlo a **`ios/App/App/`** en Xcode (marca "Copy items" + target **App**)

### Google Sign-In (URL scheme)

En `GoogleService-Info.plist` busca `REVERSED_CLIENT_ID` (ej. `com.googleusercontent.apps.XXXX`).

En Xcode → **App** target → **Info** → **URL Types** → agregar:

| Field | Value |
|-------|--------|
| Identifier | `GoogleSignIn` |
| URL Schemes | valor de `REVERSED_CLIENT_ID` |

Sin esto, **Continuar con Google** falla en iOS nativo.

## Paso 3 — Capabilities en Xcode

Target **App** → **Signing & Capabilities**:

| Capability | Motivo |
|------------|--------|
| **Push Notifications** | FCM / avisos LIVE |
| **Background Modes** → Remote notifications | Push en background |
| **Sign in with Apple** | Opcional; Google suele bastar para beta |

Team de desarrollo: tu Apple ID / equipo EntrenaMatch.

## Paso 4 — Spotify (GymSound)

Ya configurado en código:

- Redirect: `https://entrenamatch.web.app/spotify-callback.html`
- Vuelta a app: `com.entrenamatch.app://spotify-auth`

En [Spotify Dashboard](https://developer.spotify.com/dashboard) el redirect URI HTTPS ya está. No hace falta URI extra para iOS.

## Paso 5 — Build y probar en dispositivo

1. Conecta iPhone por USB
2. Xcode → selecciona tu iPhone como destino
3. **Product → Run** (⌘R)
4. Si falla firma: **Signing & Capabilities** → Automatic signing + tu Team

## Paso 6 — TestFlight (beta cerrada)

1. **Product → Archive**
2. **Distribute App** → **App Store Connect** → Upload
3. App Store Connect → **TestFlight** → testers internos
4. Notas de versión: ver `PLAY_INTERNAL_v0.1.323.md` adaptado a iOS

## Comandos útiles

```bash
# Sincronizar web → iOS después de cambios en src/
npm run ios:build

# Abrir Xcode
npm run ios:open

# Solo sync (sin rebuild web)
npx cap sync ios
```

## Diferencias vs Android (conocidas)

| Feature | Android | iOS |
|---------|---------|-----|
| Play Integrity | ✅ | ❌ (no aplica; botón 🛡️ muestra "no disponible") |
| Botón Atrás hardware | `useAndroidBackHandler` | Gesto iOS / cerrar modales |
| Google Sign-In | SHA-1 + native plugin | `GoogleService-Info.plist` + URL scheme |
| Push | FCM + `google-services.json` | FCM + APNs key en Firebase + capability |
| GymSound Spotify | ✅ | ✅ (mismo flujo Browser + deep link) |
| Mapa LIVE | ✅ | ✅ (misma web app) |

## Checklist antes de primera beta iOS

- [ ] `GoogleService-Info.plist` en `ios/App/App/`
- [ ] URL scheme `REVERSED_CLIENT_ID` en Xcode
- [ ] Push Notifications capability
- [ ] APNs key subida en Firebase → Cloud Messaging
- [ ] Icono 1024×1024 en `Assets.xcassets/AppIcon`
- [ ] Probar: login Google, LIVE + mapa, GymSound, EntrenaSync
- [ ] Privacy manifest / App Privacy en App Store Connect

## Próximas fases (desarrollo)

1. **Fase A** — Primera build en dispositivo (login + mapa)
2. **Fase B** — Push notifications APNs
3. **Fase C** — TestFlight 10–20 testers Viña/Santiago
4. **Fase D** — App Store review (paridad con Android closed beta)

---

¿Tienes Mac disponible? Con eso el siguiente paso es colocar `GoogleService-Info.plist` y hacer el primer **Run** en Xcode.
