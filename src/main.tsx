import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import './styles/emVisualV2.css'
import RootApp from './RootApp.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { RootErrorBoundary } from './boot/RootErrorBoundary'
import { initCrashReporting, reportError } from './services/crashReporting'
import { ensureLocalStorageHeadroom, installStorageQuotaGuard } from './utils/safeLocalStorage'
import {
  installChunkReloadHandlers,
  isStaleChunkError,
  reloadForNewBuild,
  shouldAutoReloadForChunks,
} from './utils/chunkReload'

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

initCrashReporting()
ensureLocalStorageHeadroom()
installStorageQuotaGuard()
installChunkReloadHandlers()

let reactMounted = false

window.addEventListener('error', (event) => {
  if (isStaleChunkError(event.error || event.message)) {
    event.preventDefault()
    return
  }
  reportError(event.error || event.message, 'window.error', true)
  if (!reactMounted) {
    showFatalBootError(String(event.error?.message || event.message || 'Error de JavaScript'))
  }
})
window.addEventListener('unhandledrejection', (event) => {
  const reasonMsg =
    event.reason instanceof Error ? event.reason.message : String(event.reason ?? '')
  if (/Failed to resolve module specifier '@capacitor\//i.test(reasonMsg)) {
    event.preventDefault()
    console.warn('[boot] Capacitor plugin load failed (stale web bundle?):', event.reason)
    return
  }
  if (/PushNotifications.*not implemented on web/i.test(reasonMsg)) {
    event.preventDefault()
    return
  }
  if (isStaleChunkError(event.reason)) {
    event.preventDefault()
    if (shouldAutoReloadForChunks()) {
      reloadForNewBuild()
    } else {
      console.warn('[boot] Stale chunk error on native (no auto-reload):', event.reason)
    }
    return
  }
  reportError(event.reason, 'unhandledrejection', false)
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
          <Toaster position="top-center" richColors closeButton visibleToasts={3} />
        </ProfileProvider>
      </AuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
)
reactMounted = true
