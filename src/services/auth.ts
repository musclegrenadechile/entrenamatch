import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';

// ==================== DEMO MODE (GitHub Pages public demo) ====================
const DEMO_USER_KEY = 'entrenamatch_demo_user';

export function getDemoUser(): any | null {
  const stored = localStorage.getItem(DEMO_USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

function saveDemoUser(user: any) {
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
  // Notify listeners (used by AuthContext in demo mode)
  window.dispatchEvent(new CustomEvent('demo-auth-changed', { detail: { user } }));
}

function clearDemoUser() {
  localStorage.removeItem(DEMO_USER_KEY);
  window.dispatchEvent(new CustomEvent('demo-auth-changed', { detail: { user: null } }));
}

// Fake Firebase-like user object for demo
function createDemoUser(email: string) {
  const uid = 'demo_' + Date.now();
  return {
    uid,
    email,
    displayName: email.split('@')[0],
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => '',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
  } as any;
}

// Types for our app (we'll expand this)
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  // Our custom fields will go in Firestore
}

export interface UserProfile {
  uid: string;
  name: string;
  age: number;
  gender: import('../types').ProfileGender;
  city: string;
  country: string;
  bio: string;
  photos: string[];
  photosUpdatedAt?: number;
  trainingTypes: string[];
  goals: string[];
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  intensity: 'Relajado' | 'Moderado' | 'Intenso';
  availability: string[];
  verificationStatus: 'unverified' | 'pending' | 'verified';
  verificationDate?: number;
  verificationDocuments?: {
    selfiePhoto?: string;
    idPhoto?: string;
  };
  createdAt: any;
  updatedAt: any;
}

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string) => {
  if (!isFirebaseConfigured) {
    // Public demo mode - use localStorage only
    const demoUser = createDemoUser(email);
    saveDemoUser(demoUser);
    return demoUser;
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  if (!isFirebaseConfigured) {
    // Public demo mode - use localStorage only
    const demoUser = createDemoUser(email);
    saveDemoUser(demoUser);
    return demoUser;
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign in with Google — delegates to googleAuth.ts (web + Capacitor + GH Pages)
export {
  startGoogleSignIn as signInWithGoogle,
  finishGoogleRedirectSignIn as handleGoogleRedirectResult,
  GoogleAuthError,
  GOOGLE_AUTH_AUTHORIZED_DOMAINS,
  shouldUseGoogleRedirect,
} from './googleAuth';
export type { GoogleSignInResult } from './googleAuth';

/** Create or enrich Firestore profile after Google OAuth. */
export async function completeGoogleSignInProfile(
  fbUser: FirebaseUser
): Promise<{ profile: UserProfile | null; isNewUser: boolean }> {
  let profile = await getUserProfile(fbUser.uid);
  const isNewUser = !profile;

  if (!profile) {
    profile = await createUserProfile(fbUser, {
      name: fbUser.displayName || '',
      age: 25,
      gender: 'hombre',
      city: '',
      country: 'Chile',
      bio: '',
      photos: fbUser.photoURL ? [fbUser.photoURL] : [],
      trainingTypes: [],
      goals: [],
      level: 'Intermedio',
      intensity: 'Moderado',
      availability: ['Tarde'],
    });
  } else {
    const patch: Partial<UserProfile> = {};
    if (fbUser.displayName && !profile.name) patch.name = fbUser.displayName;
    if (fbUser.photoURL && (!profile.photos || profile.photos.length === 0)) {
      patch.photos = [fbUser.photoURL];
    }
    if (Object.keys(patch).length > 0) {
      await updateUserProfile(fbUser.uid, patch);
      profile = { ...profile, ...patch };
    }
  }

  return { profile, isNewUser };
}

// Sign out — must not hang; callers run Firestore cleanup in parallel (non-blocking).
export const logout = async (): Promise<void> => {
  if (!isFirebaseConfigured) {
    clearDemoUser();
    return;
  }
  if (!auth) {
    console.warn('[Auth] logout skipped — auth not initialized');
    return;
  }
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('[Auth] signOut failed', e);
    throw e;
  }
};

// Create user profile in Firestore after signup
export const createUserProfile = async (firebaseUser: FirebaseUser, additionalData: Partial<UserProfile>) => {
  if (!isFirebaseConfigured) {
    // In public demo we don't use Firestore
    return {
      uid: firebaseUser.uid,
      name: additionalData.name || firebaseUser.displayName || '',
      age: additionalData.age || 25,
      gender: additionalData.gender || 'hombre',
      city: additionalData.city || '',
      country: additionalData.country || 'Chile',
      bio: additionalData.bio || '',
      photos: additionalData.photos || [],
      trainingTypes: additionalData.trainingTypes || [],
      goals: additionalData.goals || [],
      level: additionalData.level || 'Intermedio',
      intensity: additionalData.intensity || 'Moderado',
      availability: additionalData.availability || ['Tarde'],
      verificationStatus: 'unverified',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
  }

  const userRef = doc(db, 'profiles', firebaseUser.uid);
  
  const userProfile: UserProfile = {
    uid: firebaseUser.uid,
    name: additionalData.name || firebaseUser.displayName || '',
    age: additionalData.age || 25,
    gender: additionalData.gender || 'hombre',
    city: additionalData.city || '',
    country: additionalData.country || 'Chile',
    bio: additionalData.bio || '',
    photos: additionalData.photos || [],
    trainingTypes: additionalData.trainingTypes || [],
    goals: additionalData.goals || [],
    level: additionalData.level || 'Intermedio',
    intensity: additionalData.intensity || 'Moderado',
    availability: additionalData.availability || ['Tarde'],
    verificationStatus: 'unverified',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, userProfile, { merge: true });
  return userProfile;
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!isFirebaseConfigured) {
    return null; // Demo uses local state only
  }
  const userRef = doc(db, 'profiles', uid); // We use /profiles for the rich app profile
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  if (!isFirebaseConfigured) {
    // In demo mode, immediately return the demo user (or null)
    const demoUser = getDemoUser();
    // Call synchronously on next tick so React has time to subscribe
    setTimeout(() => callback(demoUser), 0);
    return () => {}; // no-op unsubscribe
  }
  return onAuthStateChanged(auth, callback);
};

// Update or create the rich user profile in Firestore (real mode)
export const updateUserProfile = async (uid: string, profileData: Partial<UserProfile>) => {
  if (!isFirebaseConfigured || !db) {
    // Demo mode - do nothing here (handled by local saveUser)
    return profileData;
  }

  const profileRef = doc(db, 'profiles', uid);
  
  const payload = {
    ...profileData,
    uid,
    updatedAt: serverTimestamp(),
  };

  await setDoc(profileRef, payload, { merge: true });
  return payload;
};

// Password recovery - uses Firebase's built-in secure flow
// Sends email with reset link (user must have created account with email+password)
export const sendPasswordReset = async (email: string) => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('La recuperación de contraseña no está disponible en el modo demo público (datos locales). En la app real (APK o closed testing) funciona con tu email registrado.');
  }
  if (!email || !email.includes('@')) {
    throw new Error('Por favor ingresa un correo electrónico válido.');
  }
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  // Firebase will send the email. We just confirm.
};
