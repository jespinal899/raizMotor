import { useAttempt } from '@/hooks/useAttempt'
import { useFormFields } from '@/hooks/useFormFields'
import type { FieldErrors } from '@/shared/utils/validators'

interface AttemptFormOptions<Values, Failure, Success> {
  initialValues: Values
  validate: (values: Values) => FieldErrors<Values>
  /** Traduce el motivo de un rechazo al estado que explica por qué no se pudo. */
  toFailure: (reason: unknown) => Failure
  /** Estado en que queda el formulario cuando el envío termina bien. Sin él, vuelve al reposo. */
  succeeded?: Success
}

/**
 * Base de un formulario que se envía (entrar, registrarse, escribir, cotizar): los campos con sus
 * errores y el estado del intento.
 */
export const useAttemptForm = <
  Values extends object,
  InProgress extends string,
  Failure extends string,
  Success extends string = never,
>({
  initialValues,
  validate,
  toFailure,
  succeeded,
}: AttemptFormOptions<Values, Failure, Success>) => {
  const { values, errors, change: changeField, validateFields } = useFormFields({ initialValues, validate })
  const { status, attempt, reset } = useAttempt<InProgress, Failure, Success>({ toFailure, succeeded })

  // El aviso de un intento habla de lo que se envió: al editar deja de corresponder, y es otro envío.
  const change: typeof changeField = (field, value) => {
    changeField(field, value)
    reset()
  }

  return { values, errors, status, change, validateFields, attempt }
}
