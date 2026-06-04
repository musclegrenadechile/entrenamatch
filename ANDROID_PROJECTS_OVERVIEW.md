# Android Projects in this workspace

**Active / Source of truth for Play Store (com.entrenamatch.app):**
- `fitvina/` (this directory)
  - React 18 + TypeScript + Vite + Capacitor
  - All current features: "Entrenando Ahora" live (radar, streaks, join, progress, glows, banner, modal), muro (posts, likes, comments, pinned, feed tab), Play Integrity, push notifications (prefs, explicit activate), real Firebase, etc.
  - Publish automation (publish-play.ps1/.bat + gradle triplet.play)
  - The AABs you have been uploading to closed testing come from here.

**Legacy / Old Flutter attempts (archived):**
- `_legacy/entrenamatch_old_flutter/` → package `com.muscle.entrenamatch`
- `_legacy/entrenamatch_nuevo_old_flutter/` → package `com.muscle.entrenamatch_nuevo` (had a google-services.json for its package)

These were previous attempts before the full migration to the current React/Capacitor implementation. They are kept for reference only. Do **not** build or upload from them for the current Play Store listing.

**Current Play Store app package:**
`com.entrenamatch.app`

**Why the app crashes on open from Play Store download:**
See the detailed diagnosis in `plan.md` (search for "crash al abrir" or "google-services").

Short version: The AABs built so far from `fitvina` did not have `android/app/google-services.json` for `com.entrenamatch.app` at build time. The Capacitor push-notifications plugin pulls in Firebase native, which requires the google-services Gradle plugin to have processed the json. Without it, native Firebase init fails early and the Android process is killed on launch.

**How to fix (I can run the build):**
1. In Firebase Console (entrenamatch project) register/add an Android app with package name **exactly** `com.entrenamatch.app`.
2. Download `google-services.json`.
3. Place it at `android/app/google-services.json` inside this fitvina dir.
4. Tell me "ya coloque el json" or paste the content if you want me to `echo >` it here.
5. I will run the full build (`npm run android:build` + gradle bundleRelease with proper env), copy fresh AAB as e.g. `EntrenaMatch-v0.1.6-prealpha-fixed-launch.aab`, update docs, commit, push.
6. You upload the new AAB as a new release in the closed track.

After placing the json, the improved `android/app/build.gradle` will print a clear success message during build.

**Other notes:**
- Always build the Android release AAB from the `fitvina` directory only.
- Web / GH Pages is also from here (`npm run build`).
- If you want to completely delete the _legacy after confirming, we can.

