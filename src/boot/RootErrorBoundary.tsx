import { Component, type ReactNode } from 'react';
import { APP_VERSION } from '../constants';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class RootErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Error desconocido' };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('[EntrenaMatch] Root crash:', error, info);
    try {
      (window as any).__ENTRENAMATCH_LAST_CRASH__ = {
        message: error.message,
        stack: error.stack,
        at: Date.now(),
      };
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100svh] flex items-center justify-center bg-[#0D0D10] text-white p-6">
          <div className="text-center max-w-sm">
            <div className="text-2xl mb-3">⚠️</div>
            <h1 className="text-lg font-bold mb-2">No se pudo abrir EntrenaMatch</h1>
            <p className="text-sm text-[#9CA3AF] mb-2 leading-relaxed">
              {this.state.message || 'Error al cargar la aplicación en este dispositivo.'}
            </p>
            <p className="text-[10px] text-[#6B7280] mb-5">v{APP_VERSION}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-2xl bg-[#FF671F] text-black font-semibold text-sm"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
