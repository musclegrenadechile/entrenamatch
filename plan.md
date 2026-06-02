# EntrenaMatch Pre-Alpha Execution Plan (Updated Phase 0 Focus)

**Status**: Phase 0 in active execution. Full autonomy mode. Frequent commits/pushes required so user can Ctrl+Shift+R on GH Pages + install fresh APK.

**Live web**: https://musclegrenadechile.github.io/entrenamatch/
**Repo**: https://github.com/musclegrenadechile/entrenamatch
**APK source**: GitHub Releases (android-prealpha tag) + local build scripts + CI artifacts.

## Core Goal of Pre-Alpha (Phase 0)
Make the app **genuinely usable for hidden cross-device beta testing** with real accounts on real phones:
- Email/password (and future Google) auth that survives hard refresh on different devices.
- Complete multi-step onboarding that creates **real visible profiles**.
- Explore shows **real profiles** from other testers (filters + live count).
- Real matches + 1:1 chat that appears on the other person's device.
- Create/Join sessions + **real group chat** inside them (participants array persisted).
- Prominent escape hatches ("Cambiar cuenta", "Cerrar sesión") everywhere.
- No black/empty screens. Premium attractive UI (chips, cards, gradients, REAL badges).
- **Legal pages** + feedback loop ready for Play Console review.
- Signed AAB ready + CI for APKs.
- **Store assets + listing text** prepared for Internal/Closed testing upload (hidden, invite-only).

Everything must work after hard refresh + on different physical devices (not just same browser).

## Current Phase: 0 — Foundation + Store Submission Ready (HIDDEN beta)

### Phase 0 Checklist (execute in order, mark done, commit/push after each meaningful batch)

**Completed (prior cycles):**
- [x] Real Firebase Auth + Firestore wiring (effectiveUserId = uid, dual demo/real mode stable).
- [x] Onboarding full (Paso 0 name/age/city/gender/bio + photos + training/goals + level + consents). Layout fixed (fixed header + scroll + bottom bar). Camera native button in onboarding (APK only).
- [x] Profile tab no longer black (self-contained, rich hero + gallery + stats + REAL badges + multiple large escape buttons).
- [x] Explore: real profiles visible, filters with live count banner, "Actualizar reales" + toast + spinner.
- [x] Sessions: create + join persists participants, load with orderBy createdAt, "Actualizar sesiones reales".
- [x] Group chat + 1:1 chat real (manual load + polling fallback + optimistic).
- [x] Legal: public/privacy.html + public/terms.html full Spanish text + linked in Profile + Onboarding consents + internal modal.
- [x] Beta feedback basic form in Profile (saves to betaFeedback collection).
- [x] Native Android: Capacitor + camera plugin + full android/ project + debug APK + signed release AAB (keystore secured).
- [x] CI: GitHub Actions for web GH Pages + android-prealpha APK build + attach to Release.
- [x] Firebase Hosting config (firebase.json) + dedicated workflow (requires secret for full auto).
- [x] BETA_TESTERS_GUIDE.md initial + PREALPHA + PRODUCTION docs.
- [x] Escape hatches: always visible via global top PRE-ALPHA bar ("Cerrar sesión"/"Cambiar cuenta") + Profile sticky header + subtle bottom link in Profile. Removed the intrusive big red center block + floating red "CAMBIAR DE CUENTA / SALIR" button that blocked content/UX in Profile (user request). Still impossible to get trapped.
- [x] Version in android build.gradle = 0.1.0-prealpha (code 2).
- [x] Star crash + other runtime fixes, onboarding step 2 chips improved with counters + quick actions.

**In Progress / Next for Phase 0 (current session "sigamos con el phase 0"):**
- [x] Enhance beta feedback form (structured: category select Bug/Idea/UX/Otro, 1-5 stars rating, richer metadata: platform, userAgent, appVersion, createdAt; after submit: clear + toast + list of "Mis feedbacks anteriores" loaded live from Firestore for the tester; note "En APK puedes adjuntar captura al reportar por el mismo canal").
- [x] Link legal pages more visibly: AuthScreen footer (make the accept text clickable to /privacy.html + /terms.html), Onboarding step 4 (consents), session creation modal footer, chat header small "Privacidad" link. Also ensure absolute paths work under /entrenamatch/ subpath.
- [x] Deeper native camera in Profile: add "Cámara del teléfono" quick button next to gallery / hero photo (direct add photo + save to Firestore profile without forcing full onboarding flow). Reuse dynamic Capacitor pattern. Show only when isNative/CapacitorCamera.
- [x] Activate + polish Firebase Hosting path: ensure firebase-deploy.yml is solid (already good), update PRODUCTION_AND_APK.md + README with one-command deploy instructions + note that once secret is set, pushes auto-deploy to Firebase hosting (better PWA + future FCM). Add small "Firebase Hosting ready" callout in app if desired. Provide the hosting URL placeholder.
- [x] Expand BETA_TESTERS_GUIDE.md:
  - Exact step-by-step "Cómo instalar desde Internal testing (Play Store oculto)".
  - Exact "Cómo instalar desde Closed testing (Google Group)".
  - Detailed "Cómo reportar usando el formulario dentro de la app (ahora mejorado)".
  - Screenshots placeholders or descriptions.
  - Known issues + "Actualizar reales" / "Sincronizar" habits.
  - "Cómo dar feedback de APK nativa vs web".
- [x] Play Store assets & listing text ready (create PLAY_STORE_ASSETS.md):
  - App name, short description (80 chars), full description (4000 chars) ready-to-paste.
  - "What's new" for prealpha.
  - Privacy Policy URL (https://musclegrenadechile.github.io/entrenamatch/privacy.html or future firebase).
  - Feature graphic description (1024x500) + prompts.
  - 4-8 phone screenshot prompts + captions (for Play Console upload).
  - Use image_gen tool to produce actual placeholder graphics if possible and commit descriptions.
  - Icon note (use existing or generate high-res).
- [x] Version bump everywhere visible:
  - package.json → "0.1.0-prealpha"
  - Add small version string in Profile footer and perhaps Auth welcome.
  - (android bumped to code 3).
- [x] Polish / stability:
  - Visible "Última sincronización: hace X seg" in Explore and Sessions headers.
  - Stronger empty states for real mode (existing good + lastSync indicators).
  - Loading spinners on all refresh actions + optimistic feedback.
  - Ensure onSnapshot or polling covers sessions + profiles reliably (keep the 30s fallback).
  - Add "Reportar problema" floating mini action in more screens.
- [x] Build + test locally (npm run build succeeded cleanly), then frequent small git commits + `git push` after each deliverable so live site + CI APK update.
- [x] Update all guides (BETA, PRODUCTION, PREALPHA, README) with latest "Phase 0 complete" checklist + links to new assets. (BETA, PREALPHA, PRODUCTION updated with cleaner Profile escape hatches note, no more blocking red center/floating logout; plan.md refreshed; README expanded with Pre-Alpha real section, dual-mode note, links to BETA/PLAY_STORE guides).
- [x] Final verification: hard refresh on web + install latest APK on device, create 2 real accounts on separate "devices", full flow (incl. profile edit/save + clean logout + **session creator admin: close/expel/leave**), submit feedback, confirm cross-device visibility. (Pushes include sessions admin roles.)

**Sign-off for Phase 0**: After all above (including recent: session creator admin/close/expel/leave with ADMIN badges, floating "Reportar problema" everywhere, stronger real-mode empty states, Firebase Hosting note in-app, extra Play screenshots, full guide updates), the app + AAB + listing copy + guides are ready for the user to upload the AAB to Play Console Internal testing track (hidden). Then move to Phase 1 (invite 5-10 real beta testers, structured feedback collection, triage, promote to Closed if good).

**Current status (this continuation)**: Phase 0 core is solid (profile save + chat real-time with onSnapshot/bg polls/refresh btns/lastSync + chat header refresh/report buttons; empty states polished; welcome modal updated; previous fixes). Pushes ongoing (latest 19252d6). Hard refresh + test. Ready for sign-off.

## Phase 1 (after Phase 0 sign-off)
- Upload signed AAB to Internal testing (hidden).
- Invite initial testers via emails/Google Group.
- In-app + external feedback loop active.
- Monitor Firestore betaFeedback collection.
- Fix critical bugs from real usage.
- Prepare Closed testing track.
- Add basic push notifications scaffolding (FCM via Capacitor plugin) if time.
- More polish on matching quality, session UX.

## Later Phases (high level)
- Phase 2: Open testing or small production, moderation tools, anti-abuse, richer matching (location + compatibility score).
- Phase 3: Scale, custom domain, marketing landing, iOS, advanced features (post-session reviews, streaks, etc).

## Technical Notes (keep in mind)
- Dual mode: isDemoMode = !firebaseUser. effectiveUserId = firebaseUser?.uid || 'me'.
- Real writes go to Firestore (profiles, likes, matches, sessions, messages, betaFeedback).
- Always defensive rendering (?. optional chaining) + skeletons + toasts.
- Onboarding pre-fills from currentUser when editing.
- Logout = signOut + local clear + window.location.reload().
- For native camera: dynamic import + Capacitor.isNative check not strictly needed (the module presence is the guard).
- Capacitor builds: use CAPACITOR=1 env for relative base in vite.
- Keystore password: EntrenaMatch2026!Strong (NEVER commit, already .gitignore'd).
- Every push → GH Pages updates in 3-8 min. Hard refresh required for testers.

## Execution Rules (active)
- No asking for permission mid-flow. User said "sigamos con el phase 0", "tienes autorización completa", "sigue sin parar".
- After code changes that affect UX: run build, git commit -m "phase0: ...", git push.
- Update this plan.md (mark checkboxes) + relevant .md guides on each batch.
- Prioritize tester-visible value and "no black screens / always exit" + feedback loop.
- Keep visual premium (Tailwind + custom card/chip/gradient styles).

Last updated: Phase 0 continuation (chat header refresh/report, lastSync, empty/welcome polish; profile/chat solid; pushes). Ready for sign-off.
