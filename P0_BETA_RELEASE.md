# P0 Beta Release — v0.1.104

Checklist para cerrar Tier 0 antes de ampliar beta cerrada en Play Store.

## Versiones alineadas

| Artefacto | Valor |
|-----------|-------|
| Web / `APP_VERSION` | **0.1.104** |
| `package.json` | 0.1.104 |
| Android `versionCode` | **104** |
| Android `versionName` | 0.1.104 |

## 1. Deploy Firebase (obligatorio antes de testers)

```powershell
cd C:\Users\muscl\fitvina
firebase deploy --only firestore:rules
```

### Nuevas colecciones / reglas

- **`mapEditors/{uid}`** — añade manualmente en Firebase Console el UID de quien puede editar partners en el mapa. Sin este doc, `partnerLocations` write falla (intencional).
- **`clientErrorReports`** — errores JS de usuarios autenticados (solo create; lectura admin vía Console).

## 2. Editor de mapa (dev)

1. Crea `.env.local` (no commitear):

   ```
   VITE_DEV_MAP_PASSWORD=tu_password_largo_aqui
   ```

2. En Firestore Console → `mapEditors` → doc ID = tu Firebase UID → campo opcional `{ role: "map" }`.

3. Build local con env; **GH Pages no incluye password** → testers no pueden abrir editor de partners.

## 3. Build AAB y subir a Play Closed

```powershell
cd C:\Users\muscl\fitvina
# Requiere: android\keystore.properties + android\play-service-account.json + google-services.json
publish-play.bat closed
```

Si falla por `versionCode` ya usado en Play, sube a **105** en `android/app/build.gradle` y repite.

### What's new (copy-paste Play Console)

```
v0.1.104 — Beta seguridad + estabilidad
• Reglas Firestore reforzadas (chat solo entre matches, sync solo participantes)
• Reportes de errores JS para debugging en beta
• Deep links push team_live/sync (0.1.103)
• Red local: reto ciudad, gym check-in, squads LIVE
• Perfil hidratado más rápido al abrir la app
```

## 4. Matriz QA mínima (2 dispositivos)

| # | Flujo | Pass |
|---|-------|------|
| 1 | Registro → onboarding → Tab Hoy | ☐ |
| 2 | LIVE → visible en mapa otro usuario | ☐ |
| 3 | Match → chat 1:1 (verificar rules: sin match no envía) | ☐ |
| 4 | EntrenaSync → Arena → post en muro | ☐ |
| 5 | Push team_live → abre mapa (APK) | ☐ |
| 6 | Squad chat | ☐ |
| 7 | Foto muro → Storage | ☐ |
| 8 | Gym check-in + filtro "solo mi gym" | ☐ |
| 9 | Logout / login sin pantalla negra | ☐ |
| 10 | Crash nativo aparece en Firebase Crashlytics | ☐ |

## 5. Crashlytics

- **Nativo:** ya habilitado en `MainActivity.java` + Gradle.
- **JS:** breadcrumbs en `clientErrorReports` (Firestore).
- Verificar en [Firebase Console → Crashlytics](https://console.firebase.google.com/project/entrenamatch/crashlytics) tras instalar AAB.

## 6. Post-release

- [ ] Actualizar `PLAY_RELEASE_REGISTRY.md` con code 104
- [ ] Hard refresh web testers (Ctrl+Shift+R)
- [ ] Confirmar `GEMINI_API_KEY` en Functions para Fuel AI
