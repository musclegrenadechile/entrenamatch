import type { CurrentUser } from '../types';

/** Shared seed for "demo sin cuenta" entry (web + Capacitor). */
export const QUICK_DEMO_USER: CurrentUser = {
  id: 'me',
  name: 'Demo Tester',
  age: 28,
  gender: 'mujer',
  city: 'Viña del Mar',
  country: 'Chile',
  lat: -33.0153,
  lng: -71.5528,
  bio: 'Demo lista para probar live + muro. Entreno pesas y running. ¡Conectemos!',
  photos: ['https://picsum.photos/id/1011/600/800'],
  trainingTypes: ['Pesas/Gym', 'Running'],
  goals: ['Ganar músculo', 'Socializar y motivación'],
  level: 'Intermedio',
  intensity: 'Moderado',
  availability: ['Tarde'],
  wantsToGoLive: false,
  legalConsents: {
    acceptedAt: Date.now(),
    termsVersion: 'v1.1',
    privacyVersion: 'v1.1',
    communityVersion: 'v1.0',
    is18: true,
    isForTraining: true,
    sharesLocation: true,
  },
};

export const QUICK_DEMO_SESSION_KEY = 'entrenamatch_quick_demo';

export function markQuickDemoSession(): void {
  try {
    sessionStorage.setItem(QUICK_DEMO_SESSION_KEY, '1');
  } catch {}
}

export function clearQuickDemoSession(): void {
  try {
    sessionStorage.removeItem(QUICK_DEMO_SESSION_KEY);
  } catch {}
}

export function isQuickDemoSession(): boolean {
  try {
    return sessionStorage.getItem(QUICK_DEMO_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}
