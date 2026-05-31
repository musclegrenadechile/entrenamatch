import React from 'react';
import { toast } from 'sonner';
import { Dumbbell } from 'lucide-react';

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
  isDemoMode: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  authMode,
  setAuthMode,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authLoading,
  authError,
  handleEmailAuth,
  isDemoMode,
}) => {
  return (
    <div className="app-container flex items-center justify-center bg-[#0a0b0f] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#14b8a6] flex items-center justify-center">
              <Dumbbell className="w-9 h-9 text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter">EntrenaMatch</h1>
          <p className="text-[#94a3b8] mt-2">El match del movimiento</p>
        </div>

        <div className="card rounded-3xl p-6">
          <div className="flex mb-6 bg-[#121418] rounded-2xl p-1">
            <button 
              onClick={() => { setAuthMode('login'); /* clear error if needed */ }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${authMode === 'login' ? 'bg-[#1f242b]' : ''}`}
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => { setAuthMode('register'); /* clear error */ }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${authMode === 'register' ? 'bg-[#1f242b]' : ''}`}
            >
              Crear Cuenta
            </button>
          </div>

          {authError && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-2xl text-sm mb-4">
              {authError}
            </div>
          )}

          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="w-full bg-[#121418] border border-[#272b33] rounded-2xl px-5 py-3.5 text-sm"
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className="w-full bg-[#121418] border border-[#272b33] rounded-2xl px-5 py-3.5 text-sm"
            />

            <button 
              onClick={() => handleEmailAuth(authMode === 'register')}
              disabled={authLoading}
              className="btn-primary w-full disabled:opacity-60"
            >
              {authLoading ? 'Cargando...' : (authMode === 'register' ? 'Crear cuenta' : 'Iniciar sesión')}
            </button>

            <div className="text-center -mt-1">
              <button
                type="button"
                onClick={() => {
                  if (isDemoMode) {
                    toast.info('En la versión de prueba los datos son locales al navegador.', {
                      description: 'No hay recuperación real de contraseña. Puedes borrar todo y empezar de cero.',
                      action: {
                        label: 'Borrar datos y reiniciar',
                        onClick: () => {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }
                    });
                  } else {
                    toast('La recuperación de contraseña estará disponible cuando conectemos Firebase real (Fase 1).');
                  }
                }}
                className="text-xs text-[#64748b] hover:text-[#14b8a6] underline transition"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#272b33]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0a0b0f] px-3 text-[#64748b]">o</span>
              </div>
            </div>

            <button 
              disabled
              className="w-full flex items-center justify-center gap-3 py-3.5 border border-[#272b33] rounded-2xl text-sm font-medium bg-[#121418] opacity-50 cursor-not-allowed"
              title="Google Sign-In temporalmente deshabilitado para pruebas públicas"
            >
              <span>Continuar con Google (deshabilitado en demo público)</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#64748b] mt-6">
          Al continuar aceptas nuestros Términos y Política de Privacidad
        </p>
      </div>
    </div>
  );
};

