# Play Store Assets & Listing Copy — EntrenaMatch (Hidden Internal/Closed Testing)

**App name (Play Console)**: EntrenaMatch

**Package name**: com.entrenamatch.app

**Current version for this upload**: versionCode 10 / 0.1.7-prealpha — **LA MÁS TOP UPDATE DE TODAS + DISRUPTIVA**: Feed 2.0 ultra atractivo (header glass+blur premium + gradient chips + big +Publicar CTA, live teaser row con stagger, post cards con photo hover-scale + overlay + lightbox modal, stagger anims, quick emoji reactions 🔥💪❤️👏 con pop counts, richer comments + pinned, empty state espectacular). + Reacciones en muro propio. **NUEVO KILLER ÚNICO Y DISRUPTIVO**: EntrenaSync - la primera experiencia de "entrenamiento sincronizado real-time" del mercado: únete al live de alguien y arranca timer compartido + acciones en vivo (buena forma, series...) que se postean auto a ambos muros creando accountability instantánea aunque no estés en el mismo gym. Ahora persistente (FS syncActions/syncStreak), mirror en loads, stats Syncs, +1 streak al terminar, **rating final 1-5 estrellas** que boostea más. Promoción en live modal. FOMO + loops de retención brutales + data moat para matching. Android guards + visible warnings para builds sin google-services (evita crashes al abrir). Más motion, glows, FOMO en feed. La pared social de fitness + la feature disruptiva que nadie tiene (Dunkin energy total + presencia social real-time). Ver BETA/plan para detalles. Android crash fix prep listo (necesita json para AAB final).
- Native push: explícito vía botón en Perfil, defensivo. FCM client + /userPushTokens started.
- Browser notif: handlers seguros.
- Manifest mejorado.
- **Nuevo**: toggles de preferencias (mensajes/live/muro) en Perfil.
- **Mejorado**: muro teasers (1-2 posts); live visuals (glass/motion/glows/pulses/gradients, banner grid + glow + progress, radar sweep + circles + stagger + lines for map feel, profile stats/banner glow + progress, sessions/matches/feed badges + glow/ring + mini progress, modal progress + radar anim/hover/stagger + sweep). Full UI visual review (hovers, empty states, consistency). Matches cards live ring/glow. Muro feed posts framer exit anim for deletes. Top bar live count with glow/ring. Richer empty states (live cerca 0 + modal + banner + sessions with glass/CTA). Session cards framer hover lift/scale + glow. **Feed Global major upgrade**: premium sticky glass+blur header, active gradient chips, +Publicar CTA, live teaser row with progress, post cards with photo scale+overlay, stagger, strong pinned, better actions/comments. Much more attractive (Dunkin premium energy).
- Incluye killer live, muro espectacular, integrity, onboarding preview, etc.
Listo para re-subir a closed track como mejora continua.

**Category**: Health & Fitness (or Social)

**Content rating**: Mature 17+ (solo +18, entrenamiento social con matches)

**Contact email / website**: (usa el del admin / musclegrenadechile)

**Privacy Policy URL** (must be public and hosted):
- https://musclegrenadechile.github.io/entrenamatch/privacy.html

**Account Deletion URL** (required by Google for Data Safety):
- https://musclegrenadechile.github.io/entrenamatch/privacy.html#eliminacion-de-cuenta

**CSAE Standards URL** (Estándares contra la Explotación y Abuso Sexual Infantil - requerido por Google):
- https://musclegrenadechile.github.io/entrenamatch/csea-standards.html

**Instrucciones para Play Console:**
Pega exactamente esta URL en el campo que te pide "URL de los estándares de seguridad" / "Incluye un vínculo a los estándares contra la explotación y abuso sexual infantil (CSAE)".

La página está publicada de forma estática, pública y no editable (hospedada en GitHub Pages junto con privacy.html).

**Website URL** (for Play Console - official landing page):
- https://musclegrenadechile.github.io/entrenamatch/landing.html

This is the new dedicated website/landing page created for the Google Play submission. It showcases the app, features (including the unique "Entrenando Ahora" live feature), screenshots using the official graphics, and has a clear call-to-action for the closed beta.

**Use this exact URL in the Play Console "Website" field**:
https://musclegrenadechile.github.io/entrenamatch/landing.html

The page is a complete, beautiful, mobile-friendly landing page (self-contained HTML + Tailwind via CDN + Font Awesome). It is the official website for EntrenaMatch, with hero, features (including the killer "Entrenando Ahora" live), how it works, screenshots using your official graphics, and beta CTA.

**To make it live**: After you push the changes, run the usual build/deploy (the GitHub Pages CI will include public/landing.html). The URL above will work immediately for the Play Console submission.

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
• Killer feature "Entrenando Ahora EN VIVO": ve en tiempo real quién entrena cerca, con urgencia ("se va en Xm"), hot zones, streaks y join automático al muro
• Muro de perfiles estilo FB (posts con foto, likes, comentarios cross-user, notificaciones al dueño)
• Onboarding espectacular rediseñado: preview en vivo del perfil (como se ve en swipe y live), "Rellenar ejemplo", disponibilidad, opt-in directo a EN VIVO, reorder de fotos principal
• Integración completa Google Play Integrity API (verifica app oficial + dispositivo íntegro + licencia, para seguridad en beta cerrada)
• Mejoras de onboarding + fixes (preview actualiza en tiempo real, GPS sync correcto, meta tags PWA actualizados)
• Todo el flujo real Firebase (perfiles, matches, chats 1:1 y grupal, sesiones, live) cross-device
• Sesiones + chat grupal real + admin por creador
• Feedback estructurado + historial
• Múltiples escapes de cuenta + PWA install mejorado
• Legal + CSAE + deletion URL listos y públicos
• Versión nativa Android (AAB) lista para Closed testing (versionCode 10 / 0.1.7-prealpha) — **LA UPDATE MÁS TOP**: Feed 2.0 (header premium blur+chips+CTA, cards con fotos pro + lightbox, stagger, reacciones rápidas con emojis, comments mejorados). + Android stability guards + warnings visibles. Coloca google-services.json → rebuild para fix crash al abrir + push real. Todo lo anterior + más polish visual/motion en feed/muro.

---

## Graphics requirements & prompts

### Feature graphic (1024 × 500 px, required - exact Google spec)
Use these new files (Dunkin style, "ENTRENAMATCH" text, no donut/food):
- feature-graphic-1024x500-v1.jpg
- feature-graphic-1024x500-v2.jpg
- feature-graphic-1024x500-v3.jpg

These were generated specifically at the correct 1024x500 resolution for Play Store feature graphic. They follow the branding strategy: vibrant Dunkin orange/pink on dark, energetic fitness people, bold text, unique "spark/match" energy vibe for EntrenaMatch.

Prompts used (copy for regeneration if needed):
"Google Play Store feature graphic exactly 1024x500 pixels for EntrenaMatch fitness social app. Dunkin style: vibrant orange #FF671F and hot pink #FF4F79 accents on deep dark premium background. Diverse attractive athletic people high-fiving and connecting outdoors at golden hour in a modern urban/coastal setting. Large bold white text "ENTRENAMATCH" at the top in rounded energetic font. Smaller tagline below "El match del movimiento". High energy, fun, premium sports social app aesthetic. Cinematic lighting, high contrast, modern playful like Dunkin but fitness themed. No donut or food elements. Clean composition with good margins. Professional marketing banner style, high resolution."

(These are under 1MB each, PNG/JPEG compatible.)
Reference generated examples available in repo at: assets/play-store/ 

**Recommended new files (Dunkin style with "ENTRENAMATCH" text, NO donut - orange #FF671F + pink #FF4F79 on dark):**
- High-res icon: icon-512-dunkin-brand-v1.jpg to v4.jpg (new batch focused on unique branding)

**Branding & Advertising Strategy for EntrenaMatch Icon**

Core Idea: "El Spark del Movimiento" – the icon is the visual soul of the brand.
- Unique hook: A stylized dumbbell that "ignites" or "connects" with an energy spark/flame (representing the "Live" Entrenando Ahora feature and the instant match energy).
- This makes it instantly ownable: Not generic fitness (no plain dumbbell), not food (no donut), but energetic social fitness with Dunkin fun + urgency.
- The text "ENTRENAMATCH" is bold, rounded, prominent – like Dunkin' but modern fitness.

Advertising Strategy:
- **Hero Visual**: The icon with pulsing live effect (green spark when "live" mode).
- **Tagline**: "Encuentra tu match. Entrena en vivo."
- **Campaign Pillars**:
  1. FOMO Live: "Hay X personas entrenando ahora cerca de ti" – use real-time counters + the icon pulsing.
  2. Before/After Match: Lonely workout (gray) → Connected training (orange/pink explosion with the icon).
  3. Community Spark: User stories "Encendí mi entrenamiento gracias a EntrenaMatch".
- **Placement**: App icon, feature graphic, social ads, gym stickers, event merch. The icon should work as a standalone brand mark (like Nike swoosh + wordmark).

Use these new icons as the foundation for all branding. They are designed to be unique, memorable, and scalable.

Use the existing polished screenshots (screenshot-explore-polished.jpg and screenshot-chat-polished.jpg) as they show real UI. Regenerate more if needed with the prompts below to better match the current Dunkin color scheme.

### High-res icon (512x512, adaptive icon ready)
Use the new Dunkin-style files (with "ENTRENAMATCH" text, no donut):
- icon-512-dunkin-text-no-donut.jpg (recommended)
- icon-512-dunkin-text-no-donut-v2.jpg (alternative)

Prompts used (for regeneration):
"Modern energetic app icon 512x512 for EntrenaMatch fitness social app in Dunkin style: vibrant orange #FF671F and hot pink #FF4F79 on deep dark background, bold rounded sans-serif text "ENTRENAMATCH" prominently displayed, integrated with a clean stylized dumbbell or abstract connection/match symbol (NO donut or food elements), high contrast, fun and bold like Dunkin branding but fitness themed, clean vector style, premium quality, no thin lines, perfectly square, readable at small sizes, professional yet playful fitness branding"

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
Use the new automation: after bumping versionCode, run `publish-play.bat closed` (or let the AI/Grok execute the publish via terminal once you place the play-service-account.json key).
This builds the latest + uploads signed AAB via the Gradle Play Publisher plugin (no manual Console upload needed after one-time service account setup).

Sube inicialmente a Internal testing (o usa el script con "internal").
Agrega testers por email.
Después de validar con 3-5 personas, promueve a Closed testing con Google Group para más testers sin publicar.
Mantén siempre "Oculto" / no listado.

(For manual fallback: upload the AAB from root via Play Console > Testing > Internal/Closed.)

---

**Última actualización**: 2026-06-04 — lista para Internal Testing (beta cerrada)

---

## Textos listos para copiar y pegar en Play Console

### App name
EntrenaMatch

### Short description (80 caracteres)
El match del movimiento. Encuentra compañeros de entrenamiento reales cerca de ti.

### Full description
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

### What's new (para la release)
• Backend real Firebase activo: perfiles, matches y chats 1:1 cross-device
• Sesiones + chat grupal real (crea y únete, visible para otros testers)
• Onboarding mejorado con bio obligatoria + cámara nativa (APK)
• Feedback estructurado de beta (tipo + estrellas + historial de tus envíos)
• Múltiples escapes de cuenta siempre visibles + sincronización manual
• Legal completo (privacidad + términos) accesible desde login, onboarding, chats y perfil
• Versión nativa Android lista para Internal/Closed testing
