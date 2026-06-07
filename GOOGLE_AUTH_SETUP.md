# Google Sign-In — Configuración EntrenaMatch

Guía para que **Continuar con Google** funcione en web (GitHub Pages), localhost y APK (Play Store closed).

## 1. Firebase Console (obligatorio, una vez)

Proyecto: **entrenamatch**  
URL directa: https://console.firebase.google.com/project/entrenamatch/authentication/providers

### A) Activar proveedor Google

1. **Authentication** → **Sign-in method**
2. **Google** → **Enable**
3. Project support email: tu email de desarrollador
4. **Save**

### B) Dominios autorizados

**Authentication** → **Settings** → **Authorized domains** → **Add domain**

Agregar estos (si no están):

| Dominio | Uso |
|---------|-----|
| `localhost` | Dev local + Capacitor WebView |
| `musclegrenadechile.github.io` | Web testers GH Pages |
| `entrenamatch.firebaseapp.com` | Redirect handler Firebase |
| `entrenamatch.web.app` | Firebase Hosting |

> Sin `musclegrenadechile.github.io` verás: *"This domain is not authorized for OAuth operations"*.

### C) SHA-1 para APK (recomendado)

**Project settings** → **Your apps** → Android `com.entrenamatch.app` → **Add fingerprint**

Obtener SHA-1 del keystore release:

```cmd
keytool -list -v -keystore android\release-key.keystore -alias entrenamatch
```

(Password desde `android/keystore.properties`)

Esto mejora compatibilidad OAuth en builds nativos.

---

## 2. Cómo funciona en código

| Plataforma | Método |
|------------|--------|
| APK Capacitor | Native Google Sign-In (`@capacitor-firebase/authentication`) |
| GitHub Pages (móvil) | `signInWithPopup` |
| GitHub Pages (desktop) | `signInWithPopup` → fallback redirect si popup bloqueado |
| localhost desktop | `signInWithRedirect` |
| localhost móvil | `signInWithPopup` |

Archivos:

- `src/services/googleAuth.ts` — flujo OAuth
- `src/services/auth.ts` — perfil Firestore post-Google
- `src/components/auth/AuthScreen.tsx` — botón activo
- `src/contexts/AuthContext.tsx` — completa redirect al volver

---

## 3. Probar

### Web (GH Pages)

1. Hard refresh: `Ctrl+Shift+R`
2. **Continuar con Google**
3. Elegir cuenta → vuelves a `/entrenamatch/`
4. Si es cuenta nueva → onboarding

### APK closed testing

1. Instalar desde Play
2. **Continuar con Google**
3. Browser in-app o redirect → vuelve a la app logueado

### Errores comunes

| Error | Solución |
|-------|----------|
| `auth/unauthorized-domain` | Agregar dominio en Firebase (sección B) |
| `auth/operation-not-allowed` | Habilitar Google en Sign-in method |
| `auth/popup-blocked` | Permite popups o usa email/contraseña (ya no reintenta redirect en móvil) |
| Vuelve al login tras elegir cuenta Google | Actualiza la app/web — el redirect en móvil pierde estado; versión 0.1.89+ usa popup/native |

---

## 4. Checklist rápido

- [ ] Google provider **Enabled** en Firebase
- [ ] `musclegrenadechile.github.io` en Authorized domains
- [ ] `localhost` en Authorized domains
- [ ] SHA-1 release en app Android Firebase
- [ ] Hard refresh / reinstall APK tras deploy
- [ ] Probar login Google + completar onboarding

---

## 5. Privacidad Play Console

En **Data safety**, declarar que la app usa **Google Sign-In** para autenticación (email, nombre, foto de perfil opcional).
