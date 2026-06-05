import { toast } from 'sonner';
import { Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  handleForgotPassword?: (email: string) => void;
  isDemoMode: boolean;
  triggerHaptic?: (style?: 'light' | 'medium' | 'heavy' | 'success') => void;
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
  handleForgotPassword,
  isDemoMode,
  triggerHaptic = () => {},
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
    try {
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
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[1.5px] bg-white/5 text-[#FF671F] border border-[#FF671F]/30 px-4 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#FF671F] rounded-full animate-pulse" />
            ACCESO EXCLUSIVO • EL RITUAL COMIENZA AQUÍ
          </div>
        </div>

        {/* Hero — the "opening something never seen before" moment */}
        <div className="text-center mb-7">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 140, damping: 18, delay: 0.05 }}
            className="flex justify-center mb-5"
          >
            <div className="relative">
              {/* Main logo orb — feels like an energy core / arena entrance */}
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 0 8px rgba(255,103,31,0.1), 0 0 0 18px rgba(255,103,31,0.04)',
                    '0 0 0 14px rgba(255,103,31,0.18), 0 0 0 32px rgba(255,103,31,0.06)',
                    '0 0 0 8px rgba(255,103,31,0.1), 0 0 0 18px rgba(255,103,31,0.04)'
                  ] 
                }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF671F] via-[#FF4F79] to-[#FF671F] flex items-center justify-center shadow-2xl"
              >
                <Dumbbell className="w-10 h-10 text-black drop-shadow" />
              </motion.div>

              {/* Subtle flowing tether hint (the unique thing nobody has seen) */}
              <div className="auth-tether-preview" />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="text-[46px] leading-[0.92] font-black tracking-[-3.2px] text-white"
          >
            ENTRENAMATCH
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            className="mt-1.5 text-2xl font-semibold tracking-[-0.6px] bg-gradient-to-r from-[#FF671F] to-[#FF4F79] bg-clip-text text-transparent"
          >
            Estamos inventando cómo dos personas entrenan como una sola.
          </motion.p>

          <motion.p 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="mt-2 text-[#9CA3AF] text-[15px] leading-snug max-w-[280px] mx-auto"
          >
            Entra y siente a tu compañero entrenando<br />exactamente al mismo tiempo que tú.<br />
            <span className="text-[#FF671F]/80 text-xs tracking-widest">ESTO NO EXISTÍA HASTA AHORA.</span>
          </motion.p>
        </div>

        {/* Live people teaser — makes the app feel alive the second you open it */}
        <div className="flex justify-center gap-2 mb-5 text-[12px]">
          <div className="flex items-center gap-1.5 bg-[#1C1C20]/70 border border-white/10 px-3 py-1 rounded-2xl">
            <div className="live-dot w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span className="font-medium text-[#22c55e]">142</span>
            <span className="text-[#9CA3AF]">entrenando en vivo ahora</span>
          </div>
        </div>

        {/* The beautiful "portal" card */}
        <div className="auth-card rounded-3xl p-6">
          {/* Premium tabs */}
          <div className="flex mb-5 bg-[#161618] rounded-2xl p-1">
            <button
              onClick={() => handleTab('login')}
              className={`auth-tab flex-1 py-2.5 rounded-[14px] text-sm font-semibold ${authMode === 'login' ? 'active text-white' : 'text-[#9CA3AF] hover:text-white/70'}`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => handleTab('register')}
              className={`auth-tab flex-1 py-2.5 rounded-[14px] text-sm font-semibold ${authMode === 'register' ? 'active text-white' : 'text-[#9CA3AF] hover:text-white/70'}`}
            >
              Crear cuenta
            </button>
          </div>

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
                'Abriendo el ritual...'
              ) : (
                authMode === 'register' ? 'Abrir mi cuenta y entrar' : 'Entrar al ritual'
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

            {/* Google — styled nicely even if disabled (feels premium) */}
            <button
              disabled
              className="w-full flex items-center justify-center gap-2.5 py-3.5 border border-white/10 rounded-2xl text-sm font-medium bg-white/5 text-white/70 cursor-not-allowed active:bg-white/10"
              title="Google Sign-In disponible en la app nativa (Play Store)"
            >
              <span className="text-base">G</span>
              <span>Continuar con Google</span>
              <span className="text-[10px] text-[#9CA3AF]/60">(en la app)</span>
            </button>

            {/* The exciting "feel it now" demo entry — this is the "never seen before" hook */}
            <button
              onClick={handleDemo}
              className="auth-demo-btn w-full flex items-center justify-center gap-2 py-3.5 border rounded-2xl text-sm font-semibold active:scale-[0.985]"
            >
              ⚡ Quiero sentir el ritual ahora (demo sin cuenta)
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

        <p className="text-center text-[10px] text-[#6B7280]/60 mt-1 tracking-wider">v0.1.35-achievements-chats</p>
      </div>
    </div>
  );
};

