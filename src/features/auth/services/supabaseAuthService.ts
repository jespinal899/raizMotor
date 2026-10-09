import {
  EmailNotConfirmedError,
  EmailTakenError,
  GoogleAccessUnavailableError,
  InvalidCredentialsError,
} from '@/features/auth/services/authErrors'
import type { AuthService } from '@/features/auth/services/authService'
import type { RegistrationCredentials, RegistrationOutcome, SessionUser } from '@/features/auth/types/auth.types'

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
  onAuthStateChange(listener: (event: string, session: AccountsSession | null) => void): {
    data: { subscription: { unsubscribe(): void } }
  }
}

interface SupabaseAuthOptions {
  accounts: AccountsClient
  /** Deja dicho si la sesión que se inicie debe recordarse en este dispositivo. */
  rememberSession: (remember: boolean) => void
  /** A dónde lleva el enlace de confirmación que la persona recibe en su correo. */
  confirmationUrl: string
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

/** Cuentas con Supabase: sesiones con correo y contraseña, y registro con confirmación por correo. */
export const createSupabaseAuthService = ({
  accounts,
  rememberSession,
  confirmationUrl,
}: SupabaseAuthOptions): AuthService => {
  /** Registros ya pedidos, por su clave: repetir uno entrega su mismo resultado en lugar de pedirlo otra vez. */
  const registrations = new Map<string, Promise<RegistrationOutcome>>()

  const signUp = async ({ firstName, lastName, email, phone, password }: RegistrationCredentials) => {
    const { data, error } = await accounts.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName, phone }, emailRedirectTo: confirmationUrl },
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

    register: (credentials, operationKey) => {
      const requested = registrations.get(operationKey)
      if (requested) return requested

      const registration = signUp(credentials)
      registrations.set(operationKey, registration)
      // Un registro que falló no queda hecho: reintentarlo con la misma clave lo pide de nuevo.
      registration.catch(() => registrations.delete(operationKey))

      return registration
    },

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
