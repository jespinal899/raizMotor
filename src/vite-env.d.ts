/// <reference types="vite/client" />

/** Variables que la compilación recibe del entorno. Sin ellas el sitio funciona, pero sin cuentas. */
interface ImportMetaEnv {
  /** Dirección del proyecto de Supabase. */
  readonly VITE_SUPABASE_URL?: string
  /** Clave «publishable» (o la antigua «anon») del proyecto: la pública, nunca la «secret». */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
}
