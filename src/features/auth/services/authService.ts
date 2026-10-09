import { AuthUnavailableError, RegistrationUnavailableError } from '@/features/auth/services/authErrors'
import { createSupabaseAuthService } from '@/features/auth/services/supabaseAuthService'
import type {
  AccountProfile,
  LoginCredentials,
  RegistrationCredentials,
  RegistrationOutcome,
  SessionUser,
} from '@/features/auth/types/auth.types'
import { readAuthLink } from '@/features/auth/utils/authLink'
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
  /**
   * Envía al correo un enlace para elegir otra contraseña. Se resuelve igual exista o no una cuenta con ese
   * correo, para no delatar quién está registrado. Repetirlo envía otro enlace.
   */
  requestPasswordReset(email: string): Promise<void>
  /** Dice si la persona llegó desde ese enlace: solo entonces puede elegir otra contraseña sin escribir la anterior. */
  isRecoveringPassword(): boolean
  /**
   * Guarda la contraseña nueva de quien llegó desde el enlace y se rechaza si no se pudo. Es idempotente:
   * si llega dos veces con la misma clave, se guarda una sola vez.
   */
  changePassword(password: string, operationKey: string): Promise<void>
  /**
   * Guarda el nombre, el apellido y el teléfono de quien tiene la sesión, y se rechaza si no se pudo.
   * Guardar otra vez los mismos datos deja la cuenta igual.
   */
  updateProfile(profile: AccountProfile): Promise<void>
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
    requestPasswordReset: rejectLoginAsUnavailable,
    isRecoveringPassword: () => false,
    changePassword: rejectLoginAsUnavailable,
    updateProfile: rejectLoginAsUnavailable,
    logout: async () => {},
    onSessionChange: (listener) => {
      listener(null)

      return () => {}
    },
  }
}

/** Sin el servicio configurado en la compilación, las cuentas no están activas y los formularios lo avisan. */
export const ACCOUNTS_AVAILABLE = supabase !== null

/**
 * Con qué se abrió la página, si alguien vuelve desde un enlace de su correo. Se lee al cargar, antes de que
 * el cliente de Supabase recoja la sesión que trae el enlace y limpie la dirección.
 */
export const AUTH_LINK = readAuthLink(window.location.hash)

// Único punto donde se elige cómo se gestionan las cuentas.
export const authService: AuthService = supabase
  ? createSupabaseAuthService({
      accounts: supabase.auth,
      rememberSession: sessionVault.remember,
      // Los enlaces del correo devuelven a la portada, que Supabase siempre admite como destino; desde ahí,
      // el enrutador lleva a la página de elegir contraseña a quien venga a eso.
      returnUrl: new URL(import.meta.env.BASE_URL, window.location.origin).href,
      cameFromRecoveryLink: AUTH_LINK === 'recovery',
    })
  : createPendingAuthService()
