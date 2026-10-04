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

  /**
   * Comprueba los campos, muestra sus errores y dice si son válidos. Sin lista comprueba el
   * formulario entero; con ella, solo esos campos (p. ej. los de un paso) y conserva los demás errores.
   */
  const validateFields = (fields?: (keyof Values)[]): boolean => {
    const found = validate(values)

    if (!fields) {
      setErrors(found)
      return !hasErrors(found)
    }

    const scoped: FieldErrors<Values> = {}
    for (const field of fields) scoped[field] = found[field]
    setErrors((current) => ({ ...current, ...scoped }))

    return !hasErrors(scoped)
  }

  return { values, errors, change, validateFields }
}
