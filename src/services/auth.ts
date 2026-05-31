import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
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
  gender: 'hombre' | 'mujer';
  city: string;
  country: string;
  bio: string;
  photos: string[];
  trainingTypes: string[];
  goals: string[];
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  intensity: 'Relajado' | 'Moderado' | 'Intenso';
  availability: string[];
  verificationStatus: 'unverified' | 'pending' | 'verified';
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

// Sign in with Google (disabled in public demo)
export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured) {
    throw new Error('Google Sign-In está deshabilitado en la versión pública de prueba. Usa email y contraseña.');
  }
  const provider = new GoogleAuthProvider();
  
  // Use redirect instead of popup on localhost (fixes redirect_uri_mismatch in development)
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  if (isLocalhost) {
    await signInWithRedirect(auth, provider);
    // The page will redirect, so we return null here
    return null as any;
  } else {
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  }
};

// Handle redirect result (call this on app load if using redirect method)
export const handleGoogleRedirectResult = async () => {
  if (!isFirebaseConfigured) return null;
  const { getRedirectResult } = await import('firebase/auth');
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      console.log('✅ Google redirect sign-in successful:', result.user.email);
      return result.user;
    }
    return null;
  } catch (error: any) {
    console.error('❌ Google redirect sign-in error:', error);
    // Show user-friendly message
    if (error.code === 'auth/unauthorized-domain') {
      alert('Dominio no autorizado. Por favor agrega localhost en Firebase Authentication → Settings → Authorized domains.');
    } else if (error.code === 'auth/popup-blocked' || error.code === 'auth/redirect-cancelled-by-user') {
      // Normal, user cancelled
    } else {
      alert('Error al iniciar sesión con Google: ' + (error.message || error.code));
    }
    throw error;
  }
};

// Sign out
export const logout = async () => {
  if (!isFirebaseConfigured) {
    clearDemoUser();
    return;
  }
  await signOut(auth);
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

  const userRef = doc(db, 'users', firebaseUser.uid);
  
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
  const userRef = doc(db, 'users', uid);
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
