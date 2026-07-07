import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Register service worker for PWA. Also poll for updates every hour so a
// long-lived tab picks up a new deploy without the user having to hard-refresh.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')

      // If a new SW is already waiting the next reload will pick it up,
      // but tell it to activate now so this tab gets the fresh app too.
      const activateWaiting = () => reg.waiting?.postMessage('SKIP_WAITING')
      if (reg.waiting) activateWaiting()

      reg.addEventListener('updatefound', () => {
        const installing = reg.installing
        if (!installing) return
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            activateWaiting()
          }
        })
      })

      // When a new SW takes control, reload once so the user sees the new UI.
      let reloaded = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return
        reloaded = true
        window.location.reload()
      })

      // Periodic update check so a tab left open for hours still catches
      // deploys instead of waiting for a manual navigation.
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000)
    } catch { /* SW unsupported or blocked — the app still works */ }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
