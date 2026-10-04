import { useState } from 'react'
import { AuthUnavailableError, InvalidCredentialsError } from '@/features/auth/services/authService'
import type { LoginCredentials, LoginStatus } from '@/features/auth/types/auth.types'
import { validateLogin } from '@/features/auth/utils/loginValidation'
import { useFormFields } from '@/hooks/useFormFields'

interface LoginFormOptions {
  /** Se resuelve cuando la sesión queda iniciada; quien usa el formulario decide qué pasa después. */
  onSubmit: (credentials: LoginCredentials) => Promise<void>
}

const EMPTY_CREDENTIALS: LoginCredentials = { email: '', password: '', remember: false }

const toFailureStatus = (reason: unknown): LoginStatus => {
  if (reason instanceof AuthUnavailableError) return 'unavailable'
  if (reason instanceof InvalidCredentialsError) return 'rejected'

  return 'failed'
}

export const useLoginForm = ({ onSubmit }: LoginFormOptions) => {
  const {
    values,
    errors,
    change: changeField,
    validateFields,
  } = useFormFields({ initialValues: EMPTY_CREDENTIALS, validate: validateLogin })
  const [status, setStatus] = useState<LoginStatus>('idle')

  const change: typeof changeField = (field, value) => {
    changeField(field, value)
    setStatus('idle')
  }

  const submit = async () => {
    if (!validateFields()) return

    setStatus('submitting')
    try {
      // La contraseña se envía tal cual: sus espacios pueden ser parte de ella.
      await onSubmit({ ...values, email: values.email.trim() })
      setStatus('idle')
    } catch (reason) {
      setStatus(toFailureStatus(reason))
    }
  }

  return { values, errors, status, change, submit }
}
