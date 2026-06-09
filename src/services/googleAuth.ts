/**
 * Google Sign-In helpers — web (GH Pages), localhost, and Capacitor Android APK.
 */

import { Capacitor } from '@capacitor/core';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithCredential,
  getRedirectResult,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

export class GoogleAuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'GoogleAuthError';
  }
}

/** Domains that must be in Firebase Console → Auth → Authorized domains. */
export const GOOGLE_AUTH_AUTHORIZED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'musclegrenadechile.github.io',
  'entrenamatch.firebaseapp.com',
  'entrenamatch.web.app',
] as const;

export function getCurrentAuthHostname(): string {
  if (typeof window === 'undefined') return '';
  return window.location.hostname;
}

export function isMobileWebBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  if (Capacitor.isNativePlatform()) return false;
  const ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

/** Production hosts where popup OAuth is unreliable (GH Pages base path, Firebase Hosting). */
function isProductionWebHost(host: string): boolean {
  return (
    host.endsWith('.github.io') ||
    host.endsWith('.web.app') ||
    host.endsWith('.firebaseapp.com')
  );
}

/**
 * Prefer redirect on mobile web and production hosting — popups often fail on GH Pages.
 * APK uses native Google Sign-In via @capacitor-firebase/authentication.
 */
export function shouldUseGoogleRedirect(): boolean {
  if (typeof window === 'undefined') return false;
  if (Capacitor.isNativePlatform()) return false;

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return !isMobileWebBrowser();
  }

  if (isMobileWebBrowser() || isProductionWebHost(host)) return true;

  return false;
}

function buildGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

export function mapGoogleAuthError(error: unknown): GoogleAuthError {
  const err = error as { code?: string; message?: string };
  const code = err?.code || 'auth/unknown';
  const host = getCurrentAuthHostname();

  if (code === 'auth/unauthorized-domain') {
    return new GoogleAuthError(
      code,
      `Dominio no autorizado: ${host}. Agrega "${host}" en Firebase Console → Authentication → Settings → Authorized domains.`
    );
  }
  if (code === 'auth/missing-initial-state') {
    return new GoogleAuthError(
      code,
      'La sesión de Google se perdió al volver (común en móvil). Prueba de nuevo o usa email/contraseña.'
    );
  }
  if (code === 'auth/popup-blocked') {
    return new GoogleAuthError(
      code,
      'Permite ventanas emergentes para Google o usa email/contraseña.'
    );
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return new GoogleAuthError(code, 'Inicio de sesión con Google cancelado.');
  }
  if (code === 'auth/network-request-failed') {
    return new GoogleAuthError(
      code,
      'Error de red al conectar con Google. Revisa tu conexión e intenta de nuevo.'
    );
  }
  if (code === 'auth/operation-not-allowed') {
    return new GoogleAuthError(
      code,
      'Google Sign-In no está habilitado en Firebase. Activa el proveedor Google en Authentication → Sign-in method.'
    );
  }
  if (code === 'auth/no-id-token') {
    return new GoogleAuthError(
      code,
      err?.message ||
        'Google no devolvió credenciales. Verifica SHA-1 release/debug en Firebase Console → app Android.'
    );
  }

  return new GoogleAuthError(code, err?.message || 'No se pudo iniciar sesión con Google.');
}

export function getGoogleRedirectFailureMessage(): string {
  if (Capacitor.isNativePlatform()) {
    return 'Actualiza la app desde Play Store. Si persiste, usa email/contraseña.';
  }
  if (isMobileWebBrowser()) {
    return 'El inicio con Google en el navegador móvil falló al volver. Prueba de nuevo o usa email/contraseña.';
  }
  return 'Google no completó el redirect. Prueba de nuevo o usa email/contraseña.';
}

export type GoogleSignInResult =
  | { mode: 'redirect' }
  | { mode: 'popup'; user: FirebaseUser };

let redirectResultOnce: Promise<FirebaseUser | null> | null = null;

const AUTH_READY_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new GoogleAuthError('auth/timeout', `${label} tardó demasiado (${ms / 1000}s). Revisa conexión o prueba recargar.`));
    }, ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

async function signInWithGoogleNative(): Promise<FirebaseUser> {
  const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
  const result = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true });
  const idToken = result.credential?.idToken;
  const accessToken = result.credential?.accessToken;

  if (!idToken) {
    throw new GoogleAuthError(
      'auth/no-id-token',
      'Google no devolvió credenciales. Verifica SHA-1 release/debug en Firebase Console → app Android.'
    );
  }

  const credential = GoogleAuthProvider.credential(idToken, accessToken ?? undefined);
  const userCred = await signInWithCredential(auth!, credential);
  return userCred.user;
}

/** Start Google sign-in. Returns redirect mode when the page will navigate away. */
export async function startGoogleSignIn(): Promise<GoogleSignInResult> {
  if (!isFirebaseConfigured || !auth) {
    throw new GoogleAuthError(
      'auth/demo-mode',
      'Google Sign-In requiere Firebase configurado. Usa email/contraseña en demo o la app nativa con cuenta real.'
    );
  }

  if (Capacitor.isNativePlatform()) {
    const user = await signInWithGoogleNative().catch((error) => {
      throw mapGoogleAuthError(error);
    });
    sessionStorage.removeItem('entrenamatch_google_redirect_pending');
    return { mode: 'popup', user };
  }

  const provider = buildGoogleProvider();

  if (shouldUseGoogleRedirect()) {
    sessionStorage.setItem('entrenamatch_google_redirect_pending', '1');
    await signInWithRedirect(auth, provider);
    return { mode: 'redirect' };
  }

  try {
    const cred = await signInWithPopup(auth, provider);
    sessionStorage.removeItem('entrenamatch_google_redirect_pending');
    return { mode: 'popup', user: cred.user };
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
      throw mapGoogleAuthError(error);
    }
    if (
      err?.code === 'auth/popup-blocked' ||
      (isMobileWebBrowser() && err?.code === 'auth/popup-closed-by-user')
    ) {
      sessionStorage.setItem('entrenamatch_google_redirect_pending', '1');
      await signInWithRedirect(auth, provider);
      return { mode: 'redirect' };
    }
    throw mapGoogleAuthError(error);
  }
}

/** Call once on app load (singleton — safe with React StrictMode). */
export async function finishGoogleRedirectSignIn(): Promise<FirebaseUser | null> {
  if (!isFirebaseConfigured || !auth) return null;

  // Native APK uses @capacitor-firebase/authentication — no OAuth redirect to drain.
  if (Capacitor.isNativePlatform()) {
    try {
      await withTimeout(auth.authStateReady(), 3000, 'Firebase Auth');
    } catch {
      /* onAuthStateChanged will still deliver currentUser */
    }
    return auth.currentUser;
  }

  if (!redirectResultOnce) {
    redirectResultOnce = (async () => {
      try {
        await withTimeout(auth.authStateReady(), AUTH_READY_TIMEOUT_MS, 'Firebase Auth');
        const result = await getRedirectResult(auth);
        if (result?.user) {
          sessionStorage.removeItem('entrenamatch_google_redirect_pending');
          return result.user;
        }
        if (auth.currentUser) {
          sessionStorage.removeItem('entrenamatch_google_redirect_pending');
          return auth.currentUser;
        }
        return null;
      } catch (error) {
        redirectResultOnce = null;
        throw mapGoogleAuthError(error);
      }
    })();
  }

  return redirectResultOnce;
}
