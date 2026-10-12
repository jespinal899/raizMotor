import {
  CaptchaFailedError,
  CodeRequestTooSoonError,
  EmailNotConfirmedError,
  EmailTakenError,
  GoogleAccessUnavailableError,
  InvalidCodeError,
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

/** El token de la verificación contra bots, cuando la hay. */
interface CaptchaOptions {
  captchaToken?: string
}

/** La verificación contra bots que acompaña a iniciar sesión, registrarse y pedir el enlace de recuperación. */
export interface CaptchaCheck {
  /** Si el sitio la exige: sin token no se pregunta a Supabase, que lo rechazaría. */
  required: boolean
  /** El token del widget, que queda usado. Si la comprobación aún no terminó, lo espera un momento. */
  takeToken(): Promise<string | null>
}

/** Lo que este servicio usa del cliente de cuentas de Supabase, y nada más. */
export interface AccountsClient {
  signInWithPassword(credentials: {
    email: string
    password: string
    options?: CaptchaOptions
  }): Promise<{ error: AccountsError | null }>
  signUp(credentials: {
    email: string
    password: string
    options: { data: Record<string, string>; emailRedirectTo: string } & CaptchaOptions
  }): Promise<{ data: { user: AccountsUser | null; session: AccountsSession | null }; error: AccountsError | null }>
  signOut(options: { scope: 'local' }): Promise<{ error: AccountsError | null }>
  resetPasswordForEmail(
    email: string,
    options: { redirectTo: string } & CaptchaOptions,
  ): Promise<{ error: AccountsError | null }>
  /** Comprueba un código enviado al correo: `email` confirma la cuenta y `recovery` abre la sesión para cambiar la contraseña. */
  verifyOtp(params: {
    email: string
    token: string
    type: 'email' | 'recovery'
  }): Promise<{ error: AccountsError | null }>
  /** Envía otra vez el código para confirmar la cuenta. */
  resend(params: {
    type: 'signup'
    email: string
    options: { emailRedirectTo: string } & CaptchaOptions
  }): Promise<{ error: AccountsError | null }>
  updateUser(attributes: { password?: string; data?: Record<string, string> }): Promise<{ error: AccountsError | null }>
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
  /** Sin ella, no se envía ningún token. */
  captcha?: CaptchaCheck
}

type Rejections = Record<string, () => Error>

/** Motivos de Supabase que la interfaz sabe explicar. Cualquier otro se entrega tal cual, como un fallo. */
const CAPTCHA_REJECTIONS: Rejections = {
  captcha_failed: () => new CaptchaFailedError(),
}

const LOGIN_REJECTIONS: Rejections = {
  ...CAPTCHA_REJECTIONS,
  invalid_credentials: () => new InvalidCredentialsError(),
  email_not_confirmed: () => new EmailNotConfirmedError(),
}

const REGISTRATION_REJECTIONS: Rejections = {
  ...CAPTCHA_REJECTIONS,
  user_already_exists: () => new EmailTakenError(),
  email_exists: () => new EmailTakenError(),
}

const PASSWORD_REJECTIONS: Rejections = {
  same_password: () => new SamePasswordError(),
}

/** Supabase usa el mismo motivo para un código equivocado, ya usado o vencido. */
const CODE_REJECTIONS: Rejections = {
  ...CAPTCHA_REJECTIONS,
  otp_expired: () => new InvalidCodeError(),
}

const RESEND_REJECTIONS: Rejections = {
  ...CAPTCHA_REJECTIONS,
  over_email_send_rate_limit: () => new CodeRequestTooSoonError(),
  over_request_rate_limit: () => new CodeRequestTooSoonError(),
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
  phone: toText(profile.phone),
})

/**
 * Cuentas con Supabase: sesiones con correo y contraseña, y un código de 6 dígitos enviado al correo para
 * confirmar la cuenta al registrarse y para elegir otra contraseña. Supabase genera los códigos, los vence y
 * limita los intentos.
 */
export const createSupabaseAuthService = ({
  accounts,
  rememberSession,
  returnUrl,
  cameFromRecoveryLink,
  captcha,
}: SupabaseAuthOptions): AuthService => {
  // Repetir un registro o un cambio de contraseña con la misma clave no lo pide otra vez a Supabase.
  const registerOnce = createOperationLog<RegistrationOutcome>()
  const changePasswordOnce = createOperationLog<void>()
  /**
   * Si en esta página ya se comprobó un código de recuperación. El código solo sirve una vez y abre la sesión:
   * desde ahí se puede elegir la contraseña, y reintentarlo (por ejemplo, si era la misma de antes) no lo gasta otra vez.
   */
  let recoveryCodeVerified = false

  /** El token de la verificación, si la hay. Sin él, cuando el sitio la exige, no se pregunta a Supabase. */
  const captchaOptions = async (): Promise<CaptchaOptions> => {
    const captchaToken = captcha ? await captcha.takeToken() : null
    if (captcha?.required && !captchaToken) throw new CaptchaFailedError()

    return captchaToken ? { captchaToken } : {}
  }

  const signUp = async ({ firstName, lastName, email, phone, password }: RegistrationCredentials) => {
    const { data, error } = await accounts.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, phone },
        emailRedirectTo: returnUrl,
        ...(await captchaOptions()),
      },
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
      const options = await captchaOptions()
      const { error } = await accounts.signInWithPassword(
        options.captchaToken ? { email, password, options } : { email, password },
      )

      if (error) throw toRejection(error, LOGIN_REJECTIONS)
    },

    // Falta dar de alta el sitio en Google: hasta entonces no se finge el acceso.
    loginWithGoogle: async () => {
      throw new GoogleAccessUnavailableError()
    },

    register: (credentials, operationKey) => registerOnce(operationKey, () => signUp(credentials)),

    requestPasswordReset: async (email) => {
      const { error } = await accounts.resetPasswordForEmail(email, { redirectTo: returnUrl, ...(await captchaOptions()) })

      if (error) throw toRejection(error, RESEND_REJECTIONS)
    },

    verifyRecoveryCode: async (email, code) => {
      const { error } = await accounts.verifyOtp({ email, token: code, type: 'recovery' })

      if (error) throw toRejection(error, CODE_REJECTIONS)
      recoveryCodeVerified = true
    },

    confirmEmail: async (email, code) => {
      // Comprobar un código no lleva la verificación contra bots: Supabase la pide al enviarlo, no al usarlo.
      const { error } = await accounts.verifyOtp({ email, token: code, type: 'email' })

      if (error) throw toRejection(error, CODE_REJECTIONS)
    },

    resendConfirmation: async (email) => {
      const { error } = await accounts.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: returnUrl, ...(await captchaOptions()) },
      })

      if (error) throw toRejection(error, RESEND_REJECTIONS)
    },

    isRecoveringPassword: () => cameFromRecoveryLink,

    changePassword: (password, operationKey) =>
      changePasswordOnce(operationKey, async () => {
        // Con la sesión abierta, Supabase aceptaría el cambio de cualquiera: aquí se exige el código o el enlace.
        if (!cameFromRecoveryLink && !recoveryCodeVerified) throw new RecoveryLinkExpiredError()
        const { error } = await accounts.updateUser({ password })

        if (error) throw toRejection(error, PASSWORD_REJECTIONS)
      }),

    // La base de datos copia estos datos al perfil de la cuenta y a sus anuncios.
    updateProfile: async ({ firstName, lastName, phone }) => {
      const { error } = await accounts.updateUser({ data: { first_name: firstName, last_name: lastName, phone } })

      if (error) throw error
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
