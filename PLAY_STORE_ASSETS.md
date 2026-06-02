# Play Store Assets & Listing Copy — EntrenaMatch (Hidden Internal/Closed Testing)

**App name (Play Console)**: EntrenaMatch

**Category**: Health & Fitness (or Social)

**Content rating**: Mature 17+ (solo +18, entrenamiento social con matches)

**Contact email / website**: (usa el del admin / musclegrenadechile)

**Privacy Policy URL** (must be public and hosted):
- https://musclegrenadechile.github.io/entrenamatch/privacy.html
- (Future: https://entrenamatch.web.app/privacy.html when Firebase Hosting primary)

---

## Short description (max ~80 characters, shown in Play Store lists)
El match del movimiento. Encuentra compañeros de entrenamiento reales cerca de ti.

(Count: 78 chars)

---

## Full description (up to 4000 chars, use the rich one below)

EntrenaMatch es la app para encontrar gente real con quien entrenar: running, gym, calistenia, hiking, crossfit y más.

Crea tu perfil en minutos (edad, bio, fotos, tipos de entrenamiento, objetivos, nivel e intensidad). Explora perfiles reales de otros usuarios que buscan lo mismo que tú. Haz match, chatea 1:1 y crea o únete a sesiones grupales de entrenamiento. El chat grupal dentro de cada sesión te permite coordinar el día, hora y lugar con todos los participantes.

Características actuales en Pre-Alpha (backend real):
• Onboarding completo con cámara nativa en Android (APK)
• Perfiles visibles entre testers en diferentes dispositivos
• Matches y chat 1:1 en tiempo real
• Crea sesiones (ej: "Running costanera 19:00") y únete a las de otros
• Chat grupal dentro de las sesiones
• Filtros por tipo de entrenamiento, nivel, disponibilidad y distancia
• Sincronización real con Firebase (sobrevive hard refresh y cambio de dispositivo)
• Botones prominentes de "Cambiar cuenta / Cerrar sesión" en todo momento

Esta es una versión Pre-Alpha oculta para pruebas con un grupo cerrado de beta testers. Todo es real: tus matches, chats y sesiones se ven entre celulares distintos.

Solo para mayores de 18. Sé respetuoso, entrena en serio y reporta cualquier problema con el formulario de feedback dentro de la app (Perfil → Beta Feedback).

Tu opinión en esta etapa temprana es lo más valioso. ¡Gracias por ayudar a construir El match del movimiento!

---

## What's new (for this Pre-Alpha release, short & punchy)
• Backend real Firebase activo: perfiles, matches y chats 1:1 cross-device
• Sesiones + chat grupal real (crea y únete, visible para otros testers)
• Onboarding mejorado con bio obligatoria + cámara nativa (APK)
• Feedback estructurado de beta (tipo + estrellas + historial de tus envíos)
• Múltiples escapes de cuenta siempre visibles + sincronización manual
• Legal completo (privacidad + términos) accesible desde login, onboarding, chats y perfil
• Versión nativa Android lista para Internal/Closed testing

---

## Graphics requirements & prompts

### Feature graphic (1024 × 500 px, required)
Prompt for generation (use any design tool or Imagine):
"Modern dark fitness social app hero banner, deep charcoal + vibrant teal accents (#14b8a6), athletic man and woman high-fiving outdoors at golden hour in a coastal running path, subtle map + dumbbell + chat bubbles icons floating elegantly, bold modern sans title 'EntrenaMatch' in white, tagline 'El match del movimiento' smaller below, premium minimalist sports aesthetic, high contrast, cinematic lighting, no text overflow, space for Play Store overlay"

(Generate 1024x500 PNG/JPG and upload to Play Console graphic assets.)
Reference generated examples available in repo at: assets/play-store/ (feature-graphic.jpg + screenshot-explore.jpg, screenshot-chat.jpg etc. Use or regenerate with your preferred style for Play Console).

### High-res icon (512x512, adaptive icon ready)
Use existing public favicon or generate:
"Minimalist bold teal dumbbell icon inside rounded square, dark background (#0a0b0f), modern flat + slight 3d, high contrast, EntrenaMatch brand"

### Screenshots (phone — use 1080x1920 or 1440x2560 portrait, 2-8 required, up to 8)
Recommended order for Play Console:

1. **Onboarding / Create profile** (hero shot)
   Prompt: "Android phone mockup on dark background showing EntrenaMatch onboarding step with attractive profile form: name, age, city, bio textarea, beautiful fitness photo selection grid, teal buttons, Spanish UI text 'Paso 2 de 5', premium dark theme with teal accents, clean modern sports app UI"

2. **Explore / Swipe deck**
   Prompt: "Phone screen showing EntrenaMatch Explore tab: large attractive profile card of a smiling woman in gym clothes with chips 'Gym', 'Running', 'Fuerza', heart and X buttons at bottom, teal accents, dark UI, 'Explorar' header, 'Perfiles reales' badge, realistic photo"

3. **Real match celebration**
   Prompt: "Phone displaying EntrenaMatch match modal: big '¡Match real!' celebration with two profile photos side by side, confetti, 'Chatear ahora' button in teal, Spanish text, dark elegant fitness app style"

4. **1:1 Chat**
   Prompt: "Mobile chat screen inside EntrenaMatch: header with REAL badge, conversation bubbles in Spanish about training ('¿Nos vemos mañana en el gym?'), input bar, dark theme, teal accents, realistic fitness profile avatar"

5. **Sessions list + create**
   Prompt: "EntrenaMatch Sesiones tab: list of training sessions ('Running costanera 19:00', 'Gym juntos 20:30'), participant counts, teal 'Crear sesión' FAB, dark modern UI, Spanish labels"

6. **Group chat in session**
   Prompt: "Group chat modal in session 'Running costanera': multiple participants, chat bubbles, 'Chat grupal' header with REAL EN VIVO badge and participant count, input field, dark teal fitness app aesthetic"

7. **Profile screen (rich)**
   Prompt: "EntrenaMatch Profile tab: large hero photo with name+age overlay, stats row (Matches / Sesiones / Nivel), training type chips, bio card, prominent red 'Cerrar sesión / Cambiar de cuenta' buttons, 'Feedback de Beta' form visible, REAL badge, clean premium dark design"

8. **(Optional) Filters / empty real state**
   Prompt: "EntrenaMatch filters modal open over explore: live counter 'Perfiles que verás en Explorar: 12', chip selectors for training types and goals, teal accents, dark background"

Upload the generated screenshots in that order. Use real device frames or clean phone mockups in the images.

---

## Additional Play Console fields (copy-paste ready)

- **Application type**: App
- **Target audience**: Adults (18+)
- **Data safety**: 
  - Collects: name, age, photos, location (city/approx coords), training preferences, usage data (matches, messages).
  - Shared with third parties? No (only visible to other signed-in users for matching purposes).
  - Data encrypted in transit + at rest (Firebase).
- **Ads**: No (Pre-Alpha, no ads planned)
- **In-app purchases**: No (for now)

---

## Release notes for testers (internal doc)
Sube el AAB firmado (EntrenaMatch-release.aab) a Internal testing primero.
Agrega testers por email.
Después de validar con 3-5 personas, promueve a Closed testing con Google Group para más testers sin publicar.
Mantén siempre "Oculto" / no listado.

---

**Última actualización**: Phase 0 — lista para subir a Play Console en oculto.
