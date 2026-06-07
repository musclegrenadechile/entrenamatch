import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

function getFirebaseConfig(): FirebaseConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

  // Real Firebase config for EntrenaMatch (public client keys - safe for GitHub Pages)
  // This makes the deployed demo at github.io use real multi-user Firebase automatically.
  const REAL_CONFIG: FirebaseConfig = {
    apiKey: 'AIzaSyCuwkHPfuN5eJ49VsKseY_E_n9TniU_0k4',
    authDomain: 'entrenamatch.firebaseapp.com',
    projectId: 'entrenamatch',
    storageBucket: 'entrenamatch.firebasestorage.app',
    messagingSenderId: '689762738062',
    appId: '1:689762738062:web:4b74730e9293fb7cf44edf',
    measurementId: 'G-NXV9DDM327',
  };

  // If env var exists (local dev with .env), use it. Otherwise use real project config.
  if (apiKey) {
    return {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || REAL_CONFIG.authDomain,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || REAL_CONFIG.projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || REAL_CONFIG.storageBucket,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || REAL_CONFIG.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || REAL_CONFIG.appId,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || REAL_CONFIG.measurementId,
    };
  }

  // No env var → use real Firebase (this makes GitHub Pages demo multi-user capable)
  return REAL_CONFIG;
}

const firebaseConfig = getFirebaseConfig();

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let analytics: any = null;

if (firebaseConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  // Use initializeFirestore with long-polling forced.
  // This is critical for stability of real-time 'Listen' streams (onSnapshot) inside Capacitor Android WebView.
  // The default WebChannel transport frequently fails with "transport errored" + 404 on the /Listen/channel endpoint
  // on mobile hybrid apps due to WebView + network stack quirks. Long polling is far more reliable.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache(),
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: false,
  });

  // Explicit bucket helps ensure the correct auth token is attached for Storage uploads (fixes some 403/unauthorized cases on web + Capacitor)
  storage = getStorage(app, 'gs://entrenamatch.firebasestorage.app');

  if (firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
}

export { app, auth, db, storage, analytics };
export const isFirebaseConfigured = !!firebaseConfig;
export const isDemoMode = !firebaseConfig;

export default app;

// Re-establish Listen/WebChannel streams after offline or transport errors.
// Prefer this over disable+enable cycles — disabling tears down ALL active listeners.
// ALL enable paths must go through this module — repeated enableNetwork() triggers
// FIRESTORE INTERNAL ASSERTION FAILED (ID: ca9 / da08).
let lastNetworkRecoverAt = 0;
let recoverInFlight: Promise<void> | null = null;
const NETWORK_RECOVER_DEBOUNCE_MS = 4000;

async function runEnableNetwork(): Promise<void> {
  if (!db) return;
  try {
    const { enableNetwork } = await import('firebase/firestore');
    await enableNetwork(db);
    console.log('[Firestore] Network enabled (recovering Listeners)');
  } catch (e) {
    console.warn('[Firestore] enableNetwork failed', e);
  }
}

/** Debounced + coalesced — safe for all recovery paths (online, listener errors, sync start). */
export async function enableFirestoreNetwork(): Promise<void> {
  if (!db) return;
  if (recoverInFlight) return recoverInFlight;

  const now = Date.now();
  if (now - lastNetworkRecoverAt < NETWORK_RECOVER_DEBOUNCE_MS) return;

  recoverInFlight = runEnableNetwork().finally(() => {
    lastNetworkRecoverAt = Date.now();
    recoverInFlight = null;
  });
  return recoverInFlight;
}

/** Alias — same debounced path as enableFirestoreNetwork. */
export async function recoverFirestoreNetwork() {
  return enableFirestoreNetwork();
}

/** @deprecated Avoid in normal flows — disables all RT listeners app-wide. Use recoverFirestoreNetwork. */
export async function disableFirestoreNetwork() {
  if (!db) return;
  try {
    const { disableNetwork } = await import('firebase/firestore');
    await disableNetwork(db);
  } catch (e) {
    console.warn('[Firestore] disableNetwork failed', e);
  }
}
