import {
  EmailNotConfirmedError,
  EmailTakenError,
  GoogleAccessUnavailableError,
  InvalidCredentialsError,
  RecoveryLinkExpiredError,
  SamePasswordError,
} from '@/features/auth/services/authErrors'
import type { AuthService } from '@/features/auth/services/authService'
import type { RegistrationCredentials, RegistrationOutcome, SessionUser } from '@/features/auth/types/auth.types'
import { createOperationLog } from '@/shared/utils/operationLog'

/** Un fallo de Supabase: su `code` dice el motivo. */
type AccountsError = Error & { code?: string }

interface AccountsUser {
  email?: string
  /** Lo que se guardó de la persona al registrarse. */
  user_metadata: Record<string, unknown>
  /** Vacío cuando el correo ya tenía cuenta: Supabase no lo dice de otro modo, para no delatar quién está registrado. */
  identities?: unknown[]
}

interface AccountsSession {
  user: AccountsUser
}

/** Lo que este servicio usa del cliente de cuentas de Supabase, y nada más. */
export interface AccountsClient {
  signInWithPassword(credentials: { email: string; password: string }): Promise<{ error: AccountsError | null }>
  signUp(credentials: {
    email: string
    password: string
    options: { data: Record<string, string>; emailRedirectTo: string }
  }): Promise<{ data: { user: AccountsUser | null; session: AccountsSession | null }; error: AccountsError | null }>
  signOut(options: { scope: 'local' }): Promise<{ error: AccountsError | null }>
  resetPasswordForEmail(email: string, options: { redirectTo: string }): Promise<{ error: AccountsError | null }>
  updateUser(attributes: { password: string }): Promise<{ error: AccountsError | null }>
  onAuthStateChange(listener: (event: string, session: AccountsSession | null) => void): {
    data: { subscription: { unsubscribe(): void } }
  }
}

interface SupabaseAuthOptions {
  accounts: AccountsClient
  /** Deja dicho si la sesión que se inicie debe recordarse en este dispositivo. */
  rememberSession: (remember: boolean) => void
  /** A dónde vuelve quien abre un enlace de su correo: el de confirmar la cuenta o el de elegir otra contraseña. */
  returnUrl: string
  /** Si la página se abrió desde el enlace para elegir otra contraseña. */
  cameFromRecoveryLink: boolean
}

type Rejections = Record<string, () => Error>

/** Motivos de Supabase que la interfaz sabe explicar. Cualquier otro se entrega tal cual, como un fallo. */
const LOGIN_REJECTIONS: Rejections = {
  invalid_credentials: () => new InvalidCredentialsError(),
  email_not_confirmed: () => new EmailNotConfirmedError(),
}

const REGISTRATION_REJECTIONS: Rejections = {
  user_already_exists: () => new EmailTakenError(),
  email_exists: () => new EmailTakenError(),
}

const PASSWORD_REJECTIONS: Rejections = {
  same_password: () => new SamePasswordError(),
}

const toRejection = (error: AccountsError, known: Rejections): Error => {
  const code = error.code ?? ''

  return Object.hasOwn(known, code) ? known[code]() : error
}

const toText = (value: unknown) => (typeof value === 'string' ? value : '')

const toSessionUser = ({ email, user_metadata: profile }: AccountsUser): SessionUser => ({
  email: email ?? '',
  firstName: toText(profile.first_name),
  lastName: toText(profile.last_name),
})

/**
 * Cuentas con Supabase: sesiones con correo y contraseña, registro con confirmación por correo y un enlace
 * para elegir otra contraseña.
 */
export const createSupabaseAuthService = ({
  accounts,
  rememberSession,
  returnUrl,
  cameFromRecoveryLink,
}: SupabaseAuthOptions): AuthService => {
  // Repetir un registro o un cambio de contraseña con la misma clave no lo pide otra vez a Supabase.
  const registerOnce = createOperationLog<RegistrationOutcome>()
  const changePasswordOnce = createOperationLog<void>()

  const signUp = async ({ firstName, lastName, email, phone, password }: RegistrationCredentials) => {
    const { data, error } = await accounts.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName, phone }, emailRedirectTo: returnUrl },
    })

    if (error) throw toRejection(error, REGISTRATION_REJECTIONS)
    if (data.session) return 'signedIn'
    if (data.user?.identities?.length === 0) throw new EmailTakenError()

    return 'confirmationPending'
  }

  return {
    login: async ({ email, password, remember }) => {
      // Antes de entrar: la sesión se guarda en cuanto Supabase la entrega.
      rememberSession(remember)
      const { error } = await accounts.signInWithPassword({ email, password })

      if (error) throw toRejection(error, LOGIN_REJECTIONS)
    },

    // Falta dar de alta el sitio en Google: hasta entonces no se finge el acceso.
    loginWithGoogle: async () => {
      throw new GoogleAccessUnavailableError()
    },

    register: (credentials, operationKey) => registerOnce(operationKey, () => signUp(credentials)),

    requestPasswordReset: async (email) => {
      const { error } = await accounts.resetPasswordForEmail(email, { redirectTo: returnUrl })

      if (error) throw error
    },

    isRecoveringPassword: () => cameFromRecoveryLink,

    changePassword: (password, operationKey) =>
      changePasswordOnce(operationKey, async () => {
        // Con la sesión abierta, Supabase aceptaría el cambio de cualquiera: aquí se exige haber llegado por el enlace.
        if (!cameFromRecoveryLink) throw new RecoveryLinkExpiredError()
        const { error } = await accounts.updateUser({ password })

        if (error) throw toRejection(error, PASSWORD_REJECTIONS)
      }),

    logout: async () => {
      // Solo este dispositivo: quien cierra sesión aquí puede seguir dentro en su teléfono.
      const { error } = await accounts.signOut({ scope: 'local' })

      if (error) throw error
    },

    onSessionChange: (listener) => {
      const { data } = accounts.onAuthStateChange((_event, session) => {
        listener(session ? toSessionUser(session.user) : null)
      })

      return () => data.subscription.unsubscribe()
    },
  }
}
