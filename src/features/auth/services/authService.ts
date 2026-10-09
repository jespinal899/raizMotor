import { AuthUnavailableError, RegistrationUnavailableError } from '@/features/auth/services/authErrors'
import { createSupabaseAuthService } from '@/features/auth/services/supabaseAuthService'
import type {
  LoginCredentials,
  RegistrationCredentials,
  RegistrationOutcome,
  SessionUser,
} from '@/features/auth/types/auth.types'
import { sessionVault, supabase } from '@/lib/supabaseClient'

export interface AuthService {
  /** Se resuelve cuando la sesión queda iniciada y se rechaza si no se pudo entrar. Repetirlo deja la misma sesión. */
  login(credentials: LoginCredentials): Promise<void>
  /** Inicia sesión con la cuenta de Google de la persona; se resuelve y se rechaza igual que `login`. */
  loginWithGoogle(): Promise<void>
  /**
   * Se resuelve cuando la cuenta queda creada, diciendo si la persona ya está dentro o debe confirmar su
   * correo, y se rechaza si no se pudo registrar. Es idempotente: si llega dos veces con la misma clave,
   * por un reintento o un doble envío, se crea una sola cuenta.
   */
  register(credentials: RegistrationCredentials, operationKey: string): Promise<RegistrationOutcome>
  /** Cierra la sesión en este dispositivo y se rechaza si no se pudo. Repetirlo sin sesión no hace nada. */
  logout(): Promise<void>
  /**
   * Avisa de quién tiene la sesión abierta —`null` si nadie— al empezar a escuchar y cada vez que cambie.
   * Devuelve cómo dejar de escuchar.
   */
  onSessionChange(listener: (user: SessionUser | null) => void): () => void
}

/** Implementación provisional mientras no exista el servicio de cuentas: nunca finge una sesión o un registro. */
export const createPendingAuthService = (): AuthService => {
  const rejectLoginAsUnavailable = async () => {
    throw new AuthUnavailableError()
  }
  const rejectRegistrationAsUnavailable = async () => {
    throw new RegistrationUnavailableError()
  }

  return {
    login: rejectLoginAsUnavailable,
    loginWithGoogle: rejectLoginAsUnavailable,
    register: rejectRegistrationAsUnavailable,
    logout: async () => {},
    onSessionChange: (listener) => {
      listener(null)

      return () => {}
    },
  }
}

/** Sin el servicio configurado en la compilación, las cuentas no están activas y los formularios lo avisan. */
export const ACCOUNTS_AVAILABLE = supabase !== null

// Único punto donde se elige cómo se gestionan las cuentas.
export const authService: AuthService = supabase
  ? createSupabaseAuthService({
      accounts: supabase.auth,
      rememberSession: sessionVault.remember,
      // El enlace de confirmación devuelve a la portada del sitio, ya con la sesión iniciada.
      confirmationUrl: new URL(import.meta.env.BASE_URL, window.location.origin).href,
    })
  : createPendingAuthService()
