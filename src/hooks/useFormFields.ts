import { useState } from 'react'
import { hasErrors } from '@/shared/utils/validators'
import type { FieldErrors } from '@/shared/utils/validators'

interface FormFieldsOptions<Values> {
  initialValues: Values
  validate: (values: Values) => FieldErrors<Values>
}

/** Valores y errores de un formulario. Corregir un campo retira su error sin tocar los demás. */
export const useFormFields = <Values extends object>({ initialValues, validate }: FormFieldsOptions<Values>) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FieldErrors<Values>>({})

  const change = <Field extends keyof Values>(field: Field, value: Values[Field]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  /** Comprueba todos los campos, muestra sus errores y dice si el formulario puede enviarse. */
  const validateFields = (): boolean => {
    const found = validate(values)
    setErrors(found)

    return !hasErrors(found)
  }

  return { values, errors, change, validateFields }
}
