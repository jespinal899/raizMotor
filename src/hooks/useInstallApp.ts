import { useCallback, useEffect, useState } from 'react'

/** El aviso de Chrome en Android para instalar el sitio. Aún no está en los tipos de TypeScript. */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Cómo se puede instalar en este teléfono:
 * - `prompt`: Android (y Chrome en general) ofrece su propio cuadro de «Instalar».
 * - `ios`: en el iPhone no hay cuadro; se explica cómo agregarla desde «Compartir».
 * - `null`: ya está instalada, la persona dijo «Ahora no» o el navegador no lo permite.
 */
export type InstallWay = 'prompt' | 'ios' | null

/** Quien cierra la invitación no la vuelve a ver en ese navegador. */
export const DISMISSED_KEY = 'domusraiz:instalar-app-descartado'

const isStandalone = () =>
  (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

// El iPad se presenta como un Mac, pero con pantalla táctil.
const isIos = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)

// Sin almacenamiento (modo privado, datos bloqueados) la invitación se muestra igual y se cierra solo esta vez.
const wasDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY) !== null
  } catch {
    return false
  }
}

const rememberDismissed = () => {
  try {
    localStorage.setItem(DISMISSED_KEY, new Date().toISOString())
  } catch {
    // Sin almacenamiento basta con ocultarla ahora.
  }
}

/** Si conviene invitar a instalar la aplicación en el teléfono, y cómo. */
export const useInstallApp = () => {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [hidden, setHidden] = useState(() => isStandalone() || wasDismissed())

  useEffect(() => {
    const onPrompt = (event: Event) => {
      // Sin esto Chrome muestra su propia barra; así se invita desde el diseño del sitio.
      event.preventDefault()
      setPrompt(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setHidden(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const dismiss = useCallback(() => {
    rememberDismissed()
    setHidden(true)
  }, [])

  const install = useCallback(async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    // El aviso de Chrome solo sirve una vez.
    setPrompt(null)
    if (outcome === 'dismissed') dismiss()
  }, [prompt, dismiss])

  let way: InstallWay = null
  if (!hidden) way = prompt ? 'prompt' : isIos() ? 'ios' : null

  return { way, install, dismiss }
}
