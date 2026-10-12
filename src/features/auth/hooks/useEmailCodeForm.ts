import { InvalidCodeError } from '@/features/auth/services/authErrors'
import type { CodeFailure } from '@/features/auth/types/auth.types'
import { toFailure } from '@/features/auth/utils/accessFailure'
import { CODE_RULES, toCode } from '@/features/auth/utils/credentialRules'
import { useAttemptForm } from '@/hooks/useAttemptForm'
import { validate } from '@/shared/utils/validators'

interface EmailCode {
  code: string
}

interface EmailCodeFormOptions {
  /** Se resuelve cuando el código se aceptó; se rechaza si no vale. */
  onSubmit: (code: string) => Promise<void>
}

const toFailureStatus = toFailure<CodeFailure>([[InvalidCodeError, 'invalidCode']], 'failed')

/** Formulario con el que se escribe el código que llegó al correo: para confirmar la cuenta o para elegir otra contraseña. */
export const useEmailCodeForm = ({ onSubmit }: EmailCodeFormOptions) => {
  const { values, errors, status, change, validateFields, attempt } = useAttemptForm<EmailCode, 'submitting', CodeFailure>({
    initialValues: { code: '' },
    validate: ({ code }) => ({ code: validate(code, CODE_RULES) }),
    toFailure: toFailureStatus,
  })

  const submit = async () => {
    if (!validateFields()) return

    await attempt('submitting', () => onSubmit(toCode(values.code)))
  }

  return { values, errors, status, change, submit }
}
