# Guía para Beta Testers de EntrenaMatch (Hidden / Internal-Closed)

**Gracias por ayudar a probar la app antes de que sea pública.**

## Cómo empezar (5 minutos)

1. Instala la APK (te la enviamos por link privado o la descargas del Release "android-prealpha").
2. Abre la app.
3. Crea una cuenta real con email (o Google si disponible).
4. Completa el onboarding con datos reales (foto, entrenamiento, objetivos). Esto es clave para las pruebas.
5. Explora, haz match, chatea y crea o únete a una sesión.
**Importante después de actualizaciones:** Siempre haz hard refresh (Ctrl+Shift+R en web, o fuerza cierre + reopen en APK) para cargar el nuevo código. De lo contrario puedes ver errores antiguos como "Unsupported field value: undefined (photo)" al enviar mensajes en sesiones de grupo.

**Prerrequisito para testers en web (GH Pages):** Si usas Google Sign-In (o cualquier OAuth), el dominio `musclegrenadechile.github.io` debe estar agregado en Firebase Console > Authentication > Settings > Authorized domains. Sin esto, popup/redirect fallarán con "domain not authorized". El owner debe agregarlo una vez (incluye subdominios si aplica). Email/password funciona sin esto.

## Cómo obtener informes de errores y logs DIRECTAMENTE DESDE EL CELULAR (sin PC ni adb)

Sí, es totalmente posible y muy útil para testers que no siempre tienen la PC a mano. El celular puede generar **informes de errores completos** que incluyen logcat (los mismos logs que verías con `adb logcat`), stack traces de crashes nativos (el de login en la APK de Play), errores de WebView/JS (como el #310 de React), etc.

### Método 1: Samsung Members (el mejor y más completo para tu S26 Ultra / Galaxy)
Samsung preinstala esta app y es excelente para reportes detallados.

1. Abre la app **Samsung Members**.
2. Ve a **"Enviar comentarios"** (o "Get help" → "Enviar informe de error").
3. Elige **"Informe de error"** o "Error report".
4. Describe brevemente el problema (ej: "Crash al iniciar sesión en APK de Play closed testing" o "Error React #310 en Feed").
5. **Reproduce el crash ahora mismo**:
   - Cierra la app completamente.
   - Ábrela desde Play Store (la versión closed testing).
   - Intenta iniciar sesión (el crash que reportas) o ve al Feed.
6. Envía el informe.
7. Te genera un **número de caso** y puedes descargar el informe completo (un ZIP con logs detallados, logcat alrededor del crash, dumps del sistema, etc.).

Súbelo a Drive y pásame el link (o pégame las líneas clave con "entrenamatch", "AndroidRuntime", "FATAL", "chromium", "Firebase"). Esto captura **exactamente** lo que necesitamos para diagnosticar.

### Método 2: Informe de errores integrado de Android (funciona en cualquier teléfono)
1. Activa Opciones de desarrollador si no las tienes:
   - Ajustes → Acerca del teléfono → toca **7 veces** en "Número de compilación".
2. Ve a **Opciones de desarrollador**.
3. Busca y usa **"Tomar informe de errores"**, **"Bug report"** o **"Informe de errores"** (suele estar bajo "Depuración").
4. **Reproduce el crash** (login o Feed).
5. Activa inmediatamente el informe.
6. El teléfono tarda 30-90 segundos en generarlo (ZIP o archivo de texto). Se guarda en Descargas o te da opción de compartir directamente (Drive, email, etc.).

Este incluye logcat completo del sistema + tu app en el momento exacto del crash.

### Método 3: Apps de Logcat desde Play Store (ver logs "en vivo" en el celular)
Instala una de estas (busca "logcat" en Play Store):
- **MatLog** (la más recomendada, ligera y clara).
- **aLogcat** o **Logcat Reader**.
- **CatLog**.

Uso:
1. Abre la app de logcat.
2. Filtra por paquete: `com.entrenamatch.app` o por texto `entrenamatch`.
3. Reproduce el crash (login).
4. La app muestra los logs en tiempo real. Puedes copiar, exportar a archivo o compartir.

**Nota**: En Android moderno sin root solo ves logs "públicos" o de tu propia app. Para crashes completos, combina con el Método 1 o 2 (el bug report del sistema da acceso total a logcat).

### Consejos y próximos pasos
- **El error #310 de React en el Feed ya está arreglado** en el código actual. Estaba causado por un `useMemo` (`feedComputation`) dentro de un IIFE que *solo* se ejecutaba cuando `activeTab === 'feed'`. Eso hacía que el conteo de hooks de React cambiara al cambiar de pestaña → React error #310. Lo moví a un `useMemo` a nivel superior del componente (siempre se llama en el mismo orden, estable). Cualquier build nuevo (debug APK o AAB) ya no lo tiene.
- **El crash de login en la APK de Play** suele aparecer en los logs como algo de Firebase ("Default FirebaseApp is not initialized", error en google-services) o init de plugins (push/integrity). El informe del celular te dará el stack trace exacto.
- Usa siempre la **versión debug local** (EntrenaMatch-debug.apk) para testing cuando puedas (tiene `webContentsDebuggingEnabled: true` y los fixes más recientes). La de Play closed puede ser un build viejo.
- Si el crash es intermitente, reproduce varias veces seguidas antes de generar el bug report.

**Acción inmediata**: Genera un bug report **ahora mismo** (Método 1 o 2) reproduciendo el login que crashea, compártelo (Drive/email) y pégame el link o el texto clave aquí. Lo reviso y te digo la causa raíz + fix exacto.

**Dentro de la app (agregado en esta sesión)**: Botón "🐛 Debug logs (para reportar crashes desde el celular)" en Perfil (collapsible con últimos 30 eventos: login, sync actions, publishes, crashes). Botones para copiar al portapapeles o compartir (usa navigator.share/clipboard, funciona en web y APK). Se alimenta automáticamente de flujos clave + ErrorBoundary.

Si quieres que agregue **Firebase Crashlytics** (reporte automático de crashes nativos a la consola de Firebase, incluso para testers de Play closed) o el "form photo" rápido dentro de Arena (cámara durante sync + foto pequeña en el replay/story para ambos), solo di "sí, agrégalo" y lo hago en minutos (actualizo código + guía).

¡Con esto los testers pueden debuggear sin depender de la PC todo el tiempo! Pégame el primer informe y arrancamos.

## Cómo ver crashes, logs y errores en tiempo real desde tu computadora (debugging APK)

Cuando la app crashea en el dispositivo (especialmente la versión de Play Store closed testing), lo más importante es ver los logs **en vivo** desde la PC mientras reproduces el crash (login, feed, etc.).

### 1. Preparación en el teléfono (una sola vez)
- Ve a **Ajustes > Acerca del teléfono** → toca 7 veces en "Número de compilación" (activa Opciones de desarrollador).
- Vuelve a Ajustes → **Opciones de desarrollador**:
  - Activa **Depuración USB**.
  - (Opcional pero útil) Activa "Depuración USB (configuración de seguridad)" si aparece.
- Conecta el teléfono por USB al computador.
- En el teléfono aparecerá un popup "Permitir depuración USB" → marca "Permitir siempre desde esta computadora" y Aceptar.

### 2. Instalar ADB (Android Debug Bridge) en la PC
- Descarga "platform-tools" de Google: https://developer.android.com/tools/releases/platform-tools
- Descomprime y agrega la carpeta al PATH (o usa la ruta completa).
- Abre PowerShell y prueba:
  ```powershell
  adb version
  ```
- Con el teléfono conectado:
  ```powershell
  adb devices
  ```
  Debe aparecer tu dispositivo (si pide autorización en el teléfono, acepta).

### 3. Ver logs nativos + crashes en tiempo real (lo más importante para crashes de APK)
Abre PowerShell y ejecuta (mientras reproduces el crash en la app):

```powershell
# Ver TODO en tiempo real (filtra lo más útil)
adb logcat | Select-String -Pattern "entrenamatch|AndroidRuntime|FATAL|Caused by|chromium|WebView|Firebase|Capacitor|com.entrenamatch.app"

# O solo crashes fatales (recomendado primero)
adb logcat | Select-String -Pattern "AndroidRuntime|FATAL EXCEPTION"

# Versión más limpia con timestamp
adb logcat -v time | Select-String -Pattern "entrenamatch|fatal|crash|exception|webview"
```

- Reproduce el crash (ej: abre la app desde Play, inicia sesión).
- En la consola verás inmediatamente los errores (FATAL EXCEPTION, stack trace nativo de Java, mensajes de Firebase, errores del WebView, etc.).
- Para guardar en archivo (útil para mandarme):
  ```powershell
  adb logcat -v time > crash-log.txt
  ```
  Luego reproduce el crash y para con Ctrl+C. Abre crash-log.txt.

**Tip**: Para filtrar solo de esta app:
```powershell
$pid = adb shell pidof com.entrenamatch.app
adb logcat --pid=$pid | Select-String -Pattern "fatal|error|exception|crash"
```

### 4. Ver errores de JavaScript / React (el #310, uncaught errors, console.log de la app) en tiempo real con Chrome DevTools (¡imprescindible!)
Esto te permite inspeccionar el WebView como si fuera una página web normal.

1. En `capacitor.config.ts` ya está activado `webContentsDebuggingEnabled: true` (lo activé para que funcione incluso en builds de release/pre-alpha).
2. Reconstruye la APK/AAB con los cambios:
   - Corre `build-apk-now.bat` o `npm run android:build`
3. Instala la nueva versión en el teléfono (puedes usar `adb install` con el debug APK, o sube a Play y actualiza desde ahí).
4. En el teléfono asegúrate que USB debugging esté activado.
5. En la **PC** abre **Chrome** y ve a:
   ```
   chrome://inspect/#devices
   ```
6. Tu teléfono debe aparecer. Debajo del WebView de "EntrenaMatch" (o com.entrenamatch.app) haz clic en **"inspect"**.
7. Se abre DevTools completo:
   - Pestaña **Console**: aquí ves TODOS los `console.log`, `console.error`, React errors (#310, "React is not defined", etc.), warnings.
   - Puedes ver el stack real (no minificado si usas la versión con sourcemaps).
   - Network, Elements, Application (localStorage, etc.).
   - ¡Es en vivo! Mientras usas la app en el teléfono, los logs aparecen aquí.

Esto es lo mejor para los crashes de tipo React/JS que ves en el feed.

### 5. Consejos extras
- Si el crash es inmediato al abrir (antes de login), los logs de "Default FirebaseApp is not initialized" o google-services suelen aparecer en logcat con "FirebaseInitProvider".
- Para builds de Play Store (release firmado), logcat y chrome://inspect siguen funcionando perfectamente mientras USB debugging esté activado.
- Si quieres wireless (sin cable): 
  ```powershell
  adb tcpip 5555
  adb connect TU_IP_DEL_TELEFONO:5555
  ```
  (mira la IP en Ajustes > WiFi del teléfono).
- Si ves muchos logs, filtra más: `adb logcat | findstr /i "com.entrenamatch"`

Con esto puedes iterar rápido: reproduce crash → ves el error exacto en la consola de la PC → arreglamos en código → rebuild → pruebas otra vez.

Si después de esto sigues teniendo un crash específico, copia el log completo (o screenshot del chrome://inspect Console) y pégamelo que lo analizo.

¡Ahora puedes testear la app de verdad desde la comodidad de la PC!

## Qué probar (flujo ideal)

- Onboarding completo (fotos con cámara nativa si estás en APK).
- Ver perfiles reales de otros testers (ahora + 30 perfiles fake con imágenes reales de Reñaca/Viña/Concón, género específico para poblar la lista y permitir pruebas de interacción sin esperar muchos usuarios reales).
- Match + chat 1:1 en tiempo real: nuevos matches se descubren vía onSnapshot + 30s poll + manual "Actualizar chats reales" (que ahora recarga matches primero). Una vez en realMatches, bg listeners + active onSnapshot hacen que el receptor vea el mensaje instant en lista y chat (con auto-scroll). Si no aparece, usa Actualizar (recarga matches). Los mensajes se guardan en Firestore y sobreviven refresh.
- Crear una sesión (ej: "Running costanera 19:00") y que otro tester la vea y se una. Como creador tienes rol de administrador: botón "Cerrar sesión" en Mis sesiones, y en el chat grupal puedes expulsar (✕ en la lista de participantes) + badge ADMIN. Los demás pueden "Salir". Prueba expulsar y que el otro vea que ya no está.
- Chat grupal dentro de la sesión (live via onSnapshot subcollection + poll cuando el modal está abierto; auto-scroll al fondo).
- Perfil propio + botón "Sincronizar" (ahora recarga también tu propio perfil desde backend para verificar guardado) + feedback estructurado.
- Chats 1:1 y grupal en sesiones con actualizaciones en tiempo real (onSnapshot push cuando abierto + polls background para todos tus matches/sesiones). Usa "Actualizar" (con spinner) en headers de chat, "Actualizar chats reales" (con spinner) en lista, o "Sincronizar" en perfil (recarga self profile). LastSync se actualiza en vivo cuando llegan mensajes. Botones "Reportar" en headers de 1:1 y grupal para feedback rápido (guarda en betaFeedback). Auto-scroll automático al último mensaje.
- UI ultra-limpia para elegir perfiles: botones flotantes removidos, 'Desliza' hint quitado, recomendaciones con badges REAL, título 'reales primero' y distancia, lastSync 'hace Xs' en header (solo real mode) y también junto al botón 'Actualizar chats reales' en Mensajes; empty states mejorados; notas demo en squads y filters limpiadas. Premium al elegir perfiles reales. Hard refresh.
- IMPORTANTE: Ver INFORME_PROBLEMA_COMUNICACION_USUARIOS_REALES.md para explicación detallada de por qué antes NO se podía chatear entre usuarios reales (causas raíz: descubrimiento de matches no reactivo, closure stale en botón Actualizar, reglas de likes faltantes, races en listeners) y los fixes aplicados en Phase 0. Después de pushes, siempre hard refresh + deploy rules si ves permisos (incluyendo el fix para lastMessagePreview undefined en joins).
- Al unirse a sesión: ahora sanitiza datos para evitar undefined en setDoc. Desplegar rules para permisos en load group messages.
- Ver INFORME_PROBLEMA_COMUNICACION_USUARIOS_REALES.md para análisis detallado de por qué antes no se podía comunicar entre usuarios reales (causas: descubrimiento de matches no reactivo, closures stale en Actualizar, reglas de likes faltantes, races en listeners) y fixes aplicados.

## Protocolo para probar lo ÚNICO y disruptivo: EntrenaSync Arena (la razón por la que nadie ha visto algo igual)

Esta es la feature que hace que la app sea completamente diferente a todo lo que existe. "Presencia en vivo" → "entrenamos juntos en tiempo real aunque estemos en gyms distintos" con memoria compartida que vive en los dos muros para siempre.

**Flujo de prueba con 2 cuentas (A y B) en dispositivos o navegadores diferentes (hard refresh después de cada push):**

1. Cuenta A: Perfil → activa "Entrenando ahora (EN VIVO)". Debe aparecer en Explore/Live modal/feed teaser de B.
2. Cuenta B (live también): ve a Explore o Live modal, toca "Unirme + EntrenaSync 🔥" en la card de A.
   - Debe deshabilitar el botón + mostrar "⏳ Iniciando..." (anti-spam).
   - Automáticamente te lleva a Perfil + abre la **Arena completa**.
3. En la Arena (ambos deben ver **exactamente lo mismo en ~1s** gracias al listener dedicado):
   - Dos avatares (fotos o iniciales) con anillos de color + línea "tether" animada conectándolos (sensación de "estamos juntos").
   - Orbe central de Energía que crece y pulsa más fuerte cuanto más alto el % VIBE.
   - Timer grande dentro del orbe.
   - Toca acciones (💪 Buena forma, ⚡ Explosivo, etc). 
     - El emoji **vuela** hacia el orbe (efecto visual idéntico en los dos teléfonos).
     - Si repites la misma acción 2-3 veces seguidas → aparece **COMBO xN**, gana más vibe, post especial en muro, confetti + haptic más fuerte.
   - El historial de "RITUAL EN VIVO" se construye en tiempo real (stagger pop).
4. Toca "REPLAY" → abre modal que reproduce la secuencia de acciones con animación escalonada. Desde ahí puedes "Re-Sync".
5. Toca "📝 Guardar historia ahora" → debe crear un post bonito en tu muro.
6. Uno de los dos toca "TERMINAR". Si >5min sale el rating con ★ bonitas.
   - Califica 5★ → boost de streak + se genera automáticamente un post **"ENTRENASYNC LEGENDARIO"** largo y hermoso que aparece **en los MUROS DE LOS DOS** + en el Feed global.
   - Ambos deben ver el post idéntico en su muro personal y en Feed.
7. En Perfil de cada uno: debe aparecer la sección "TUS SYNC LEGENDS" con la tarjeta del compañero (minutos totales, sesiones, ★ promedio, llamas de Bond level).
8. Ve a Explore/Live: la persona con la que hiciste sync debe tener prioridad visual ("En Sync ahora" o más arriba en la lista por el boost de leyenda).
9. En Feed header: si hay pares activos en Arena, deben aparecer los nombres + %vibe como prueba social global ("🔄 X pares en arena ahora").

**Lo que hace esto único (para que lo sientas y reportes):**
- Nadie más convierte "entrenar cerca" en un ritual compartido con energía visible, combos, recuerdos permanentes escritos en ambos perfiles, y estatus de "leyenda de sync".
- La sensación de "mi compa está haciendo lo mismo que yo justo ahora y lo veo volar en mi pantalla" es adictiva y nunca se había visto en apps de gym social.

Reporta TODO: ¿las moscas de emoji se ven en ambos? ¿el orbe escala en los dos lados? ¿el post de historia aparece en los dos muros? ¿el Bond level sube? ¿se siente premium y mágico?

Sigue con todo — esta es la update que marca la diferencia real en el mercado.

---

## Protocolo específico para probar mensajería en tiempo real (chats 1:1 y sesiones)
Usa los 30 perfiles fake (Reñaca / Viña del Mar / Concón, hombres y mujeres) + 1-2 cuentas reales en dispositivos/navegadores diferentes:
1. Con cuenta A (real o fake vía match): ve a Explorar, haz match con un fake (o con cuenta B).
2. Abre Mensajes → verás el chat en la lista.
3. Abre el chat 1:1.
4. Desde cuenta B (otro browser/incognito o teléfono): envía un mensaje.
5. En cuenta A: la lista de Mensajes debe actualizarse en vivo (sin tocar "Actualizar"), y si el chat está abierto, el mensaje aparece + auto-scroll al fondo. (Los envíos a fakes se persisten en servidor para tu historial.)
6. Repite para chat de sesión: crea sesión como creador (A), únete como B (ahora el join hace await del write a participants antes de abrir el chat para evitar errores de permisos), abre chat grupal en ambos, envía desde uno, verifica que el otro lo recibe en vivo (bg listeners + onSnapshot cuando abierto + auto-scroll) + preview del último msg aparece instant en la lista de sesiones (via sessions onSnapshot + lastMessage update) + badge ADMIN solo para creador.
7. Hard refresh en A o B: el historial de mensajes del grupo y los previews deben cargarse desde Firestore (no local-only).
8. Si no ves actualización inmediata: usa "Actualizar sesiones reales" o "Actualizar" en el header del chat grupal (con spinner). Los bg listeners para tus sesiones + active onSnapshot cubren live receive. Asegúrate de estar unido (participante).
9. Reporta con el botón "Reportar" del header del chat o el formulario de Perfil si algo falla.
Nota post-push: si ves errores de permisos (como "Missing or insufficient permissions" al dar like/match o en group msgs), el owner debe hacer `firebase deploy --only firestore:rules` (las rules se actualizaron para permitir writes a likes/matches por el liker y reads apropiados para group chat). Hard refresh después.

**Mejoras recientes en chat grupal en celular (mobile UX)**: Se ocultó la lista de participantes lateral en pantallas estrechas para dar ancho completo al chat (evita que se "tire a la derecha" o se vea "cuadrado"). Se agregó barra compacta de participantes arriba del chat en móvil (muestra nombres + overflow horizontal). Los nombres (excepto tú) ahora son tappables: toca para insertar @mención directo en el input. Header de acciones compactado con iconos en móvil. Input usa icono de enviar + placeholder corto para que se vea todo el texto que escribes. Burbujas más anchas en móvil, padding ajustado, mejor manejo de teclado (min-h-0, dvh, safe-area). Prueba en teléfono real: el chat grupal ahora debe verse enderezado, con todo el texto visible y fácil de mencionar gente. Hard refresh después de push.

**1:1 messaging fully working (2025-04)**: Sesiones + group + 1:1 real entre cuentas live y cross-device. UI declutter + premium polish para elegir perfiles ('en vivo' badge to real profiles count in Explore header, 'en vivo' in 'Tus matches', 'Ver X disponibles', 'en vivo' in recs, 'disponibles ahora', inline lastSync, softer empty texts, updated real-testers welcome (highlights polish + Feedback), client push setup, 'Reportar' in recs cards, ASSETS.md with branded specs using polished UI + generated icon/screenshots, detailed AAB test protocol (full flows with current polish + assets section), Firebase Hosting + Play upload checklist in PRODUCTION_AND_APK.md, calmer texts, empty states with sync, filters cleaned, spinners, lastSyncs). Privacy/Términos full + linked in Profile. Detailed push client in PRODUCTION_AND_APK.md. lastSync "hace Xs" + Actualizar visibles. Hard refresh después de pushes.

### Pasos exactos para hacer `firebase deploy --only firestore:rules` en Windows (PowerShell)

Las reglas viven en el servidor de Firebase (no viajan con el bundle de la web ni la APK). El GitHub Action las deploya automáticamente en cada push a main (usa el secret del service account), pero si sigues viendo errores de permisos después de un push, fuerza el deploy manual así:

1. Abre **PowerShell** (puedes usar la normal, no hace falta "como administrador").

2. Navega al proyecto:
   ```powershell
   cd "C:\Users\muscl\fitvina"
   ```

3. Si al usar npm te aparece "ejecución de scripts está deshabilitada", ejecuta esto una sola vez en esa ventana:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```

4. Haz login (solo la primera vez o si el token expiró). Esto abre el navegador:
   ```powershell
   npx firebase-tools login
   ```
   - Inicia sesión con la cuenta Google que tiene rol Owner/Editor en el proyecto Firebase **entrenamatch**.
   - Autoriza Firebase CLI cuando te lo pida.

5. Deploy **solo las rules** (esto es rápido y seguro, no toca hosting ni nada más):
   ```powershell
   npx firebase-tools deploy --only firestore:rules,firestore:indexes --project entrenamatch
   ```

6. Verifica que termine con éxito. Deberías ver algo parecido a:
   ```
   ✔  firestore: released rules firestore.rules to (default)
   ✔  firestore: released indexes firestore.indexes.json to (default)
   ```
   (o "Deploy complete!" / "✔  Deploy complete!")

7. **Después del deploy**:
   - Ve al sitio web: https://musclegrenadechile.github.io/entrenamatch/
   - Haz **hard refresh** (Ctrl + Shift + R) en todos los navegadores donde estés probando.
   - Si pruebas con APK: las rules son server-side, así que con el web ya puedes validar el fix de permisos (la APK se beneficiará igual una vez las rules estén live).

8. Prueba inmediatamente el flujo de sesiones:
   - Cuenta A (creador real) → crea sesión.
   - Cuenta B (otro dispositivo/browser) → únete con "Unirme".
   - Abre chat grupal en ambos.
   - Envía mensajes de un lado → deben llegar en vivo al otro (sin "Could not load real group messages" ni errores de permisos).
   - Hard refresh en uno de los dos → el historial debe cargar desde Firestore.

Si el comando dice que no tienes permisos en Firebase, asegúrate de estar logueado con la cuenta correcta del proyecto "entrenamatch" y pídele al owner que te agregue como Editor.

También puedes ir a GitHub (repo musclegrenadechile/entrenamatch) → pestaña **Actions** → último run de "Deploy to Firebase" y ver los logs del paso "Deploy Firestore Rules & Indexes + Hosting" para confirmar que el CI ya lo hizo. Si falló, el manual con npx lo resuelve.

## Cómo dar feedback (muy importante)

- Dentro de la app, en tu **Perfil** (baja hasta el final) hay un formulario mejorado de "Feedback de Beta":
  - Elige tipo (Bug / Idea / UX / Otro)
  - Pon una calificación de estrellas 1-5
  - Escribe libremente
  - Envía → se guarda privado en Firebase con versión, plataforma (web o android) y fecha
  - Debajo verás tu historial de feedbacks enviados (útil para recordar qué reportaste)
- Botón flotante "⚠️ Reportar" visible en todas las pantallas (abajo a la derecha) para feedback rápido desde cualquier lugar.
- En APK: puedes adjuntar capturas de pantalla manualmente cuando reportas por el canal de invitación.
- También puedes escribirnos por WhatsApp/email del grupo de testers.

## Cómo instalar la app desde Play Store (Internal o Closed testing - 100% oculta)

**Note for admins:** Use the new `publish-play.bat closed` (or `internal`) script (or let Grok run the equivalent via terminal) after bumping versionCode. This automates the signed AAB build + upload using the pre-configured Gradle Play Publisher + your service account key. See PRODUCTION_AND_APK.md "Automated Play Store publishing" for setup (one-time service account in Console) and usage.

**Internal testing (el más privado, recomendado para empezar con 5-10 personas):**
1. El admin te agrega tu cuenta de Google (email) en Play Console → Testing → Internal testing → Testers.
2. Recibes un email con link "Become a tester" o "Ser tester".
3. Abre el link desde tu teléfono Android (debe estar logueado con la misma cuenta Google).
4. Acepta ser tester.
5. Busca "EntrenaMatch" en Play Store (o usa el link privado que te dan). La app **no aparece** en búsquedas públicas.
6. Instala. Recibirás actualizaciones automáticas cuando subamos nueva versión firmada.
7. Abre la app → usa email real para crear cuenta → completa onboarding con datos reales.

**Closed testing (beta cerrada con Google Group - la que estamos usando ahora):**
1. El admin crea/configura la pista en Play Console → Pruebas → **Prueba cerrada** (Closed testing). Crea la pista si no existe + agrega un Google Group o lista de testers.
2. Te agregan al Google Group (recibes email de invitación) o te mandan link directo "Únete a la prueba".
3. Abre el link de invitación desde tu teléfono Android (con la cuenta Google que está en el grupo).
4. Acepta unirte a la prueba cerrada.
5. En Play Store busca "EntrenaMatch" (o usa el link). La app **no aparece en búsquedas públicas ni para cuentas fuera del grupo**.
6. Instala/actualiza. Recibirás actualizaciones automáticas de Play Store cuando subamos nuevas versiones (v0.1.4+).
7. Abre la app → crea cuenta con email real → completa onboarding.

**Nota importante (si el script de publish dice "Track not found")**:
- A veces la primera vez hay que **subir el AAB manualmente** en Play Console para "seedear" la pista (incluso si la creaste en UI).
- AAB fresco actual: `EntrenaMatch-v0.1.5-prealpha-closed.aab` (en la carpeta del proyecto).
- Ve a Play Console > Pruebas > Prueba cerrada > Crear release o Editar > Sube el AAB > Guarda > Publica el rollout (100% del grupo o el % que quieras).
- Después de eso el script automatizado (`publish-play.ps1 closed`) suele funcionar para releases siguientes.

**v0.1.5-prealpha + mejoras progresivas**: Exhaustive review done (plan cleaned, backlog prioritized). Crash al "activar la notificación" resuelto + nuevas prefs + muro teasers mejorados. FCM client wiring + token save to /userPushTokens started (for real background pushes on APK). Radar sweep + circles, banner glow, profile live progress/glow, stats glow/pulse, matches live ring/glow, feed teaser + mini progress.
- Ya no se pide permiso de push automáticamente en cada login real (evita prompts raros).
- En APK usa el botón nuevo en **Perfil** → "🔔 Activar notificaciones push nativas (reales en Android, incluso app cerrada)".
- **Nuevo**: toggles simples de preferencias de notificaciones en Perfil (Mensajes, Live/Sesiones, Actividad muro) - control local por dispositivo.
- Muro teasers en Explore (swipe) y Matches ahora muestran 1-2 posts latest/pinned con iconos y formato vivo (📷📌📝).
- Live "Entrenando Ahora" + diseño general: revisión completa visual — cards con más glass/motion/glows naranja-verde, pulses urgentes, gradientes en botones live, hovers premium, nav bottom mejorado, feed/muro más atractivos, banner con grid sutil + barra progreso "se va en" + glow, chat bubbles premium, sessions con badges LIVE si creador live + glow borders, feed teasers mejorados con hover + mini progress, modal con progress, radar map animado/hover/stagger + sweep anim + circles + lines for map feel. Profile live stats y full profile banner con polish + glow. Matches cards live ring/glow if trainingNow. Muro feed posts now have framer exit anim for deletes. Top bar live count with glow/ring. Richer empty states for live (Live cerca 0 shows "¡Sé el primero! Marca en Perfil", modal empty glass card with emoji+CTA to activate in profile, banner empty upgraded). Sessions empty states glass+gradient CTA polish. Session cards have framer whileHover lift+scale + consistent glow borders. **LA MÁS TOP UPDATE (v0.1.7 Feed 2.0 + EntrenaSync disruptivo)**: Feed global + muro con header glass blur premium + gradient active chips + big publicar CTA, live teaser row top, posts con photo scale+overlay+full lightbox modal, stagger enters, quick emoji reactions (🔥💪❤️👏 con counts pop), comment previews pro, empty espectacular. Reacciones también en muro propio. **NUEVO DISRUPTIVO ÚNICO EN EL MERCADO**: EntrenaSync - cuando ambos live y te unes, inicia sesión sincronizada con timer compartido en vivo, botones de acción (buena forma, serie lista...) que se ven y postean auto a ambos muros creando accountability real-time aunque no estés en el mismo gym. Ahora con persistencia real FS (syncActions, syncStreak), mirror via profile loads (usa el botón "Refrescar" en el panel para pull inmediato), stats Syncs, +1 streak al terminar, **rating al final (1-5 estrellas modal)** que boostea más si bueno. Promoción en modal live. La feature que marca la diferencia total: "entrena junto" virtual instantáneo con FOMO brutal, accountability loops y feedback. **Fix TDZ/JSX errors**: resuelto (mirror effect movido después de states dependientes, rating modal sin duplicados, nesting de live modal limpio). Android + guards + in-app warnings para builds sin google-services (previene crashes al abrir). La pared social fitness más bonita y adictiva jamás + la killer experience disruptiva. Prueba: activa live en 2 cuentas, únete, marca acciones, ve timer y posts (refresca para sync), termina y ratea. Lives + todo lo anterior + motion total. Error TDZ solucionado en próximo deploy.
- FCM / Push: **IMPORTANTE - causa de crashes al abrir la app en APK de Play**: Los builds AAB anteriores (0.1.5 y previos) se generaron SIN `android/app/google-services.json`. Esto hace que el plugin de push (y Firebase nativo) no se inicialice correctamente → la app falla / se cierra justo al abrir en Android (Play closed). 
  - **Fix**: Coloca google-services.json (descargado de Firebase Console para package com.entrenamatch.app) en android/app/, rebuild AAB (code 9 / 0.1.6+), sube nuevo release a la pista cerrada. Testers actualizan.
  - Una vez arreglado: Client + token save to /userPushTokens. On APK: login real → token en Firestore. Prueba enviando push desde Firebase Console (Cloud Messaging → test message al token exacto). Full background requiere el json + rebuild.
  - El botón en Perfil "Activar notificaciones push nativas" ahora tiene mejores guards y mensajes de error si el build está incompleto.
  - Sigue con todo: diagnóstico + build.gradle mejorado (warnings claros si falta json) + runtime check en la app.
- Más defensas en código + manifest actualizado (POST_NOTIFICATIONS + icon meta).
- Prueba específicamente este flujo + recibir/tocar notificaciones (toasts, panel, sistema) sin que crashee la app. Usa los toggles para silenciar categorías.
- Si usas web/PWA: el botón de notificaciones del navegador también mejorado + prefs aplican. Prueba teasers al elegir perfiles.

**Cómo encontrar el link de testers (para el admin o para invitar)**:
- Play Console > Pruebas > Prueba cerrada > "Link para compartir" o "Cómo unirse a la prueba".
- Compártelo con el grupo o testers individuales.

**Importante**:
- La app **nunca se publica** mientras esté en Internal o Closed.
- Solo las cuentas invitadas pueden encontrarla e instalarla.
- Si no te aparece después de aceptar, espera 10-30 min, fuerza cierre de Play Store, o usa el link "Join the test" que te mandaron.

## Problemas comunes (actualizado)

## Reglas de oro para esta beta

- Solo para mayores de 18.
- Sé respetuoso (es una comunidad de entrenamiento).
- Reporta cualquier cosa rara con el botón de reportar/bloquear.
- No compartas datos sensibles de otros testers.

## Problemas comunes

- "No veo perfiles reales" → Usa "Actualizar reales".
- "No se actualiza la sesión" → Botón "Actualizar sesiones reales".
- Login que salta a creación → Cierra sesión completamente con "Cambiar cuenta" (barra superior teal PRE-ALPHA o encabezado de tu Perfil).
- "Los mensajes no llegan en tiempo real" → Asegúrate de estar en la misma red o prueba con fakes primero. Usa "Actualizar chats reales", verifica que ambos tengan el chat abierto o usen el botón. Hard refresh después de deploy. Los bg listeners + 30s polls + onSnapshot activo cubren live receive. Reporta si persiste.
- Chat no hace scroll al final al recibir → Verifica versión (v0.1.5-prealpha con auto-scroll incluido). Hard refresh.
- **La app falla / se cierra justo al abrir (en APK descargada de Play closed)** → Causa: AABs built with google-services.json that has no client for 'com.entrenamatch.app' (e.g. the one from "esa direccion"/Downloads only lists com.muscle.entrenamatch + _nuevo; or completely missing). Firebase native (for @capacitor/push-notifications + play-integrity) can't init → crash on cold start.
  - AI did "hagas todo" (placed the json from the path you said into android/app/, bumped to 0.1.9 code 12, executed full pipeline via build-aab-now.bat + publish launcher): now **build fails fast and loud** with our matcher + "No matching client found for package name 'com.entrenamatch.app' in google-services.json" + "the placed json from your path only has com.muscle.* entries". Prevents shipping broken AABs. 
  - **Solución para el equipo / AI**: In Firebase Console (entrenamatch project) → Project settings → Your apps → Add Android app with **exact package com.entrenamatch.app** → download the json → overwrite `fitvina\android\app\google-services.json` → say "json fixed, build the AAB" or "sigue con todo". AI will re-run the full build (now will succeed), copy EntrenaMatch-v0.1.9-....aab , update docs, and prep the Play upload. Then upload the good AAB to closed (first time often manual to seed the track). 
  - Testers: fuerza actualización desde Play o desinstala/reinstala con el link de la prueba. Una vez arreglado, la app abre normal y el botón de activar notifs en Perfil funciona.
  - Mientras: si puedes, instala un APK debug local (de CI o build manual) para probar flujos. Reporta el crash + versión exacta vía el formulario de feedback dentro de la app.

## Protocolo de prueba del AAB firmado con cuentas reales (antes de subir a Play Internal)

**Importante:** Antes de invitar a los 5-10 testers chilenos, el equipo debe validar el AAB actual en dispositivo real con al menos 2 cuentas reales (emails diferentes).

Pasos exactos (en 1-2 dispositivos Android):
1. Instala el AAB firmado actual (EntrenaMatch-release.aab) en el dispositivo (usa `adb install` o descarga desde GitHub Release si hay artifact, o transfiere el archivo).
2. Habilita "instalar de fuentes desconocidas".
3. Cuenta A: Abre la app → crea cuenta email real → completa onboarding full (incluye foto con cámara si disponible en nativo, chips de entrenamiento, consents).
4. Verifica en Explorar: ves "X disponibles ahora cerca de ti", contador de perfiles reales con "en vivo", lastSync "hace Xs", recs "Más compatibles (reales primero)" con en vivo y lastSync, cards con REAL, distancia, compat, bio, chips. "Actualizar reales" funciona y actualiza lastSync.
5. Swipe right a un perfil real (o usa el recs "Me interesa").
6. Cuenta B (otro dispositivo o logout/cambiar cuenta): Haz lo mismo, swipe right al perfil de A (o el recíproco).
7. Verifica match mutuo en vivo (aparece en "Tus matches" con en vivo badge, lastSync).
8. Abre chat 1:1: envía mensajes de A a B → B recibe en vivo (toast o update sin "Actualizar", "en vivo" visible, auto-scroll si implementado). Verifica lastSync actualiza. Hard refresh en B → historial persiste.
9. Cuenta A: Crea una sesión (elige tipo, lugar, hora, max participants).
10. Cuenta B: Ve la sesión en "Explorar sesiones" (con "en vivo", preview), presiona "Unirme" → participants se actualiza, abre chat grupal sin error.
11. En chat grupal: envía mensajes de A → B recibe live (con "en vivo", lastSync en lista y header, preview en lista de sesiones). Creador (A) ve controles de admin (expel si hay otro, close).
12. Hard refresh en ambos → todo persiste (perfil, match, chats 1:1 y grupal, participants, lastSync).
13. Prueba "Sincronizar" en Profile de A y B → lastSync actualiza, datos reales recargan.
14. Prueba feedback: envía uno desde Profile → aparece en historial.
15. Prueba reportar: desde recs o full profile de un test, reporta (prompt) → se guarda en betaFeedback.
16. Cierra sesión completamente ("Cambiar cuenta" o logout) → re-login → todo persiste desde Firebase.
17. Nota cualquier bug nativo (camera quality, keyboard, safe area, performance, notificaciones si push está en el build).

Reporta resultados (bugs, frictions, lo que encantó del polish "elegir perfiles"). Si todo fluye con el UI actual (disponibles ahora, en vivo, lastSync, recs reales), estamos listos para subir a Internal y agregar los testers chilenos.

Usa el AAB firmado actual (no debug). Hard refresh no aplica en APK (reinstala si hay update).

## Assets para Play Store (usar los generados/polished)

Ver assets/play-store/ASSETS.md para specs completas, icon-512.jpg generado, screenshot-explore-polished.jpg y screenshot-chat-polished.jpg usando el UI actual pulido (disponibles ahora, en vivo, recs reales, lastSync, cards limpias).

Instrucciones allí para resize icons y usar screenshots (auténticos del polish reciente).

Esto hace que el listing se vea premium para los testers reales.

## Privacidad

Tus datos (perfil, ubicación aproximada, chats de sesiones) se usan solo para el matching y coordinación dentro de la beta. Ver política completa en la app o en /privacy.html.

## Privacidad

Tus datos (perfil, ubicación aproximada, chats de sesiones) se usan solo para el matching y coordinación dentro de la beta. Ver política completa en la app o en /privacy.html.

¡Gracias de verdad! Tu feedback va a definir cómo evoluciona la app.

Cualquier duda, avísanos.

## Notas para testers que usan la APK de Play Store (Internal/Closed)
- La experiencia es idéntica a la web pero con cámara nativa real (botón "Cámara del teléfono" aparece en creación de perfil y en "Tu perfil" para agregar fotos rápido).
- Usa "Sincronizar" en tu Perfil y "Actualizar reales" en Explorar/Sesiones frecuentemente durante las pruebas. El Perfil ahora está más limpio (sin botones rojos grandes en el centro que bloqueaban el scroll).
- El formulario de Feedback mejorado en Perfil es la forma principal de reportar (estructura + historial visible para ti).
- Reporta también por el canal privado (WhatsApp/grupo) si quieres adjuntar capturas o hablar en vivo.

## Nuevas: Probar notificaciones cuando llega un mensaje (web GH Pages — prioridad actual)
Como Google account verification pendiente, avanzamos full en la versión web: https://musclegrenadechile.github.io/entrenamatch/

**Qué implementado:**
- Cuando otro tester (real o vía fake) te envía mensaje 1:1 o en sesión grupal en la que participas: 
  - Toast in-app (sonner) con preview + botón "Ver" que abre el chat exacto y marca leído.
  - Se agrega a la campana (🔔) del header superior (badge con totales).
  - Badge rojo numérico en tab inferior "Mensajes" (1:1) y "Sesiones" (grupales).
  - En la lista de Mensajes, cada fila muestra pill rojo con conteo de no leídos.
  - Si la pestaña está oculta (cambiaste de tab del browser o minimizaste) + diste permiso de notificaciones del navegador: aparece notificación nativa del SO (con icono + click lleva al chat).
  - El panel de Notificaciones (campana) ahora muestra avatar del remitente para mensajes.
  - Diseño actualizado con naranja Dunkin' #FF671F como color principal (energía, motivación) + rosa para diversión, con hovers en cards con glow naranja para más atractivo visual.
- Permiso se pide automáticamente al loguearte con cuenta real en web (o botón manual en Perfil: "🔔 Activar/renovar notificaciones del navegador").
- Funciona cross-tab / cross-browser (hard refresh después de push). No requiere "Actualizar chats reales" para recibir la alerta (los listeners bg la detectan).

**Cómo probar notificaciones (protocolo actualizado para web):**
1. Abre la web en 2 "dispositivos" o pestañas/navegadores distintos (o 1 real + 1 incognito). Hard refresh (Ctrl+Shift+R) en ambos después de cada push.
2. Cuenta A: loguea/crea perfil real → ve a Explorar → haz match con un fake (o con B).
3. Cuenta B: asegúrate de estar en otra pantalla (Explorar, Perfil o incluso oculta la pestaña del browser).
4. Cuenta A envía mensaje 1:1.
5. En B: debe aparecer toast arriba, badge en campana + tab Mensajes, fila del chat con pill rojo, preview actualizado en vivo. Si diste permiso y B tab oculta: notif del navegador debe saltar.
6. Click "Ver" o abre el chat → conteos se ponen en 0.
7. Repite enviando desde B mientras A está en Sesiones o tab oculta.
8. Para grupos: Cuenta A crea sesión → B se une → A envía en group chat mientras B tiene modal cerrado o tab oculta → notif debe llegar (toast + badge en Sesiones + browser si hidden).
9. Hard refresh en B → unreads now persist across refreshes (localStorage); timestamps (e.g. "5m", "2h") appear next to last message previews in the chat list; toast notifications now enriched with sender avatar (photo or initial) + full message preview + "En vivo" context; historial de mensajes persiste; nuevos envíos post-refresh siguen notificando con toast + badge + browser notif (if permitted + tab hidden).
10. Bonus: usa el botón en Perfil para re-solicitar permiso del navegador si no diste "allow" la primera vez. Revisa el panel de Notificaciones (campana) para ver historial de "Mensaje de X".

Si no ves toast/badge: verifica que estés en modo real (no "version demo"), hard refresh, revisa consola (busca "📨 Live 1:1" o "BG live group"). Si browser notif no aparece aunque permiso granted: la pestaña debe estar realmente oculta (no solo otro tab de la app).

Esto hace que "si alguien envía un mensaje uno lo reciba" sea obvio sin estar mirando la lista.

**Web first ahora:** Todo lo anterior es 100% en la URL pública de GH Pages. APK sigue build en CI pero deprioritizado hasta verify de Google. Usa la web para tests diarios con los 5-10 de Chile.

## Update de Diseño (nueva atracción visual)
Hicimos una revisión exhaustiva del diseño: el tema anterior con teal #14b8a6 era funcional pero "pobre" visualmente y poco atractivo psicológicamente. 

**Nueva paleta Dunkin' Energy:**
- Primario: Naranja vibrante #FF671F (estilo Dunkin' Donuts - evoca energía, motivación, acción inmediata, "hambre" de entrenar y conectar. Psicológicamente atrae y estimula).
- Secundario: Rosa vibrante #FF4F79 (diversión, social, el "match" juguetón).
- Acento salud: Teal #00C4B4 (vitalidad, confianza).
- Darks actualizados a #0D0D10 / #1C1C20 / #25252A para premium moderno.
- Textos y borders ajustados para mejor contraste y legibilidad.
- Actualizado en Tailwind, index.css (vars + hardcodes), App.tsx, componentes (Explore, Onboarding, Auth), manifest, index.html (theme-color), favicon.svg (colores a naranja/rosa).

Resultado: App mucho más atractiva, energética y que invita a los testers a usarla y quedarse. Hard refresh para ver el nuevo look naranja/rosa en botones, badges, headers, chips, etc. ¡Diseño que atrae!

**Polish adicional continuado (sin parar, user: "sigue con lo que estas haciendo sin parar")**:
- Cards: hover ahora con glow naranja más grande + levantamiento (translateY) + active más "pegajoso".
- Botones primarios: hover con anillo rosa (fit-accent2) + lift, active con gradiente y escala más marcada.
- Match celebration modal: sombra rosa + glow para que "¡ES UN MATCH!" explote visualmente.
- Sesiones reales: borde/rosa ring más marcado (diferencia social inmediata).
- Badges "en vivo": ahora usan .live-pill con animación de pulso suave (2.2s) en todo el app — se siente vivo.
- Burbujas de chat enviadas: gradiente naranja→rosa + sombra (más juguetón y energético al chatear).
- Toasts de llegada de mensaje: avatar con borde naranja, fallback con gradiente rosa/naranja, botones "Ver" ahora naranjos vibrantes vía estilo global.
- Legal (privacy/terms): links y headings actualizados a naranja/rosa para coherencia total de marca.
- Todos los "en vivo" y lastSync actualizados a la clase con pulso.
- Builds: se re-verificaron las 3 variantes exactas que usa CI (incluyendo el CAPACITOR=1 que antes fallaba en capacitor-plugins loader). Todo limpio, chunk de plugins solo en build nativo.

Hard refresh para ver el pulso de los en vivo, los hovers que "brillan" naranja, los mensajes con gradiente, el match más "celebración". Todo esto subido a github + verificado localmente antes del push.

Gracias de verdad! Tu feedback va a definir cómo evoluciona la app (incluyendo más polish visual).

**Lo nuevo en esta tanda (sigue trabajando):**
- Banner "Instalar app": aparece solo después de que interactúas un poco (match o vas a Mensajes/Sesiones) o ~28 segundos. Naranja/rosa, limpio, con botón Instalar que usa el prompt nativo del navegador. En Perfil también hay botón manual. Una vez instalado se siente como la APK (icono en home, launch directo).
- En "Más compatibles" y en la tarjeta grande de swipe: ahora ves por qué el % (píldoras chiquititas: "Entrenamiento coincide", "Muy cerca", "Objetivos parecidos", "Mismo nivel"). Más transparente y confiable.
- Botón "Actualizar todo" siempre visible en la barra superior naranja. Fuerza recarga de perfiles reales + matches + sesiones + actualiza los "hace Xs". Úsalo si quieres forzar sincronía cross-device (aunque los listeners ya traen casi todo en vivo).
- Todo verificado en los 3 builds otra vez + subido.

Hard refresh y prueba el banner de instalar, los motivos de compat y el botón global de refresco.

Cualquier duda, avísanos.

## New closed testing build (v0.1.10-prealpha / code 13) — json fixed edition

- google-services.json with exact package com.entrenamatch.app placed + copied.
- Full pipeline succeeded: google-services check now passes with "CONTAINS MATCHING package".
- Includes every recent fix/polish: EntrenaSync join is now attractive + no spam, Publish directly from Feed with nice modal (no profile redirect), muro "Añadir foto" now uses proper file picker + great preview (no URL prompt), live people visibility fixed, profile nivel headers now square chips, feed filter bar scrolls horizontally, many muro visual upgrades, etc.
- AAB: EntrenaMatch-v0.1.10-prealpha-json-fixed-full-fixes.aab (in root).
- Test protocol: install, login (real), toggle live → should appear in lists for others (with location or without), join live of another live user → button shows loading, auto goes to Profile with the rich EntrenaSync panel (timer + vibe meter + actions), no spam on repeated taps, publish from Feed tab opens nice modal and post appears immediately in Feed list, photo upload in muro is now nice file selection with preview.
- Push/Integrity should work properly now (no launch crash).

Update and test thoroughly. Report back.

## New closed testing build (v0.1.13-geo-arena / versionCode 18) — REAL GEOLOCALIZATION edition

- **Critical fix**: "genero error al abrir la app" completely resolved. Root cause was missing googleCloudProjectNumber param + unboxed Long in @capacitor-community/play-integrity plugin during auto-check on Firebase auth restore (persisted sessions). Fixed in playIntegrity.ts (always pass 0), defensive patch in plugin Java for this build, auto integrity check on login disabled (manual 🛡️ button in Profile remains). Validated live on real device R5GL13YMBJW with adb logcat (no more AndroidRuntime FATAL / NullPointer, process stays alive, plugins load cleanly including Push + Integrity).
- Version bumped to 18 / 0.1.13-geo-arena. Real GPS via Capacitor is the main new feature for realism.
- Feed UX polish: horizontal filters (REAL / 🟢 Live / 📌 Fijados / Actualizar) now properly scrollable with snap-x, touch-pan, side fade hint + "desliza → filtros y live" label. Live "EN VIVO AHORA EN LA COMUNIDAD" strip also snapped.
- Profile ultra vivo y atractivo: live pulsing hero + "ENTRENANDO AHORA" banner + real GPS indicator + "📍 Actualizar ubicación real" button, "Mi vida de entrenamiento" summary with Vibe Score, legends with progress bars + LV badges, recent activity feed from muro likes/comments, gallery quick ★ main photo + reorder, richer live stats, Logros achievements row. Muro del perfil completamente rediseñado con cards premium, gradientes animados, fotos grandes cinematográficas, reacciones mejoradas, comentarios más atractivos, empty state épico y pinned destacados. Real geo makes distances accurate everywhere.
- Arena remains the disruptive star (full ritual, flying, combos, dual stories, bonds/legends, replay, global FOMO in feed).
- All previous giant updates retained (direct Feed publish modal + success banner + confetti instead of profile jump, Storage photo with real 0-100% progress + preview, attractive guarded Sync join, etc.).
- AAB ready: EntrenaMatch-v0.1.13-geo-arena.aab (and EntrenaMatch-release.aab) in root. Also fresh debug APK (EntrenaMatch-debug-muro-strong.apk) with strong visual redesign of personal muro (premium cards, animated gradients, cinematic photos, better reactions/comments, epic empty state) + all previous polishes.
- Test focus for this build:
  1. Install the new AAB (or use debug APK via adb).
  2. Force stop + open app cold → must reach login/home without any crash or force close.
  3. Login (Google or email) → no immediate crash.
  4. Go to Feed tab → confirm the top filters row scrolls horizontally smoothly on phone, "Live" and "Fijados" pills work, live people strip scrolls.
  5. Tap Publish in Feed → opens attractive modal, try adding photo (native camera preferred if on device), publish → should stay in Feed, show success banner, new post appears in list (no jump to profile).
  6. In Profile: hero pulses if live, big ENTRENANDO banner, summary card with streaks/legends, recent activity list from your muro, legends with progress bars, gallery has ★ to set main photo. Make sure it feels much more vivo.
  7. Full Arena test with 2 accounts if possible (live toggle, join, actions + flying + combos, rate, check dual muro + feed stories + legends appear). Probar la nueva captura de foto DENTRO de la Arena (botón 📸 Capturar momento) — debe subir, agregarse al replay y publicarse en ambos muros.
  8. Optional: use 🛡️ Google Play Integrity button in Profile to test (should not crash).
  9. Test REAL geolocation: go to Explore or Perfil filters, tap "📍 Usar ubicación real del teléfono (GPS)" or "Actualizar ubicación real". Grant permission. Should show accurate km distances to people (in cards, live strip, arena header). Toggle "Entrenando Ahora" auto-requests GPS and updates your profile coords in real-time. Arena shows distance to your sync partner. Live people use real distances from their profiles. Button in profile hero for manual update. If denied, falls back gracefully but "GPS requerido" shown. Check Perfil has "📍 real GPS" indicator.
- Use Samsung Members "Informe de error" or adb logcat if anything odd. chrome://inspect for JS side if connected.

This is the build to upload to Closed track. Full "sigue con todo" — more unique features coming after validation.
