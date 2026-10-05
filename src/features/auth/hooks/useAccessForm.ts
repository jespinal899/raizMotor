import type { AccessInProgress } from '@/features/auth/types/auth.types'
import { useAttempt } from '@/hooks/useAttempt'
import { useFormFields } from '@/hooks/useFormFields'
import type { FieldErrors } from '@/shared/utils/validators'

interface AccessFormOptions<Values, Failure> {
  initialValues: Values
  validate: (values: Values) => FieldErrors<Values>
  /** Traduce el motivo de un rechazo al estado que explica por qué no se pudo acceder. */
  toFailure: (reason: unknown) => Failure
}

/**
 * Base de los formularios de acceso (iniciar sesión y registrarse): los campos con sus errores y el
 * estado del intento, sea con el formulario o con Google.
 */
export const useAccessForm = <Values extends object, Failure extends string>({
  initialValues,
  validate,
  toFailure,
}: AccessFormOptions<Values, Failure>) => {
  const { values, errors, change: changeField, validateFields } = useFormFields({ initialValues, validate })
  const { status, attempt, reset } = useAttempt<AccessInProgress, Failure>({ toFailure })

  // El aviso de un intento fallido habla de lo que se envió: al editar, deja de corresponder.
  const change: typeof changeField = (field, value) => {
    changeField(field, value)
    reset()
  }

  return { values, errors, status, change, validateFields, attempt }
}
