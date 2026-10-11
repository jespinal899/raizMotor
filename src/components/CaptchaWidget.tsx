import { useEffect, useRef } from 'react'
import { CAPTCHA_SITE_KEY, captchaSession } from '@/lib/captcha'
import type { CaptchaSession } from '@/lib/captcha'

/** Lo que este componente usa del API de Turnstile. */
export interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string
      language: string
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
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
 * La casilla de verificación contra bots, encima del botón de enviar. Sin clave del sitio no se muestra.
 * Tras cada envío se reinicia: un token no sirve dos veces.
 */
const CaptchaWidget = ({ siteKey = CAPTCHA_SITE_KEY, session = captchaSession, load = loadTurnstile }: CaptchaWidgetProps) => {
  const container = useRef<HTMLDivElement>(null)

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
          callback: (token) => session.setToken(token),
          'expired-callback': () => session.setToken(null),
          'error-callback': () => session.setToken(null),
        })
      })
      // Si no carga, el envío lo dirá: Supabase rechazará la petición sin token.
      .catch(() => {})

    const stopListening = session.onReset(() => {
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

  return <div ref={container} className="min-h-[65px]" />
}

export default CaptchaWidget
