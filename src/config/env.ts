/** Dónde está el servicio de cuentas y datos (Supabase) y con qué clave se le habla desde el navegador. */
export interface BackendConfig {
  url: string
  /**
   * La clave «publishable» del proyecto (o su antigua «anon»): es pública por diseño y viaja en el sitio.
   * La clave «secret» o «service_role» nunca va aquí: quien la tenga se salta todos los permisos.
   */
  publicKey: string
}

interface BackendEnv {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_PUBLISHABLE_KEY?: string
}

const isUrl = (value: string) => {
  try {
    return Boolean(new URL(value))
  } catch {
    return false
  }
}

/**
 * Lo que la compilación sabe del servicio. Si falta algún dato devuelve `null`: el sitio arranca igual
 * y lo que dependa del servicio avisa de que aún no está disponible.
 */
export const toBackendConfig = (env: BackendEnv): BackendConfig | null => {
  const url = env.VITE_SUPABASE_URL?.trim() ?? ''
  const publicKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? ''

  return isUrl(url) && publicKey ? { url, publicKey } : null
}

export const BACKEND_CONFIG = toBackendConfig(import.meta.env)
