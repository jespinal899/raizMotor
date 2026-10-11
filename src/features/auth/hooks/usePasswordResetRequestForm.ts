import { CaptchaFailedError } from '@/features/auth/services/authErrors'
import { useAttemptForm } from '@/hooks/useAttemptForm'
import { EMAIL_RULES } from '@/shared/utils/fieldRules'
import { validate } from '@/shared/utils/validators'

interface PasswordResetRequest {
  email: string
}

interface PasswordResetRequestFormOptions {
  /** Se resuelve cuando el enlace quedó pedido; se rechaza si no se pudo. */
  onSubmit: (email: string) => Promise<void>
}

const EMPTY_REQUEST: PasswordResetRequest = { email: '' }

/** Formulario que pide, para un correo, el enlace con el que elegir otra contraseña. */
export const usePasswordResetRequestForm = ({ onSubmit }: PasswordResetRequestFormOptions) => {
  const { values, errors, status, change, validateFields, attempt } = useAttemptForm<
    PasswordResetRequest,
    'submitting',
    'captcha' | 'failed',
    'sent'
  >({
    initialValues: EMPTY_REQUEST,
    validate: ({ email }) => ({ email: validate(email, EMAIL_RULES) }),
    toFailure: (reason) => (reason instanceof CaptchaFailedError ? 'captcha' : 'failed'),
    succeeded: 'sent',
  })

  const submit = async () => {
    if (!validateFields()) return

    await attempt('submitting', () => onSubmit(values.email.trim()))
  }

  return { values, errors, status, change, submit }
}
