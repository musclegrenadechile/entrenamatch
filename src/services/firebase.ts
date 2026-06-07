import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { APP_VERSION } from '../constants';

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

const FIRESTORE_CACHE_VERSION_KEY = 'entrenamatch_firestore_cache_version';

/** After an app upgrade, skip IndexedDB persistence once to avoid tab-manager conflicts with stale tabs. */
function shouldUsePersistentFirestoreCache(): boolean {
  if (typeof localStorage === 'undefined') return true;
  try {
    const prev = localStorage.getItem(FIRESTORE_CACHE_VERSION_KEY);
    localStorage.setItem(FIRESTORE_CACHE_VERSION_KEY, APP_VERSION);
    return !prev || prev === APP_VERSION;
  } catch {
    return true;
  }
}

const firebaseConfig = getFirebaseConfig();

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let analytics: any = null;

if (firebaseConfig) {
  try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  // initializeAuth + redirect resolver — required for reliable Google OAuth redirect/popup (GH Pages + Capacitor).
  // Fallback chain: IndexedDB (best) → localStorage → default getAuth (Safari private / storage-blocked).
  try {
    auth = initializeAuth(app, {
      persistence: indexedDBLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch (indexedDbErr) {
    console.warn('[Firebase] indexedDB auth persistence failed, trying localStorage', indexedDbErr);
    try {
      auth = initializeAuth(app, {
        persistence: browserLocalPersistence,
        popupRedirectResolver: browserPopupRedirectResolver,
      });
    } catch {
      auth = getAuth(app);
    }
  }

  // Long-polling is critical for Capacitor WebView. persistentLocalCache needs IndexedDB — fall back on mobile Safari private mode.
  const usePersistentCache = shouldUsePersistentFirestoreCache();
  try {
    db = initializeFirestore(app, {
      localCache: usePersistentCache
        ? persistentLocalCache({ tabManager: persistentMultipleTabManager() })
        : memoryLocalCache(),
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: false,
    });
  } catch (persistErr) {
    console.warn('[Firebase] persistent Firestore cache failed, using memory cache', persistErr);
    try {
      db = initializeFirestore(app, {
        localCache: memoryLocalCache(),
        experimentalForceLongPolling: true,
        experimentalAutoDetectLongPolling: false,
      });
    } catch {
      db = getFirestore(app);
    }
  }

  storage = getStorage(app, 'gs://entrenamatch.firebasestorage.app');

  if (firebaseConfig.measurementId) {
    try {
      analytics = getAnalytics(app);
    } catch (analyticsErr) {
      console.warn('[Firebase] Analytics unavailable on this device', analyticsErr);
    }
  }
  } catch (initErr) {
    console.error('[Firebase] Critical init failure — app will run in degraded mode', initErr);
  }
}

export { app, auth, db, storage, analytics };
export const isFirebaseConfigured = !!firebaseConfig;
export const isDemoMode = !firebaseConfig;

export default app;

// enableNetwork() is ONLY valid after disableNetwork() (Firebase docs).
// Calling enableNetwork while already online triggers INTERNAL ASSERTION FAILED (ID: ca9 / da08).
// Firestore with persistentLocalCache auto-reconnects after offline — do NOT call enableNetwork proactively.
let networkDisabledByUs = false;
let recoverInFlight: Promise<void> | null = null;

async function runEnableNetwork(): Promise<void> {
  if (!db) return;
  try {
    const { enableNetwork } = await import('firebase/firestore');
    await enableNetwork(db);
    networkDisabledByUs = false;
    console.log('[Firestore] Network re-enabled after prior disable');
  } catch (e) {
    console.warn('[Firestore] enableNetwork failed', e);
  }
}

/** Re-enables network only if we previously called disableFirestoreNetwork. Safe no-op when online. */
export async function enableFirestoreNetwork(): Promise<void> {
  if (!db || !networkDisabledByUs) return;
  if (recoverInFlight) return recoverInFlight;
  recoverInFlight = runEnableNetwork().finally(() => {
    recoverInFlight = null;
  });
  return recoverInFlight;
}

/** Alias — safe no-op unless network was explicitly disabled first. */
export async function recoverFirestoreNetwork() {
  return enableFirestoreNetwork();
}

/** Disables Firestore network. Pair with enableFirestoreNetwork when coming back online. */
export async function disableFirestoreNetwork() {
  if (!db) return;
  try {
    const { disableNetwork } = await import('firebase/firestore');
    await disableNetwork(db);
    networkDisabledByUs = true;
  } catch (e) {
    console.warn('[Firestore] disableNetwork failed', e);
  }
}
