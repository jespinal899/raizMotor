/** Devuelve el mensaje de error, o `undefined` si el valor es válido. */
export type Validator = (value: string) => string | undefined

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Solo dígitos y los separadores habituales de un teléfono. */
const PHONE_CHARACTERS = /^[\d\s()+-]+$/
const MIN_PHONE_DIGITS = 8
const MAX_PHONE_DIGITS = 15
/** Aviso de un teléfono mal escrito: nombra los mismos límites que comprueba `phone`. */
export const INVALID_PHONE_MESSAGE = `Escribe un teléfono válido, de ${MIN_PHONE_DIGITS} a ${MAX_PHONE_DIGITS} dígitos.`

export const required =
  (message: string): Validator =>
  (value) =>
    value.trim() ? undefined : message

export const minLength =
  (min: number, message: string): Validator =>
  (value) =>
    value.trim().length >= min ? undefined : message

/**
 * Como `minLength`, pero cuenta también los espacios de los extremos. Es la regla de los valores que
 * se envían tal cual se escriben, como una contraseña: lo que se comprueba es lo mismo que se guarda.
 */
export const minCharacters =
  (min: number, message: string): Validator =>
  (value) =>
    value.length >= min ? undefined : message

export const email =
  (message: string): Validator =>
  (value) =>
    EMAIL_PATTERN.test(value.trim()) ? undefined : message

export const phone =
  (message: string): Validator =>
  (value) => {
    const trimmed = value.trim()
    const digits = trimmed.replace(/\D/g, '').length
    const isValid = PHONE_CHARACTERS.test(trimmed) && digits >= MIN_PHONE_DIGITS && digits <= MAX_PHONE_DIGITS

    return isValid ? undefined : message
  }

/** Convierte un validador en opcional: un valor vacío se acepta sin comprobarlo. */
export const optional =
  (validator: Validator): Validator =>
  (value) =>
    value.trim() ? validator(value) : undefined

/** Aplica los validadores en orden y devuelve el primer error. */
export const validate = (value: string, validators: Validator[]): string | undefined => {
  for (const validator of validators) {
    const error = validator(value)
    if (error) return error
  }
  return undefined
}

/** Errores de un formulario: el mensaje de cada campo inválido. */
export type FieldErrors<Values> = Partial<Record<keyof Values, string>>

export const hasErrors = (errors: Partial<Record<string, string>>): boolean => Object.values(errors).some(Boolean)

export const maxLength =
  (max: number, message: string): Validator =>
  (value) =>
    value.trim().length <= max ? undefined : message

/** Un campo vacío no es un número: `Number('')` daría 0. */
const toNumber = (value: string): number => (value.trim() === '' ? Number.NaN : Number(value))

export const positiveNumber =
  (message: string): Validator =>
  (value) => {
    const number = toNumber(value)

    return Number.isFinite(number) && number > 0 ? undefined : message
  }

/** Entero desde cero: sirve para cantidades como cuartos o baños. */
export const wholeNumber =
  (message: string): Validator =>
  (value) => {
    const number = toNumber(value)

    return Number.isInteger(number) && number >= 0 ? undefined : message
  }
