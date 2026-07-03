# EntrenaMatch Play Store Assets — v0.1.386 (marketing oleada 501–510)

**Multi-country beta** · Mapa LIVE · brand orange `#FF671F` · ver `PLAY_MARKETING_v0.1.386.md` para copy de tienda.

## Current Status (v0.1.386)
- App en beta multi-país: Chile, Perú, México, USA.
- Wedge visible: **Mapa LIVE** + EntrenaSync + Copa Zona + Muro de la Comunidad.
- Copy alineado: sin “GymPulse” en strings de usuario (retos, stories, manifest).
- Landing sin métricas inventadas; testimonios honestos.
- Version: **0.1.386**

## Required Assets (Create/Replace These)

### 1. Launcher Icons (Replace generic in android/app/src/main/res/mipmap-*/ )
- Use orange/black brand (`#FF671F`) — not teal. Icon: `public/icons/icon-512.jpg`.
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
- **Short description (80 chars, ES v0.1.386):** `Quién entrena cerca, ahora. Match, EntrenaSync y Mapa LIVE. Fútbol, gym y más. +18.`
- **Full description — párrafo 1 (ES v0.1.386):**
  ```
  EntrenaMatch es la red donde ves quién entrena ahora cerca de ti — en la cancha, la pista, el gym o la costanera — y conectas con personas compatibles por deporte, horario e intensidad.

  No es dating. Es entrenamiento en serio: Mapa LIVE, match por compatibilidad y EntrenaSync para moverse juntos. Tus minutos suman a tu Comunidad y la Copa Zona de tu región.

  Beta multi-país: Chile, Perú, México y USA. Solo +18.
  ```
- Category: Social / Health & Fitness.
- Content rating: 18+ (dating, social, fitness).
- Contact: soporte@entrenamatch.app
- Privacy policy URL: https://musclegrenadechile.github.io/entrenamatch/privacy.html (or Firebase hosted).
- High-res icon 512x512 for store.

## Generated Assets (use these)
- icon-512.jpg : High quality app icon (from image gen, modern teal fitness theme).
- feature-graphic.jpg : Existing or update with prompt.
- screenshot-explore-polished.jpg : Realistic Explore screen showing current polished UI (disponibles ahora, en vivo, real recs, cards).
- screenshot-chat-polished.jpg : Live chat example with en vivo.
- screenshot-explore.jpg, screenshot-chat.jpg : Older placeholders, replace with polished ones.

## Instructions for Play Store / Android
1. For icons: Resize icon-512.jpg to the mipmap densities (48/72/96/144/192 px) using any image tool or Android Studio Image Asset. Replace ic_launcher.png, ic_launcher_round.png, ic_launcher_foreground.png in all mipmap-* folders. Also update adaptive icon if needed.
2. For feature graphic: Use or edit feature-graphic.jpg to 1024x500.
3. For screenshots: Use the -polished.jpg as base (they show the actual current app UI with all recent polish: "disponibles ahora", en vivo badges, lastSync, real-first recs, clean cards, live chat). Crop/add phone bezel in editor if desired for store (Google accepts with/without). Need at least 2, up to 8. Make sure they highlight real profiles, live indicators, sessions.
4. Descriptions: Use in Play Console:
   - Short: "El match del movimiento. Elige perfiles reales cerca de ti, chatea en vivo y coordina sesiones de entrenamiento. Solo +18."
   - Full: "EntrenaMatch te conecta con personas que entrenan de verdad cerca de ti. Explora perfiles reales con filtros en vivo, recomendaciones 'reales primero', compatibilidad y distancia. Haz match, chatea 1:1 o en grupo dentro de sesiones de entrenamiento que tú creas o a las que te unes. Todo cross-device y real-time. Pre-alpha: únete a la beta oculta y ayuda a construir la mejor comunidad fitness de Chile y LatAm. Solo mayores de 18."
5. Update Play Console: Upload assets, set privacy policy URL to https://musclegrenadechile.github.io/entrenamatch/privacy.html (or your hosted), contact email, category Health & Fitness or Social, content rating 18+.
6. The polished UI from recent Phase 0 work (en vivo everywhere, lastSync, disponibles ahora, real recs, decluttered empties) is ready for great screenshots that show the premium "elige perfiles reales" experience.

This completes the visual assets part of Tier 1 for hidden beta launch to real testers.

See the main plan for full checklist. Update screenshots after any final polish.

## Next for you (user)
- Resize and replace icons in android res.
- Use polished screenshots.
- Add google-services.json for push (from your Firebase project, package name com.entrenamatch or whatever set).
- Rebuild signed AAB.
- Test on device per the protocol in BETA_TESTERS_GUIDE.md.
- Upload to Play Internal, add your 5-10 Chile testers.
- Share the welcome from the app.

Everything code-side for launch is ready (legal, push client, welcome, safety report in elegir flow, UI polish).

Pushes done. Hard refresh or rebuild to test.
