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
import { auth, db } from './firebase';

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
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign in with Google
export const signInWithGoogle = async () => {
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
  const { getRedirectResult } = await import('firebase/auth');
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Google redirect error:', error);
    throw error;
  }
};

// Sign out
export const logout = async () => {
  await signOut(auth);
};

// Create user profile in Firestore after signup
export const createUserProfile = async (firebaseUser: FirebaseUser, additionalData: Partial<UserProfile>) => {
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
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
