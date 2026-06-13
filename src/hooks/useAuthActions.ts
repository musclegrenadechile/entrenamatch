import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import {
  signUpWithEmail,
  signInWithEmail,
  sendPasswordReset,
  signInWithGoogle,
  completeGoogleSignInProfile,
} from '../services/auth';
import { GoogleAuthError } from '../services/googleAuth';
import { isFirebaseConfigured } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { useDemoAuth } from './useDemoAuth';
import { demoStorage, DEMO_KEYS } from '../services/demoStorage';

export function useAuthActions() {
  const { isDemoMode } = useAuth();
  const { saveUser, setShowOnboarding } = useProfile();
  const { signInDemo, signUpDemo } = useDemoAuth();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const lastSuccessfulAuthRef = useRef<unknown>(null);

  const markAuthSuccess = useCallback((user: unknown) => {
    lastSuccessfulAuthRef.current = user;
    try {
      sessionStorage.setItem('entrenamatch_auth_ok', '1');
    } catch {}
  }, []);

  const handleGoogleAuth = useCallback(async () => {
    if (isDemoMode || !isFirebaseConfigured) {
      setAuthError('Google Sign-In requiere Firebase real. Usa email/contraseña en demo.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    try {
      const result = await signInWithGoogle();

      if (result.mode === 'redirect') {
        toast('Redirigiendo a Google…', { description: 'Vuelves a EntrenaMatch al terminar.' });
        return;
      }

      const { profile, isNewUser } = await completeGoogleSignInProfile(result.user);
      markAuthSuccess(result.user);
      toast.success('Sesión iniciada con Google');

      if (profile) {
        saveUser({ ...profile, id: 'me' } as any);
      } else {
        saveUser({
          id: 'me' as any,
          name: result.user.displayName || '',
          age: 25,
          gender: 'hombre' as const,
          city: '',
          country: 'Chile',
          bio: '',
          photos: result.user.photoURL ? [result.user.photoURL] : [],
          trainingTypes: [],
          goals: [],
          level: 'Intermedio' as const,
          intensity: 'Moderado' as const,
          availability: ['Tarde'],
        } as any);
      }

      if (isNewUser) {
        setShowOnboarding(true);
      }
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof GoogleAuthError) {
        setAuthError(error.message);
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          toast.error(error.message);
        }
      } else {
        setAuthError('No se pudo iniciar sesión con Google');
        toast.error('No se pudo iniciar sesión con Google');
      }
    } finally {
      setAuthLoading(false);
    }
  }, [isDemoMode, markAuthSuccess, saveUser, setShowOnboarding]);

  const handleEmailAuth = useCallback(
    async (isRegister: boolean) => {
      if (!authEmail || !authPassword) {
        setAuthError('Por favor completa email y contraseña');
        return;
      }

      setAuthLoading(true);
      setAuthError('');

      let loggedInUser: { uid: string } | true | null = null;

      try {
        if (isDemoMode) {
          if (isRegister) {
            await signUpDemo(authEmail);
            toast.success('Cuenta creada exitosamente');
          } else {
            await signInDemo(authEmail);
            toast.success('Sesión iniciada');
          }
          loggedInUser = true;
          markAuthSuccess(true);
        } else if (isRegister) {
          const fbUser = await signUpWithEmail(authEmail, authPassword);
          toast.success('Cuenta creada exitosamente');
          loggedInUser = fbUser;
          markAuthSuccess(fbUser);
        } else {
          const fbUser = await signInWithEmail(authEmail, authPassword);
          toast.success('Sesión iniciada');
          loggedInUser = fbUser;
          markAuthSuccess(fbUser);
        }
      } catch (error: any) {
        console.error(error);
        if (error.code === 'auth/email-already-in-use') {
          setAuthMode('login');
          setAuthEmail(authEmail);
          setAuthError('Este email ya está registrado. Inicia sesión con tu contraseña.');
        } else if (
          error.code === 'auth/invalid-credential' ||
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password'
        ) {
          setAuthError('Email o contraseña incorrectos. ¿Estás seguro que creaste la cuenta?');
        } else if (error.code === 'auth/invalid-email') {
          setAuthError('El formato del email no es válido.');
        } else if (error.code === 'auth/weak-password') {
          setAuthError('La contraseña es muy débil (mínimo 6 caracteres).');
        } else if (error.message) {
          setAuthError(error.message);
        } else {
          setAuthError('Error en la autenticación');
        }
      } finally {
        setAuthLoading(false);

        if (!isDemoMode && loggedInUser && loggedInUser !== true && isRegister) {
          setShowOnboarding(true);
        } else if (isDemoMode && loggedInUser) {
          const hasLocalProfile = demoStorage.get(DEMO_KEYS.PROFILE);
          if (!hasLocalProfile) {
            setShowOnboarding(true);
          }
        }
      }
    },
    [
      authEmail,
      authPassword,
      isDemoMode,
      markAuthSuccess,
      saveUser,
      setShowOnboarding,
      signInDemo,
      signUpDemo,
    ]
  );

  const handleForgotPassword = useCallback(
    async (email: string) => {
      if (!email || !email.includes('@')) {
        setAuthError('Ingresa un correo electrónico válido para recuperar tu contraseña');
        return;
      }

      setAuthLoading(true);
      setAuthError('');

      try {
        await sendPasswordReset(email);
        toast.success('¡Email de recuperación enviado!', {
          description: `Revisa tu bandeja en ${email} (incluyendo carpeta de spam). El enlace expira en 1 hora.`,
        });
        if (authMode === 'register') {
          setAuthMode('login');
        }
      } catch (error: any) {
        console.error('Password reset failed', error);
        let friendly = 'No pudimos enviar el correo de recuperación en este momento.';
        if (error.message) {
          friendly = error.message;
        } else if (error.code === 'auth/user-not-found') {
          friendly = 'No hay ninguna cuenta registrada con ese correo electrónico.';
        } else if (error.code === 'auth/too-many-requests') {
          friendly = 'Demasiados intentos. Espera unos minutos antes de volver a intentar.';
        }
        setAuthError(friendly);
        toast.error(friendly);
      } finally {
        setAuthLoading(false);
      }
    },
    [authMode]
  );

  return {
    authMode,
    setAuthMode,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authLoading,
    authError,
    handleEmailAuth,
    handleGoogleAuth,
    handleForgotPassword,
    lastSuccessfulAuthRef,
  };
}
