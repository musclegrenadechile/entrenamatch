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

**1:1 messaging fully working (2025-04)**: Sesiones + group chat live funcionan perfecto. Para 1:1 real entre cuentas: se amplió la lógica isRealChat para cubrir perfiles reales conocidos (no solo realMatches), bootstrap de match doc + agregar a realMatches al abrir chat real (soluciona el caso del lado pasivo o pre-discovery donde realMatches estaba vacío), force load después de swipe. Ahora enviar/recibir entre matches reales persiste en Firestore, listeners bg + active + polls de 8s/30s + "Actualizar chats reales" actualizan live en el otro dispositivo. Quedan logs útiles "📨 Live 1:1 update" para confirmar que llega en tiempo real. Hard refresh después de cada push.

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

## Privacidad

Tus datos (perfil, ubicación aproximada, chats de sesiones) se usan solo para el matching y coordinación dentro de la beta. Ver política completa en la app o en /privacy.html.

¡Gracias de verdad! Tu feedback va a definir cómo evoluciona la app.

Cualquier duda, avísanos.

## Notas para testers que usan la APK de Play Store (Internal/Closed)
- La experiencia es idéntica a la web pero con cámara nativa real (botón "Cámara del teléfono" aparece en creación de perfil y en "Tu perfil" para agregar fotos rápido).
- Usa "Sincronizar" en tu Perfil y "Actualizar reales" en Explorar/Sesiones frecuentemente durante las pruebas. El Perfil ahora está más limpio (sin botones rojos grandes en el centro que bloqueaban el scroll).
- El formulario de Feedback mejorado en Perfil es la forma principal de reportar (estructura + historial visible para ti).
- Reporta también por el canal privado (WhatsApp/grupo) si quieres adjuntar capturas o hablar en vivo.
