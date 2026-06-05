import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'

// Basic global error handlers so JS crashes/unhandled rejections are visible in logcat.
// With Firebase Crashlytics enabled on native (Android), these will help surface in the Crashlytics dashboard
// (native WebView errors often get captured; for richer JS reporting consider adding @capacitor-community/firebase-crashlytics later).
window.addEventListener('error', (event) => {
  console.error('[Crashlytics] JS Global Error:', event.error || event.message, 'at', event.filename, ':', event.lineno, event.colno)
})
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Crashlytics] Unhandled Promise Rejection:', event.reason)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="top-center" richColors closeButton />
    </AuthProvider>
  </StrictMode>,
)
