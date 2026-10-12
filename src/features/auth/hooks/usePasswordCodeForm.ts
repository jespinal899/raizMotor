import { InvalidCodeError, SamePasswordError } from '@/features/auth/services/authErrors'
import type { CodeFailure } from '@/features/auth/types/auth.types'
import { toFailure } from '@/features/auth/utils/accessFailure'
import { CODE_RULES, NEW_PASSWORD_RULES, matches, toCode } from '@/features/auth/utils/credentialRules'
import { useAttemptForm } from '@/hooks/useAttemptForm'
import { required, validate } from '@/shared/utils/validators'

interface PasswordCode {
  code: string
  password: string
  confirmation: string
}

interface PasswordCodeFormOptions {
  /**
   * Se resuelve cuando la contraseña quedó guardada; se rechaza si el código no vale o la contraseña no se
   * pudo guardar. La clave identifica el cambio, para no hacerlo dos veces.
   */
  onSubmit: (reset: { code: string; password: string }, operationKey: string) => Promise<void>
}

const EMPTY: PasswordCode = { code: '', password: '', confirmation: '' }

const toFailureStatus = toFailure<CodeFailure>(
  [
    [InvalidCodeError, 'invalidCode'],
    [SamePasswordError, 'unchanged'],
  ],
  'failed',
)

/** Formulario con el que se elige otra contraseña escribiendo el código que llegó al correo. */
export const usePasswordCodeForm = ({ onSubmit }: PasswordCodeFormOptions) => {
  const { values, errors, status, change, validateFields, attempt } = useAttemptForm<PasswordCode, 'submitting', CodeFailure>({
    initialValues: EMPTY,
    validate: ({ code, password, confirmation }) => ({
      code: validate(code, CODE_RULES),
      password: validate(password, NEW_PASSWORD_RULES),
      confirmation: validate(confirmation, [required('Repite la contraseña nueva.'), matches(password)]),
    }),
    toFailure: toFailureStatus,
  })

  const submit = async () => {
    if (!validateFields()) return

    // La contraseña se envía tal cual: sus espacios pueden ser parte de ella.
    await attempt('submitting', (operationKey) => onSubmit({ code: toCode(values.code), password: values.password }, operationKey))
  }

  return { values, errors, status, change, submit }
}
