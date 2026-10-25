import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { markInstalledApp } from './lib/installedApp'
import { preventIosInputZoom } from './lib/iosInputZoom'
import { registerServiceWorker } from './lib/serviceWorker'

// Antes de pintar: así las pestañas de la aplicación instalada no aparecen tarde.
markInstalledApp()
preventIosInputZoom()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

registerServiceWorker()
