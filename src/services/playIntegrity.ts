// Play Integrity API wrapper for EntrenaMatch
// Uses @capacitor-community/play-integrity on native Android (Play Store builds)
// On web / demo: returns a simulated positive result so flows don't break.
// 
// The token you get here must be sent to a trusted server for full verification
// (using Google APIs) to obtain the rich JSON like the one the user provided:
// { requestDetails, accountDetails: {appLicensingVerdict: "LICENSED"}, appIntegrity: {appRecognitionVerdict: "PLAY_RECOGNIZED", ...}, deviceIntegrity: {deviceRecognitionVerdict: ["MEETS_DEVICE_INTEGRITY"]} }
//
// This protects against tampered APKs, rooted devices used for abuse, and unlicensed installs.

import { Capacitor } from '@capacitor/core';

export interface IntegrityResult {
  available: boolean;
  token?: string;
  error?: string;
  // For demo/web we can attach a simulated verdict
  simulatedVerdict?: any;
}

let cachedLastResult: IntegrityResult | null = null;

function generateNonce(): string {
  // Strong enough nonce for client-side demo. 
  // In production, fetch a server-generated nonce (tied to user/session) for anti-replay.
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback (less ideal)
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  // Base64url encode (no padding, - and _)
  let b64 = btoa(String.fromCharCode(...Array.from(array)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function requestPlayIntegrityToken(customNonce?: string): Promise<IntegrityResult> {
  const isNative = Capacitor.isNativePlatform();
  console.log('[Play Integrity] isNativePlatform():', isNative, 'Capacitor platform:', Capacitor.getPlatform ? Capacitor.getPlatform() : 'n/a');

  if (!isNative) {
    // Web / PWA / demo mode: simulate a fully positive response
    // This matches the structure the user showed from Google.
    const simulated = {
      requestDetails: {
        requestPackageName: 'com.entrenamatch.app',
        timestampMillis: Date.now().toString(),
        nonce: customNonce || generateNonce(),
      },
      accountDetails: {
        appLicensingVerdict: 'LICENSED',
      },
      appIntegrity: {
        appRecognitionVerdict: 'PLAY_RECOGNIZED',
        packageName: 'com.entrenamatch.app',
        certificateSha256Digest: ['SIMULATED_FOR_WEB_DEMO'],
        versionCode: '10',
      },
      deviceIntegrity: {
        deviceRecognitionVerdict: ['MEETS_DEVICE_INTEGRITY'],
      },
    };

    const result: IntegrityResult = {
      available: true,
      simulatedVerdict: simulated,
    };
    cachedLastResult = result;
    return result;
  }

  // Native path: use the community plugin
  try {
    // The plugin is loaded into window.__CAPACITOR_PLUGINS__ in CAP builds
    const plugins = (typeof window !== 'undefined' && (window as any).__CAPACITOR_PLUGINS__) || {};
    const PlayIntegrity = plugins.PlayIntegrity;

    if (!PlayIntegrity) {
      return { available: false, error: 'PlayIntegrity plugin not loaded (only available in native Android build)' };
    }

    const nonce = customNonce || generateNonce();

    // The community plugin API (from docs): requestIntegrityToken({ nonce })
    const response = await PlayIntegrity.requestIntegrityToken({ nonce });

    const token = response?.token || response?.integrityToken; // support slight API diffs

    if (!token) {
      return { available: false, error: 'No token returned from Play Integrity' };
    }

    const result: IntegrityResult = {
      available: true,
      token,
    };
    cachedLastResult = result;

    // Note to developer: take this `token` and send it to your backend.
    // On backend use Google Play Integrity API (with service account or the verification endpoint)
    // to decode and obtain the full verdict JSON the user pasted.
    return result;
  } catch (err: any) {
    console.error('Play Integrity request failed', err);
    return {
      available: false,
      error: err?.message || 'Play Integrity request failed',
    };
  }
}

export function getLastIntegrityResult(): IntegrityResult | null {
  return cachedLastResult;
}

// Helper: returns true if we have a positive simulated or (in future) parsed real verdict
export function hasPositiveIntegrity(result?: IntegrityResult): boolean {
  const r = result || cachedLastResult;
  if (!r) return false;
  if (r.simulatedVerdict) {
    const v = r.simulatedVerdict;
    return (
      v.accountDetails?.appLicensingVerdict === 'LICENSED' &&
      v.appIntegrity?.appRecognitionVerdict === 'PLAY_RECOGNIZED' &&
      (v.deviceIntegrity?.deviceRecognitionVerdict || []).includes('MEETS_DEVICE_INTEGRITY')
    );
  }
  // If we only have a raw token, we can't know yet without server verification.
  // Treat "we got a token" as "at least the API call succeeded on a real device".
  return !!r.token;
}
