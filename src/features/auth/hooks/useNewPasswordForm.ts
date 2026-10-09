import { RecoveryLinkExpiredError, SamePasswordError } from '@/features/auth/services/authErrors'
import type { PasswordChangeFailure } from '@/features/auth/types/auth.types'
import { toFailure } from '@/features/auth/utils/accessFailure'
import { NEW_PASSWORD_RULES } from '@/features/auth/utils/credentialRules'
import { useAttemptForm } from '@/hooks/useAttemptForm'
import { validate } from '@/shared/utils/validators'

interface NewPassword {
  password: string
}

interface NewPasswordFormOptions {
  /**
   * Se resuelve cuando la contraseña quedó guardada; se rechaza si no se pudo. La clave identifica el
   * cambio, para no pedirlo dos veces.
   */
  onSubmit: (password: string, operationKey: string) => Promise<void>
}

const EMPTY_PASSWORD: NewPassword = { password: '' }

const toFailureStatus = toFailure<PasswordChangeFailure>(
  [
    [SamePasswordError, 'unchanged'],
    [RecoveryLinkExpiredError, 'expired'],
  ],
  'failed',
)

/** Formulario con el que elige otra contraseña quien llegó desde el enlace de su correo. */
export const useNewPasswordForm = ({ onSubmit }: NewPasswordFormOptions) => {
  const { values, errors, status, change, validateFields, attempt } = useAttemptForm<
    NewPassword,
    'submitting',
    PasswordChangeFailure,
    'changed'
  >({
    initialValues: EMPTY_PASSWORD,
    validate: ({ password }) => ({ password: validate(password, NEW_PASSWORD_RULES) }),
    toFailure: toFailureStatus,
    succeeded: 'changed',
  })

  const submit = async () => {
    if (!validateFields()) return

    // La contraseña se envía tal cual: sus espacios pueden ser parte de ella.
    await attempt('submitting', (operationKey) => onSubmit(values.password, operationKey))
  }

  return { values, errors, status, change, submit }
}
