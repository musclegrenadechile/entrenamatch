import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_VERSION } from '../../constants'; // use centralized version (no more stale 0.1.37)
import { markQuickDemoSession } from '../../utils/quickDemo';
import entrenamatchLogo from '../../assets/brand/entrenamatch-logo.png';

interface AuthScreenProps {
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  authEmail: string;
  setAuthEmail: (email: string) => void;
  authPassword: string;
  setAuthPassword: (password: string) => void;
  authLoading: boolean;
  authError: string;
  handleEmailAuth: (isRegister: boolean) => void;
  handleGoogleAuth?: () => void;
  googleAuthEnabled?: boolean;
  handleForgotPassword?: (email: string) => void;
  isDemoMode: boolean;
  triggerHaptic?: (style?: 'light' | 'medium' | 'heavy' | 'success') => void;
  onQuickDemo?: () => void;
}

export const AuthScreen = ({
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
  googleAuthEnabled = false,
  handleForgotPassword,
  isDemoMode,
  triggerHaptic = () => {},
  onQuickDemo,
}: AuthScreenProps) => {
  const handleTab = (mode: 'login' | 'register') => {
    triggerHaptic('light');
    setAuthMode(mode);
  };

  const handlePrimary = () => {
    triggerHaptic('medium');
    handleEmailAuth(authMode === 'register');
  };

  const handleDemo = () => {
    triggerHaptic('success');
    if (onQuickDemo) {
      onQuickDemo();
      return;
    }
    try {
      markQuickDemoSession();
      (window as any).__ENTRENAMATCH_QUICK_DEMO__ = true;
    } catch {}
    window.location.reload();
  };

  return (
    <div className="auth-screen min-h-screen flex items-center justify-center p-5 relative">
      {/* Cinematic background: subtle constellation of people training right now + hero glow */}
      <div className="auth-live-constellation">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#22c55e]"
            style={{
              left: `${12 + ((i * 11) % 76)}%`,
              top: `${18 + ((i * 17) % 62)}%`,
            }}
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.15, 0.55, 0.15],
            }}
            transition={{
              duration: 2.8 + (i % 3) * 0.4,
              repeat: Infinity,
              delay: i * 0.18,
            }}
          />
        ))}
      </div>
      <div className="auth-hero-glow" />

      <div className="relative z-10 w-full max-w-[380px]">
        {/* Top exclusive badge - makes you feel you're entering something special */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[1px] bg-white/5 text-[#FF671F] border border-[#FF671F]/30 px-4 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
            Piloto cerrado · Viña del Mar y Santiago
          </div>
        </div>

        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 140, damping: 18, delay: 0.05 }}
            className="mb-4"
          >
            <img
              src={entrenamatchLogo}
              alt="EntrenaMatch"
              className="w-full max-w-[300px] h-auto mx-auto drop-shadow-[0_12px_40px_rgba(255,103,31,0.25)]"
              width={600}
              height={338}
              decoding="async"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="text-xl font-black tracking-tight text-white"
          >
            Tu equipo de gym en vivo
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-[#9CA3AF] text-[15px] leading-relaxed max-w-[320px] mx-auto"
          >
            Encuentra quién entrena cerca, haz match con tu GymPartner y sincroniza sesiones con{' '}
            <span className="text-white font-semibold">EntrenaSync</span>.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="mt-3 flex flex-wrap justify-center gap-2 text-[10px] text-[#d1d5db]"
          >
            <li className="px-2.5 py-1 rounded-full bg-[#1C1C20] border border-[#2F2F35]">🗺️ Mapa LIVE</li>
            <li className="px-2.5 py-1 rounded-full bg-[#1C1C20] border border-[#2F2F35]">❤️ Matches</li>
            <li className="px-2.5 py-1 rounded-full bg-[#1C1C20] border border-[#2F2F35]">💬 Chat + sync</li>
          </motion.ul>
        </div>

        {/* The beautiful "portal" card */}
        <div className="auth-card rounded-3xl p-6">
          {/* Premium tabs — cuenta real vs registro */}
          <div className="flex mb-2 bg-[#161618] rounded-2xl p-1">
            <button
              onClick={() => handleTab('login')}
              className={`auth-tab flex-1 py-2.5 rounded-[14px] text-sm font-semibold ${authMode === 'login' ? 'active text-white' : 'text-[#9CA3AF] hover:text-white/70'}`}
            >
              Cuenta real
            </button>
            <button
              onClick={() => handleTab('register')}
              className={`auth-tab flex-1 py-2.5 rounded-[14px] text-sm font-semibold ${authMode === 'register' ? 'active text-white' : 'text-[#9CA3AF] hover:text-white/70'}`}
            >
              Crear cuenta
            </button>
          </div>
          <p className="text-[10px] text-[#6B7280] mb-4 leading-snug text-center">
            {authMode === 'register'
              ? 'Cuenta real: guarda tu perfil, matches y EntrenaSync en la nube.'
              : 'Inicia sesión con email o Google para sincronizar en todos tus dispositivos.'}
          </p>

          <AnimatePresence>
            {authError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 text-red-400 p-3 rounded-2xl text-sm mb-4"
              >
                {authError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3.5">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="auth-input w-full rounded-2xl px-5 py-3.5 text-sm placeholder:text-[#6B7280]"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className="auth-input w-full rounded-2xl px-5 py-3.5 text-sm placeholder:text-[#6B7280]"
            />

            {/* The big "open the doors" button */}
            <motion.button
              whileTap={{ scale: 0.985 }}
              onClick={handlePrimary}
              disabled={authLoading}
              className="auth-primary-btn w-full py-[17px] rounded-2xl text-base disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {authLoading ? (
                'Entrando...'
              ) : (
                authMode === 'register' ? 'Abrir mi cuenta y entrar' : 'Entrar a EntrenaMatch'
              )}
            </motion.button>

            <div className="text-center">
              <button
                type="button"
                disabled={authLoading}
                onClick={() => {
                  triggerHaptic('light');
                  if (handleForgotPassword) {
                    // Use the email the user has already typed (best UX)
                    handleForgotPassword(authEmail);
                  } else if (isDemoMode) {
                    toast.info('En la versión de prueba los datos son locales al navegador.', {
                      description: 'Recuperación real solo funciona en la app nativa (Android) con cuentas reales de Firebase.',
                      action: {
                        label: 'Borrar datos y reiniciar',
                        onClick: () => { localStorage.clear(); window.location.reload(); }
                      }
                    });
                  } else {
                    toast('Función de recuperación no disponible.');
                  }
                }}
                className="text-xs text-[#9CA3AF] hover:text-[#FF671F] underline transition disabled:opacity-50"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#1C1C20] px-3 text-[11px] text-[#6B7280]">o</span>
              </div>
            </div>

            {/* Google Sign-In — web (GH Pages) + APK nativa */}
            <button
              type="button"
              disabled={authLoading || !googleAuthEnabled}
              onClick={() => {
                triggerHaptic('light');
                handleGoogleAuth?.();
              }}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 border rounded-2xl text-sm font-medium transition active:scale-[0.985] ${
                googleAuthEnabled
                  ? 'border-white/15 bg-white text-[#1f1f1f] hover:bg-white/95 shadow-sm'
                  : 'border-white/10 bg-white/5 text-white/50 cursor-not-allowed'
              }`}
              title={
                googleAuthEnabled
                  ? 'Iniciar sesión con tu cuenta Google'
                  : 'Google Sign-In disponible con Firebase configurado'
              }
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-5.522 0-10-4.478-10-10s4.478-10 10-10c2.837 0 5.402 1.192 7.207 3.093l5.657-5.657C34.046 10.053 29.268 8 24 8 12.955 8 4 16.955 4 28s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c5.268 0 9.868 2.683 12.542 6.762l-6.571-5.035C28.401 12.088 26.337 11 24 11c-5.223 0-9.637 3.317-11.283 7.946z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C7.718 39.614 15.366 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.653-.389-3.917z"/>
              </svg>
              <span>{authLoading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
            </button>

            {/* Modo prueba — datos locales, sin sync ni chat real entre dispositivos */}
            <button
              onClick={handleDemo}
              className="auth-demo-btn w-full flex flex-col items-center justify-center gap-0.5 py-3.5 border rounded-2xl text-sm font-semibold active:scale-[0.985]"
            >
              <span>⚡ Modo prueba (solo este dispositivo)</span>
              <span className="text-[10px] font-normal text-[#9CA3AF]">
                Explora mapa y perfiles de ejemplo · EntrenaSync no sincroniza con otros
              </span>
            </button>
          </div>
        </div>

        {/* Trust + legal — elegant and minimal */}
        <p className="text-center text-[10px] text-[#6B7280] mt-6 leading-snug">
          Al entrar aceptas nuestros{' '}
          <a href="/entrenamatch/terms.html" target="_blank" className="underline hover:text-[#FF671F]">Términos</a>{' '}
          y{' '}
          <a href="/entrenamatch/privacy.html" target="_blank" className="underline hover:text-[#FF671F]">Política de Privacidad</a>.
          <br />Solo +18 • Entrenamiento serio • Pre-alpha real
        </p>

        <p className="text-center text-[10px] text-[#6B7280]/60 mt-1 tracking-wider">v{APP_VERSION}</p>
      </div>
    </div>
  );
};

