import { useAccessForm } from '@/features/auth/hooks/useAccessForm'
import { AuthUnavailableError, RegistrationUnavailableError } from '@/features/auth/services/authService'
import type { RegistrationCredentials, RegistrationFailure } from '@/features/auth/types/auth.types'
import { validateRegistration } from '@/features/auth/utils/registerValidation'

interface RegisterFormOptions {
  /** Se resuelve cuando la cuenta queda creada; quien usa el formulario decide qué pasa después. */
  onSubmit: (credentials: RegistrationCredentials) => Promise<void>
  /** Crea la cuenta con la de Google; se resuelve y se rechaza igual que `onSubmit`. */
  onGoogleSignUp: () => Promise<void>
}

const EMPTY_REGISTRATION: RegistrationCredentials = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
}

/** Ni el registro ni el acceso con Google están activos todavía: los dos se explican igual. */
const isUnavailable = (reason: unknown) =>
  reason instanceof RegistrationUnavailableError || reason instanceof AuthUnavailableError

const toFailureStatus = (reason: unknown): RegistrationFailure => (isUnavailable(reason) ? 'unavailable' : 'failed')

/** Los datos de perfil se envían sin espacios sobrantes; la contraseña, tal cual: pueden ser parte de ella. */
const toCredentials = (values: RegistrationCredentials): RegistrationCredentials => ({
  ...values,
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  email: values.email.trim(),
  phone: values.phone.trim(),
})

export const useRegisterForm = ({ onSubmit, onGoogleSignUp }: RegisterFormOptions) => {
  const { values, errors, status, change, validateFields, attempt } = useAccessForm({
    initialValues: EMPTY_REGISTRATION,
    validate: validateRegistration,
    toFailure: toFailureStatus,
  })

  const submit = async () => {
    if (!validateFields()) return

    await attempt('submitting', () => onSubmit(toCredentials(values)))
  }

  // Google ya conoce el nombre y el correo, así que los campos del formulario no se validan.
  const signUpWithGoogle = () => attempt('connecting', onGoogleSignUp)

  return { values, errors, status, change, submit, signUpWithGoogle }
}
