/**
 * Google Sign-In helpers — web (GH Pages), localhost, and Capacitor Android APK.
 */

import { Capacitor } from '@capacitor/core';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
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

/** Redirect is more reliable than popup in WebView, GH Pages, localhost, and mobile browsers. */
export function shouldUseGoogleRedirect(): boolean {
  if (typeof window === 'undefined') return false;
  if (Capacitor.isNativePlatform()) return true;

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  if (host.endsWith('.github.io') || host === 'github.io') return true;

  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;

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
  if (code === 'auth/popup-blocked') {
    return new GoogleAuthError(code, 'El navegador bloqueó la ventana de Google. Intenta de nuevo — usaremos redirección.');
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

  return new GoogleAuthError(code, err?.message || 'No se pudo iniciar sesión con Google.');
}

export type GoogleSignInResult =
  | { mode: 'redirect' }
  | { mode: 'popup'; user: FirebaseUser };

/** Start Google sign-in. Returns redirect mode when the page will navigate away. */
export async function startGoogleSignIn(): Promise<GoogleSignInResult> {
  if (!isFirebaseConfigured || !auth) {
    throw new GoogleAuthError(
      'auth/demo-mode',
      'Google Sign-In requiere Firebase configurado. Usa email/contraseña en demo o la app nativa con cuenta real.'
    );
  }

  const provider = buildGoogleProvider();

  if (shouldUseGoogleRedirect()) {
    await signInWithRedirect(auth, provider);
    return { mode: 'redirect' };
  }

  try {
    const cred = await signInWithPopup(auth, provider);
    return { mode: 'popup', user: cred.user };
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (
      err?.code === 'auth/popup-blocked' ||
      err?.code === 'auth/popup-closed-by-user' ||
      err?.code === 'auth/cancelled-popup-request'
    ) {
      await signInWithRedirect(auth, provider);
      return { mode: 'redirect' };
    }
    throw mapGoogleAuthError(error);
  }
}

/** Call on app load to finish redirect-based Google sign-in. */
export async function finishGoogleRedirectSignIn(): Promise<FirebaseUser | null> {
  if (!isFirebaseConfigured || !auth) return null;

  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch (error) {
    throw mapGoogleAuthError(error);
  }
}
