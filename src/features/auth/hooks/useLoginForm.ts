import { useState } from 'react'
import { AuthUnavailableError, InvalidCredentialsError } from '@/features/auth/services/authService'
import type { LoginCredentials, LoginStatus } from '@/features/auth/types/auth.types'
import { validateLogin } from '@/features/auth/utils/loginValidation'
import { useFormFields } from '@/hooks/useFormFields'

interface LoginFormOptions {
  /** Se resuelve cuando la sesión queda iniciada; quien usa el formulario decide qué pasa después. */
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  /** Inicia sesión con Google; se resuelve y se rechaza igual que `onSubmit`. */
  onGoogleSignIn: () => Promise<void>
}

const EMPTY_CREDENTIALS: LoginCredentials = { email: '', password: '', remember: false }

const toFailureStatus = (reason: unknown): LoginStatus => {
  if (reason instanceof AuthUnavailableError) return 'unavailable'
  if (reason instanceof InvalidCredentialsError) return 'rejected'

  return 'failed'
}

export const useLoginForm = ({ onSubmit, onGoogleSignIn }: LoginFormOptions) => {
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

  /** Las dos formas de entrar comparten lo que pasa mientras se intenta y cuando falla. */
  const attempt = async (inProgress: 'submitting' | 'connecting', signIn: () => Promise<void>) => {
    setStatus(inProgress)
    try {
      await signIn()
      setStatus('idle')
    } catch (reason) {
      setStatus(toFailureStatus(reason))
    }
  }

  const submit = async () => {
    if (!validateFields()) return

    // La contraseña se envía tal cual: sus espacios pueden ser parte de ella.
    await attempt('submitting', () => onSubmit({ ...values, email: values.email.trim() }))
  }

  // Con Google no hacen falta el correo ni la contraseña, así que no se validan.
  const signInWithGoogle = () => attempt('connecting', onGoogleSignIn)

  return { values, errors, status, change, submit, signInWithGoogle }
}
