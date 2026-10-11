/**
 * La verificación contra bots (Cloudflare Turnstile) de los formularios de acceso. Supabase comprueba en su
 * servidor el token que deja el widget antes de iniciar sesión, registrar una cuenta o enviar el enlace para
 * elegir otra contraseña. Sin la clave del sitio en la compilación no hay widget ni token: todo funciona igual.
 */

interface CaptchaEnv {
  VITE_TURNSTILE_SITE_KEY?: string
}

/** La clave pública del widget, o `null` si la compilación no la trae. */
export const toCaptchaSiteKey = (env: CaptchaEnv): string | null => env.VITE_TURNSTILE_SITE_KEY?.trim() || null

export const CAPTCHA_SITE_KEY = toCaptchaSiteKey(import.meta.env)

/** El token del widget que está a la vista. Cada token sirve para una sola petición. */
export interface CaptchaSession {
  /** Lo deja el widget al resolverse; `null` cuando caduca o falla. */
  setToken(token: string | null): void
  /** Entrega el token y lo da por usado: el widget se reinicia para el siguiente intento. */
  takeToken(): string | null
  /** Avisa cada vez que hay que reiniciar el widget. Devuelve cómo dejar de escuchar. */
  onReset(listener: () => void): () => void
}

export const createCaptchaSession = (): CaptchaSession => {
  let token: string | null = null
  const listeners = new Set<() => void>()

  return {
    setToken: (next) => {
      token = next
    },
    takeToken: () => {
      const taken = token
      token = null
      listeners.forEach((listener) => listener())

      return taken
    },
    onReset: (listener) => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
  }
}

/** La sesión de verificación del sitio: hay un solo formulario de acceso a la vista. */
export const captchaSession = createCaptchaSession()
