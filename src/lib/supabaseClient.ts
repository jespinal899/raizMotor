import { createClient } from '@supabase/supabase-js'
import { BACKEND_CONFIG } from '@/config/env'
import { createSessionVault } from '@/lib/sessionVault'

/** Guarda la sesión donde la persona eligió al entrar: recordada en este dispositivo o solo en esta pestaña. */
export const sessionVault = createSessionVault(localStorage, sessionStorage)

/** `null` mientras la compilación no conozca el servicio: el sitio funciona igual, sin cuentas. */
export const supabase = BACKEND_CONFIG
  ? createClient(BACKEND_CONFIG.url, BACKEND_CONFIG.publicKey, { auth: { storage: sessionVault } })
  : null
