import {
  AuthUnavailableError,
  CaptchaFailedError,
  EmailNotConfirmedError,
  GoogleAccessUnavailableError,
  InvalidCredentialsError,
} from '@/features/auth/services/authErrors'
import type { AccessInProgress, LoginCredentials, LoginFailure } from '@/features/auth/types/auth.types'
import { toFailure } from '@/features/auth/utils/accessFailure'
import { validateLogin } from '@/features/auth/utils/loginValidation'
import { useAttemptForm } from '@/hooks/useAttemptForm'

interface LoginFormOptions {
  /** Se resuelve cuando la sesión queda iniciada; quien usa el formulario decide qué pasa después. */
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  /** Inicia sesión con Google; se resuelve y se rechaza igual que `onSubmit`. */
  onGoogleSignIn: () => Promise<void>
}

const EMPTY_CREDENTIALS: LoginCredentials = { email: '', password: '', remember: false }

const toFailureStatus = toFailure<LoginFailure>(
  [
    [AuthUnavailableError, 'unavailable'],
    [InvalidCredentialsError, 'rejected'],
    [EmailNotConfirmedError, 'unconfirmed'],
    [GoogleAccessUnavailableError, 'googleUnavailable'],
    [CaptchaFailedError, 'captcha'],
  ],
  'failed',
)

export const useLoginForm = ({ onSubmit, onGoogleSignIn }: LoginFormOptions) => {
  const { values, errors, status, change, validateFields, attempt } = useAttemptForm<
    LoginCredentials,
    AccessInProgress,
    LoginFailure
  >({
    initialValues: EMPTY_CREDENTIALS,
    validate: validateLogin,
    toFailure: toFailureStatus,
  })

  const submit = async () => {
    if (!validateFields()) return

    // La contraseña se envía tal cual: sus espacios pueden ser parte de ella.
    await attempt('submitting', () => onSubmit({ ...values, email: values.email.trim() }))
  }

  // Con Google no hacen falta el correo ni la contraseña, así que no se validan.
  const signInWithGoogle = () => attempt('connecting', onGoogleSignIn)

  return { values, errors, status, change, submit, signInWithGoogle }
}
