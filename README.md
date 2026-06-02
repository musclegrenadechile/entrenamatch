# EntrenaMatch — El match del movimiento

**EntrenaMatch** es una plataforma para conectar con personas que entrenan cerca de ti y construir tu equipo de entrenamiento, en cualquier parte del mundo.

La app tiene un enfoque fuerte en **Chile** para su lanzamiento inicial, pero está diseñada para ser completamente global.

## Nueva dirección del proyecto

- Nombre: **EntrenaMatch**
- Solo para **mayores de 18 años**
- Enfoque en **entrenamiento y actividades deportivas** (no es una app de citas románticas)
- Ubicación por GPS real + cálculo de distancia
- Lanzamiento inicial en Chile, pero con perfiles de todo el mundo

## Características principales

- Swipe fluido estilo matching (arrastre + botones)
- Ubicación por GPS + distancia real en km entre usuarios
- Filtros avanzados: edad, distancia, tipo de entrenamiento, disponibilidad
- Chat después del match
- 18+ enforcement estricto
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
La versión en GitHub Pages ahora soporta **cuentas reales multi-usuario** con Firebase Auth + Firestore (sobrevive hard refresh y funciona cross-device).

- Crea cuenta real con email.
- Completa onboarding (incluye cámara nativa si usas la APK).
- Perfiles reales visibles en Explorar para otros testers.
- Matches, chat 1:1 y sesiones + chat grupal reales.
- Escape hatches siempre visibles (barra superior teal + "Cambiar cuenta" en Perfil).
- Feedback estructurado de beta en tu Perfil (con historial).

**Guías clave para esta fase:**
- [BETA_TESTERS_GUIDE.md](BETA_TESTERS_GUIDE.md) — cómo instalar desde Play Internal/Closed (oculto), cómo reportar.
- [PLAY_STORE_ASSETS.md](PLAY_STORE_ASSETS.md) — textos listos + prompts para subir AAB firmado a testing oculto.
- [PREALPHA_REAL_TESTING_GUIDE.md](PREALPHA_REAL_TESTING_GUIDE.md) — flujo de prueba cross-device.
- APK builds automáticos en cada push (GitHub Releases tag `android-prealpha` o Actions artifacts).
- AAB firmado listo para Play Console Internal testing (no se publica).

**Importante:** Después de cada `git push` haz hard refresh (Ctrl+Shift+R). La app está en Pre-Alpha oculta para pruebas con grupo cerrado.

## Cómo ejecutar localmente

```bash
cd fitvina
npm install
npm run dev
```

Abre http://localhost:5173

Se recomienda abrirla en tamaño móvil (DevTools → Responsive).

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
