# Production Hosting & Android APK Guide

## Current State (Pre-Alpha)
- Web app on GitHub Pages (subpath `/entrenamatch/`)
- Firebase for Auth + Firestore (real multi-user data)
- Good for testing, **not production scale**

## Recommended Hosting for "Real" App (like Tinder/Badoo level)

**Best immediate move: Firebase Hosting** (recommended while staying in Firebase ecosystem)

1. Install Firebase CLI (once):
   ```
   npm install -g firebase-tools
   firebase login
   ```

2. Deploy:
   ```
   npm run deploy
   ```
   (or `firebase deploy --only hosting`)

This gives:
- Excellent PWA support
- Global CDN + HTTPS
- Easy custom domain (entrenamatch.com etc.)
- Rewrites for SPA routing
- Integrates perfectly with Firestore, Auth, Cloud Functions, **FCM push notifications**

Alternative strong options:
- **Vercel**: `vercel --prod` (amazing DX, previews, Edge functions)
- Cloudflare Pages

For true Tinder-scale (millions of users, advanced ML matching, heavy moderation):
- Add Cloud Functions (Node.js) for server-side matching, anti-spam, photo moderation.
- Consider Algolia or Elasticsearch for fast search/matching.
- Eventually custom backend (but Firebase can take you very far).

## Android APK (Real Native App)

**Yes — we are fully set up now.**

We added **Capacitor** (the standard way to turn a web app into real iOS/Android without rewriting everything).

### How to generate the APK right now:

1. Make sure you have **Android Studio** installed (https://developer.android.com/studio)

2. Build & prepare Android project:
   ```
   npm run android:build
   ```

3. Open in Android Studio:
   ```
   npx cap open android
   ```

4. In Android Studio:
   - Wait for Gradle sync
   - Menu: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - The debug APK will be in `android/app/build/outputs/apk/debug/`

For release (Play Store):
- Generate signed AAB (Android App Bundle) — Android Studio has a wizard.
- Use `npm run android:build` before signing.

### What you get with Capacitor:
- Real `.apk` / `.aab` that installs like any app
- Native access to Camera, Geolocation, Push Notifications (FCM), etc. (big upgrade vs pure web)
- Same web codebase (you edit in React/Vite, `cap sync` brings changes)
- Can still have the web version (PWA) at the same time

### Next recommended steps for "real" mobile experience:
- Add Capacitor Camera plugin for better photo taking in onboarding
- Set up Firebase Cloud Messaging for real push notifications ("someone liked you", "new message in session")
- Test on real Android device

## Summary of what was executed in this session
- firebase.json now includes proper Hosting config
- package.json has `deploy`, `android:build`, cap commands
- Capacitor installed + `android` platform added + synced
- `vite.config.ts` now supports `CAPACITOR=1` for correct asset paths in native builds (relative base)
- capacitor.config.ts created
- All changes committed and pushed

You now have a clear path from "web pre-alpha on GitHub Pages" to "production web on Firebase Hosting + real Android app".

Run `npm run android:build && npx cap open android` after installing Android Studio to get your first APK.

For any specific part (push notifications setup, Camera plugin, custom domain, etc.), just say the word and we continue.
