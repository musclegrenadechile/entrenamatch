# EntrenaMatch — Tu Comunidad en vivo

**EntrenaMatch** conecta personas que entrenan cerca de ti en tiempo real: **Mapa LIVE**, conectar por deporte/horario y **EntrenaSync** para sesiones compartidas.

- **Piloto activo:** Viña del Mar · Valparaíso · Concón (Chile)
- **Registro:** Chile, Perú, México y USA (+18, entreno en serio — no dating)
- **Tagline:** *Tu Comunidad en vivo*

## Características principales

- **Mapa LIVE**: Quién entrena ahora cerca — cancha, pista, gym o costanera.
- **EntrenaSync**: Sesión sincronizada en tiempo real con tu compañero/a de entreno.
- **Explorar**: Conectar con perfiles compatibles por deporte, nivel y disponibilidad.
- **Comunidad**: Muro, invitaciones a club/equipo, stories para Instagram.
- **Copa Zona** (piloto costero): Valparaíso vs Santiago — minutos LIVE + sync.

Otras:
- Swipe fluido estilo matching (arrastre + botones)
- Ubicación por GPS + distancia real en km entre usuarios
- Filtros avanzados: edad, distancia, tipo de entrenamiento, disponibilidad
- Chat después del match + sesiones grupales + voz
- 18+ enforcement estricto + reportes/bloqueos
- Términos de Servicio, Política de Privacidad y Directrices de Comunidad
- Perfiles de Chile (Santiago, Viña, Valparaíso, Concepción...) + varios países

## Demo Público

Puedes probar la aplicación directamente aquí (versión pública de prueba):

**→ [Probar EntrenaMatch en GitHub Pages](https://musclegrenadechile.github.io/entrenamatch/)**

**Notas importantes de la versión pública:**
- Google Sign-In está **deshabilitado** temporalmente.
- Usa email + contraseña para crear una cuenta de prueba.
- Todos los datos se guardan solo en tu navegador (se pierden al limpiar caché o usar modo incógnito).
- Ideal para probar swipe, squads, sesiones, chat grupal y reseñas.

## Pre-Alpha Real (Backend Firebase activo — para testers)
**Phase 0 sign-off ready.** La versión en GitHub Pages soporta **cuentas reales multi-usuario** con Firebase Auth + Firestore (sobrevive hard refresh y funciona cross-device).

- Crea cuenta real con email.
- Completa onboarding (incluye cámara nativa si usas la APK).
- Perfiles reales visibles en Explorar para otros testers (+ 30 perfiles fake realistas de Reñaca/Viña del Mar/Concón con fotos, género balanceado para pruebas de interacción inmediata).
- Matches, chat 1:1 y sesiones + chat grupal **en tiempo real** (bg onSnapshot + active listeners + polling; "si alguien envía un mensaje uno lo reciba" en lista y vista abierta + auto-scroll al fondo). **Nuevo:** notificaciones toast + badge en tab/campana + notif del navegador (web) cuando llega mensaje mientras estás en otra pestaña o la app oculta.
- Sesiones con rol admin para el creador (cerrar + expulsar participantes con badge ADMIN; los demás solo pueden salir).
- Escape hatches siempre visibles (barra superior teal PRE-ALPHA v0.1.0-prealpha + "Cambiar cuenta" en Perfil). UI limpia en Explorar (sin botones flotantes rojos/guía ni instrucciones que molesten al elegir perfiles/swipe).
- Feedback estructurado de beta en tu Perfil (categoría + estrellas + historial visible).
- Versión visible en barra superior y footer de Perfil.

**Guías clave para esta fase:**
- [BETA_TESTERS_GUIDE.md](BETA_TESTERS_GUIDE.md) — cómo instalar desde Play Internal/Closed (oculto), cómo reportar, **protocolo exacto para probar chats en tiempo real con fakes**.
- [PLAY_STORE_ASSETS.md](PLAY_STORE_ASSETS.md) — textos listos + prompts para subir AAB firmado a testing oculto.
- [PREALPHA_REAL_TESTING_GUIDE.md](PREALPHA_REAL_TESTING_GUIDE.md) — flujo de prueba cross-device.
- **NEW:** Automated Play publishing via `publish-play.bat` (or let Grok run it via terminal) — see PRODUCTION_AND_APK.md "Automated Play Store publishing". Place service account key once, then AI can "sube todo" without manual Console uploads.
- APK builds automáticos en cada push (GitHub Releases tag `android-prealpha` o Actions artifacts).
- AAB firmado listo para Play Console Internal testing (no se publica). Use `publish-play.bat closed` for automation.

**Importante:** Después de cada `git push` haz hard refresh (Ctrl+Shift+R). La app está en Pre-Alpha oculta para pruebas con grupo cerrado. Usa los fakes + 2 cuentas reales en dispositivos distintos para validar "chat en vivo".
- Ver INFORME_PROBLEMA_COMUNICACION_USUARIOS_REALES.md en el repo para el análisis completo y honesto de por qué antes no se podía comunicar entre usuarios reales (causas: matches no reactivos, closures en Actualizar, reglas de likes faltantes, etc.) y cómo se resolvió en Phase 0.

## Cómo ejecutar localmente

El clon de git normalmente crea la carpeta `entrenamatch/` (nombre del repo). Si tu carpeta local se llama `fitvina` (nombre legacy previo al rename del proyecto), renómbrala a `entrenamatch` para que aparezca correctamente como "entrenamatch" en listas de proyectos/sesiones de Grok y herramientas.

```bash
cd entrenamatch
npm install
npm run dev
```

Abre http://localhost:5173

Se recomienda abrirla en tamaño móvil (DevTools → Responsive).

### Deep links (testers)

La app acepta parámetros en la URL para abrir tabs directamente:

| URL | Abre |
|-----|------|
| `?tab=map` | Tab **Mapa** (GymPulse fullscreen) |
| `?tab=explore` | Explorar (swipe) |
| `?tab=home` | Hoy (Mi día / Muro) |
| `?tab=red` | Matches y chat |
| `?tab=profile` | Perfil |
| `?tab=explore&map=1` | Explorar con mapa embebido visible |

Ejemplo en GitHub Pages: `https://musclegrenadechile.github.io/entrenamatch/?tab=map`

## Aspectos Legales importantes (incluidos en la app)

- Verificación explícita de ser mayor de 18 años
- Consentimiento claro para compartir ubicación
- Aviso de que es una plataforma para **entrenamiento y deporte**, no para citas románticas
- Políticas de privacidad y términos de uso completos
- Directrices de comunidad (respeto, seguridad, encuentros en lugares públicos)

## Stack técnico

- React + TypeScript + Vite
- Tailwind CSS + Framer Motion
- Firebase Auth + Firestore para modo real multi-usuario (además de demo localStorage)
- Dual mode: demo público + Pre-Alpha real backend (cuentas persisten cross-device)

---

**EntrenaMatch** — Entrena con alguien cerca. En cualquier parte del mundo.

Hecho con ❤️ para la comunidad fitness hispanohablante.

---

## Despliegue en GitHub Pages (versión pública)

Esta app está configurada para desplegarse fácilmente en GitHub Pages.

### Pasos para desplegar:

1. Asegúrate de tener el remote correcto:
   ```bash
   git remote -v
   ```

2. Compila la aplicación:
   ```bash
   npm run build
   ```

3. Sube la carpeta `dist` a la rama `gh-pages` (o usa GitHub Actions).

La configuración de `vite.config.ts` ya incluye:
```ts
base: '/entrenamatch/',
```

Una vez desplegado, la app estará disponible en:
`https://musclegrenadechile.github.io/entrenamatch/`

> **Nota**: Para un demo público real, se recomienda usar Firebase Hosting o Vercel en el futuro (mejor rendimiento y soporte de funciones serverless).

## Production & Mobile (Android APK)

See [PRODUCTION_AND_APK.md](./PRODUCTION_AND_APK.md) for:
- Where to host for real Tinder/Badoo-like scale and reliability (Firebase Hosting recommended, with path to custom backend later).
- Full instructions + setup already done to generate a real Android .apk / .aab using **Capacitor** (no big rewrite of the React web app).

Quick start for APK:
```bash
npm run android:build
npx cap open android
```
(then Build APK in Android Studio)

All the infrastructure for moving off GitHub Pages and having a native Android app is now in the repo.
