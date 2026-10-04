/** Devuelve el mensaje de error, o `undefined` si el valor es válido. */
export type Validator = (value: string) => string | undefined

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Solo dígitos y los separadores habituales de un teléfono. */
const PHONE_CHARACTERS = /^[\d\s()+-]+$/
const MIN_PHONE_DIGITS = 8
const MAX_PHONE_DIGITS = 15

export const required =
  (message: string): Validator =>
  (value) =>
    value.trim() ? undefined : message

export const minLength =
  (min: number, message: string): Validator =>
  (value) =>
    value.trim().length >= min ? undefined : message

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
