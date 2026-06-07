import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import RootApp from './RootApp.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { RootErrorBoundary } from './boot/RootErrorBoundary'

function showFatalBootError(message: string) {
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0D0D10;color:#fff;font-family:system-ui,sans-serif;padding:24px;text-align:center">
      <div style="max-width:320px">
        <div style="font-size:28px;margin-bottom:12px">⚠️</div>
        <p style="font-size:16px;font-weight:600;margin:0 0 8px">Error al iniciar EntrenaMatch</p>
        <p style="font-size:13px;color:#9CA3AF;margin:0 0 16px;line-height:1.5">${message.replace(/</g, '&lt;')}</p>
        <button onclick="location.reload()" style="padding:10px 20px;border-radius:16px;border:none;background:#FF671F;color:#000;font-weight:600;cursor:pointer">Recargar</button>
      </div>
    </div>`
}

window.addEventListener('error', (event) => {
  console.error('[Crashlytics] JS Global Error:', event.error || event.message, 'at', event.filename, ':', event.lineno, event.colno)
  if (!document.getElementById('root')?.innerHTML?.includes('EntrenaMatch')) {
    showFatalBootError(String(event.error?.message || event.message || 'Error de JavaScript'))
  }
})
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Crashlytics] Unhandled Promise Rejection:', event.reason)
})

const mountEl = document.getElementById('root')
if (!mountEl) {
  throw new Error('Missing #root element')
}

createRoot(mountEl).render(
  <StrictMode>
    <RootErrorBoundary>
      <AuthProvider>
        <ProfileProvider>
          <RootApp />
          <Toaster position="top-center" richColors closeButton />
        </ProfileProvider>
      </AuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
)
