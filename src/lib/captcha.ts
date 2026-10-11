/**
 * La verificación contra bots (Cloudflare Turnstile) de los formularios de acceso. Supabase comprueba en su
 * servidor el token que deja el widget antes de iniciar sesión, registrar una cuenta o enviar el enlace para
 * elegir otra contraseña. Sin la clave del sitio en la compilación no hay widget ni token: todo funciona igual.
 *
 * El widget no se ve: Cloudflare comprueba en segundo plano a quien visita y solo muestra una casilla si
 * sospecha que es un bot.
 */

interface CaptchaEnv {
  VITE_TURNSTILE_SITE_KEY?: string
}

/** La clave pública del widget, o `null` si la compilación no la trae. */
export const toCaptchaSiteKey = (env: CaptchaEnv): string | null => env.VITE_TURNSTILE_SITE_KEY?.trim() || null

export const CAPTCHA_SITE_KEY = toCaptchaSiteKey(import.meta.env)

/** Cuánto se espera, al enviar, a que termine la comprobación en segundo plano. */
export const TOKEN_WAIT_MS = 8000

/** El token del widget que está a la vista. Cada token sirve para una sola petición. */
export interface CaptchaSession {
  /** Lo deja el widget al resolverse; `null` cuando caduca o falla. */
  setToken(token: string | null): void
  /**
   * Entrega el token y lo da por usado: el widget se reinicia para el siguiente intento. Si la comprobación
   * aún no terminó, la espera hasta `waitMs`; si no llega, entrega `null`.
   */
  takeToken(waitMs?: number): Promise<string | null>
  /** Avisa cada vez que hay que reiniciar el widget. Devuelve cómo dejar de escuchar. */
  onReset(listener: () => void): () => void
}

export const createCaptchaSession = (): CaptchaSession => {
  let token: string | null = null
  const resetListeners = new Set<() => void>()
  /** Quienes esperan un token: se les entrega el primero que llegue. */
  const waiting = new Set<(token: string) => void>()

  const use = (taken: string | null) => {
    token = null
    resetListeners.forEach((listener) => listener())

    return taken
  }

  return {
    setToken: (next) => {
      token = next
      if (next === null) return

      const [first] = waiting
      if (first) {
        waiting.delete(first)
        first(next)
      }
    },

    takeToken: (waitMs = TOKEN_WAIT_MS) => {
      if (token !== null || waitMs <= 0) return Promise.resolve(use(token))

      return new Promise((resolve) => {
        const deliver = (arrived: string) => {
          clearTimeout(timer)
          resolve(use(arrived))
        }
        const timer = setTimeout(() => {
          waiting.delete(deliver)
          resolve(use(null))
        }, waitMs)
        waiting.add(deliver)
      })
    },

    onReset: (listener) => {
      resetListeners.add(listener)

      return () => {
        resetListeners.delete(listener)
      }
    },
  }
}

/** La sesión de verificación del sitio: hay un solo formulario de acceso a la vista. */
export const captchaSession = createCaptchaSession()
