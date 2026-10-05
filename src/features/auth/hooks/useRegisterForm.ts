import { useAccessForm } from '@/features/auth/hooks/useAccessForm'
import { AuthUnavailableError, RegistrationUnavailableError } from '@/features/auth/services/authService'
import type { RegistrationCredentials, RegistrationFailure } from '@/features/auth/types/auth.types'
import { validateRegistration } from '@/features/auth/utils/registerValidation'
import { toInternationalPhone } from '@/shared/utils/honduranPhone'

interface RegisterFormOptions {
  /**
   * Se resuelve cuando la cuenta queda creada; quien usa el formulario decide qué pasa después.
   * La clave identifica el registro, para no crear la cuenta dos veces.
   */
  onSubmit: (credentials: RegistrationCredentials, operationKey: string) => Promise<void>
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

/**
 * Los datos de perfil se envían sin espacios sobrantes y el teléfono, completo: en el formulario solo se
 * escribe el número local. La contraseña va tal cual: sus espacios pueden ser parte de ella.
 */
const toCredentials = (values: RegistrationCredentials): RegistrationCredentials => ({
  ...values,
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  email: values.email.trim(),
  phone: toInternationalPhone(values.phone),
})

export const useRegisterForm = ({ onSubmit, onGoogleSignUp }: RegisterFormOptions) => {
  const { values, errors, status, change, validateFields, attempt } = useAccessForm({
    initialValues: EMPTY_REGISTRATION,
    validate: validateRegistration,
    toFailure: toFailureStatus,
  })

  const submit = async () => {
    if (!validateFields()) return

    await attempt('submitting', (operationKey) => onSubmit(toCredentials(values), operationKey))
  }

  // Google ya conoce el nombre y el correo, así que los campos del formulario no se validan.
  const signUpWithGoogle = () => attempt('connecting', onGoogleSignUp)

  return { values, errors, status, change, submit, signUpWithGoogle }
}
