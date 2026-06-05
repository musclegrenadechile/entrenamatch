import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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
  db = getFirestore(app);
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
