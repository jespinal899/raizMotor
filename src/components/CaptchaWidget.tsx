import { useEffect, useRef, useState } from 'react'
import { CAPTCHA_SITE_KEY, captchaSession } from '@/lib/captcha'
import type { CaptchaSession } from '@/lib/captcha'

/** Lo que este componente usa del API de Turnstile. */
export interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string
      language: string
      /** `interaction-only`: el widget no se ve salvo que Cloudflare pida a la persona que interactúe. */
      appearance: 'always' | 'execute' | 'interaction-only'
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
      /** Cloudflare va a mostrar la casilla: sospecha que quien está es un bot. */
      'before-interactive-callback': () => void
    },
  ): string
  reset(widgetId: string): void
  remove(widgetId: string): void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let loading: Promise<TurnstileApi> | undefined

/** Carga el API de Turnstile una sola vez, cuando el primer formulario lo necesita. */
const loadTurnstile = (): Promise<TurnstileApi> => {
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile no cargó.')))
    script.onerror = () => {
      loading = undefined
      reject(new Error('Turnstile no cargó.'))
    }
    document.head.append(script)
  })

  return loading
}

interface CaptchaWidgetProps {
  siteKey?: string | null
  session?: CaptchaSession
  load?: () => Promise<TurnstileApi>
}

/**
 * La verificación contra bots, encima del botón de enviar. No se ve ni ocupa espacio: Cloudflare comprueba en
 * segundo plano y solo muestra una casilla si sospecha que quien está es un bot. Sin clave del sitio no existe.
 * Tras cada envío se reinicia: un token no sirve dos veces.
 */
const CaptchaWidget = ({ siteKey = CAPTCHA_SITE_KEY, session = captchaSession, load = loadTurnstile }: CaptchaWidgetProps) => {
  const container = useRef<HTMLDivElement>(null)
  const [interactive, setInteractive] = useState(false)

  useEffect(() => {
    if (!siteKey || !container.current) return

    const element = container.current
    let api: TurnstileApi | undefined
    let widgetId: string | undefined
    let active = true

    load()
      .then((loaded) => {
        if (!active) return
        api = loaded
        widgetId = loaded.render(element, {
          sitekey: siteKey,
          language: 'es',
          appearance: 'interaction-only',
          callback: (token) => session.setToken(token),
          'expired-callback': () => session.setToken(null),
          'error-callback': () => session.setToken(null),
          'before-interactive-callback': () => setInteractive(true),
        })
      })
      // Si no carga, el envío lo dirá: Supabase rechazará la petición sin token.
      .catch(() => {})

    const stopListening = session.onReset(() => {
      setInteractive(false)
      if (api && widgetId) api.reset(widgetId)
    })

    return () => {
      active = false
      stopListening()
      session.setToken(null)
      if (api && widgetId) api.remove(widgetId)
    }
  }, [siteKey, session, load])

  if (!siteKey) return null

  // Turnstile deja su iframe dentro aunque no se vea, así que el contenedor nunca está vacío. Mientras no hay casilla
  // va fuera del flujo, para no sumar el espacio entre campos del formulario; no se oculta con `display: none`
  // porque la comprobación en segundo plano tiene que seguir corriendo.
  return <div ref={container} className={interactive ? undefined : 'absolute'} />
}

export default CaptchaWidget
