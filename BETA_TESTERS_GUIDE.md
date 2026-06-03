# Guía para Beta Testers de EntrenaMatch (Hidden / Internal-Closed)

**Gracias por ayudar a probar la app antes de que sea pública.**

## Cómo empezar (5 minutos)

1. Instala la APK (te la enviamos por link privado o la descargas del Release "android-prealpha").
2. Abre la app.
3. Crea una cuenta real con email (o Google si disponible).
4. Completa el onboarding con datos reales (foto, entrenamiento, objetivos). Esto es clave para las pruebas.
5. Explora, haz match, chatea y crea o únete a una sesión.
**Importante después de actualizaciones:** Siempre haz hard refresh (Ctrl+Shift+R en web, o fuerza cierre + reopen en APK) para cargar el nuevo código. De lo contrario puedes ver errores antiguos como "Unsupported field value: undefined (photo)" al enviar mensajes en sesiones de grupo.

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

**Internal testing (el más privado, recomendado para empezar con 5-10 personas):**
1. El admin te agrega tu cuenta de Google (email) en Play Console → Testing → Internal testing → Testers.
2. Recibes un email con link "Become a tester" o "Ser tester".
3. Abre el link desde tu teléfono Android (debe estar logueado con la misma cuenta Google).
4. Acepta ser tester.
5. Busca "EntrenaMatch" en Play Store (o usa el link privado que te dan). La app **no aparece** en búsquedas públicas.
6. Instala. Recibirás actualizaciones automáticas cuando subamos nueva versión firmada.
7. Abre la app → usa email real para crear cuenta → completa onboarding con datos reales.

**Closed testing (recomendado cuando tengamos más testers, usa Google Group):**
1. El admin crea un Google Group (o usa uno existente) y lo agrega en Play Console → Closed testing.
2. Te agregan a ese Google Group (recibes invitación por email).
3. Ve a Play Store → busca la app por nombre o usa el link de testers.
4. Instala normalmente. Experiencia idéntica a una app publicada pero **solo visible para miembros del grupo**.
5. Actualizaciones automáticas vía Play Store.

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
- Chat no hace scroll al final al recibir → Verifica versión (v0.1.0-prealpha con auto-scroll incluido). Hard refresh.

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
9. Hard refresh en B → unreads se resetean (esperado, son de sesión actual); historial de mensajes persiste; nuevos envíos post-refresh siguen notificando.
10. Bonus: usa el botón en Perfil para re-solicitar permiso del navegador si no diste "allow" la primera vez. Revisa el panel de Notificaciones (campana) para ver historial de "Mensaje de X".

Si no ves toast/badge: verifica que estés en modo real (no "version demo"), hard refresh, revisa consola (busca "📨 Live 1:1" o "BG live group"). Si browser notif no aparece aunque permiso granted: la pestaña debe estar realmente oculta (no solo otro tab de la app).

Esto hace que "si alguien envía un mensaje uno lo reciba" sea obvio sin estar mirando la lista.

**Web first ahora:** Todo lo anterior es 100% en la URL pública de GH Pages. APK sigue build en CI pero deprioritizado hasta verify de Google. Usa la web para tests diarios con los 5-10 de Chile.
