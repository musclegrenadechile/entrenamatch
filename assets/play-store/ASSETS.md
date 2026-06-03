# EntrenaMatch Play Store Assets - Pre-Alpha Beta Launch

**Generated for hidden beta on Play Store (Internal/Closed testing for real Chilean fitness testers).**

## Current Status (Post Phase 0 Polish)
- App is in strong pre-alpha state with polished "elegir perfiles" (Explore): "X disponibles ahora", real-first recs with "en vivo" and lastSync, clean cards, distance, REAL badges, filters.
- Live 1:1 and group chat confirmed working cross-device.
- Sessions with admin roles, feedback form, report/block.
- Recent UI: consistent "en vivo" badges, lastSync "hace Xs" in headers/empties/recs, decluttered texts for premium feel.
- Version: 0.1.0-prealpha
- Privacy & Terms: full tailored policies (see public/privacy.html, terms.html) with links in Profile.

## Required Assets (Create/Replace These)

### 1. Launcher Icons (Replace generic in android/app/src/main/res/mipmap-*/ )
- Use the generated high-res icon (from AI generation: modern teal/black fitness matching icon with dynamic figure).
- Resize for densities:
  - mipmap-mdpi: 48x48
  - mipmap-hdpi: 72x72
  - mipmap-xhdpi: 96x96
  - mipmap-xxhdpi: 144x144
  - mipmap-xxxhdpi: 192x192
- Also adaptive (ic_launcher_foreground.png, background).
- Prompt used: "Modern energetic fitness social app icon for EntrenaMatch, teal and black colors, abstract running figure or heart with dumbbell, clean minimalist design, high resolution square 512x512"

### 2. Feature Graphic (1024x500)
- Use generated: energetic scene of diverse adults training together in Chile (Viña beach/mountains), teal/black, bold "El match del movimiento".
- Prompt: "Play Store feature graphic 1024x500 for EntrenaMatch fitness matching app, energetic scene of diverse young adults (men and women) training together outdoors in Chile (Viña del Mar beach or mountains), teal and black modern design, bold text "El match del movimiento" "Entrena con gente real cerca de ti", premium clean style, high quality"

### 3. Phone Screenshots (at least 2-8,  portrait, showing real polished flows)
Use the current app UI for authenticity (the "disponibles ahora", en vivo, real recs, clean cards, lastSync, group chat etc.).

Suggested screenshots (generate or take from emulator/device with current build):
1. **Explore main** : Header "Explorar" with "X disponibles ahora cerca de ti", real profiles count "en vivo", lastSync, recs "Más compatibles (reales primero)" with en vivo badge and lastSync, cards with REAL, distance, compat %.
2. **Swipe/Choose profile** : Top card with premium info (name, age, city, bio, chips, VER PERFIL), action buttons (X heart), "en vivo" indicators.
3. **Real profile detail** (from recs or full): Bio, photos, training, "Reportar", "Me interesa".
4. **Match / Chat 1:1** : Live chat with "en vivo", messages, lastSync.
5. **Sessions list** : "Explorar sesiones", create, join, "en vivo", participants, last message preview.
6. **Group chat in session** : Live group chat, "en vivo", admin controls if creator.
7. **Profile** : "Sincronizar" with lastSync, Beta Feedback form (type, stars, text), history, legal links (Privacidad/Términos), "en vivo".
8. **Filters** : Modal with "Disponibles ahora" count, active filters, "Ver X disponibles".

Prompt example for mock: "Android phone screenshot of EntrenaMatch app, Explore tab, modern dark UI teal accents, header 'Explorar' '12 disponibles ahora cerca de ti' + 'en vivo' lastSync, real profiles recs 'Más compatibles (reales primero)' with en vivo badge, cards showing name age city REAL badge distance compat% bio chips, clean premium fitness social app style, realistic"

### 4. Other
- Short description: "El match del movimiento. Elige perfiles reales cerca de ti, chatea en vivo y coordina sesiones de entrenamiento. Solo 18+."
- Full description: Expand with current features (real cross-device, en vivo, etc.), benefits for fitness community in Chile.
- Category: Social / Health & Fitness.
- Content rating: 18+ (dating, social, fitness).
- Contact: soporte@entrenamatch.app
- Privacy policy URL: https://musclegrenadechile.github.io/entrenamatch/privacy.html (or Firebase hosted).
- High-res icon 512x512 for store.

## Instructions
- Replace icons in res/mipmap-* with resized versions of the generated icon (use Android Studio or online resizer).
- For screenshots: Run the app in emulator or device, navigate the polished flows, take screenshots, or use the prompts above with image tools to mock if needed.
- Update the store listing in Play Console with these + the descriptions.
- The polished UI (post 2026 polish wave) makes great authentic screenshots showing "elige perfiles reales en vivo".

This supports the Tier 1 launch for real testers.

See PRODUCTION_AND_APK.md for full build/upload steps.
