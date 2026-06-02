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

A convenience `build-apk.bat` script was also added for Windows users.

### How to generate the APK right now:

**For Windows users (easiest):**
Double-click the `build-apk.bat` file we created in the project root (after installing Android Studio and setting up environment variables).

It will:
1. Build the web with correct paths for native.
2. Sync to the Android project.
3. Run Gradle to produce the APK.

**Manual steps (any OS):**

1. Make sure you have **Android Studio** installed (https://developer.android.com/studio). During install, make sure the Android SDK and build tools are selected.

2. (Important) Set environment variables if needed:
   - JAVA_HOME pointing to your JDK (included with Android Studio).
   - ANDROID_HOME to the SDK folder (usually `%LOCALAPPDATA%\Android\Sdk` on Windows).

3. Build & prepare Android project:
   ```
   npm run android:build
   ```

4. Open the native project in Android Studio:
   ```
   npx cap open android
   ```

5. In Android Studio:
   - Let it finish Gradle sync (first time can take a while).
   - Go to menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
   - The debug APK will be generated at:
     `android/app/build/outputs/apk/debug/app-debug.apk`

You can then transfer the APK to your Android phone and install it (enable "Unknown sources" or use ADB).

For a signed release APK/AAB (for Play Store):
- Use Android Studio's **Build → Generate Signed Bundle / APK** wizard.
- Always run `npm run android:build` first so the latest web code is included.

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
