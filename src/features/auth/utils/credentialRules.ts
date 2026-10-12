import { minCharacters, required } from '@/shared/utils/validators'
import type { Validator } from '@/shared/utils/validators'

/** Lo comparten los formularios, para que el campo y su regla no puedan decir cosas distintas. */
export const MIN_PASSWORD_LENGTH = 8

/** La contraseña se pide igual al registrarse que al iniciar sesión. */
export const PASSWORD_REQUIRED: Validator = required('Escribe tu contraseña.')

/**
 * Lo que se exige a una contraseña que se elige: al registrarse o al cambiarla. Se envía tal como se
 * escribe, así que su largo se cuenta sin recortar los espacios.
 */
export const NEW_PASSWORD_RULES: Validator[] = [
  PASSWORD_REQUIRED,
  minCharacters(MIN_PASSWORD_LENGTH, `Usa al menos ${MIN_PASSWORD_LENGTH} caracteres.`),
]

/** Los códigos que llegan al correo para confirmar la cuenta o elegir otra contraseña. */
export const CODE_LENGTH = 6

/** Solo los dígitos de lo que se escribió o pegó: el código puede llegar con espacios o guiones. */
export const toCode = (value: string) => value.replace(/\D/g, '').slice(0, CODE_LENGTH)

export const CODE_RULES: Validator[] = [
  required('Escribe el código que te enviamos.'),
  (value) => (toCode(value).length === CODE_LENGTH ? undefined : `El código tiene ${CODE_LENGTH} dígitos.`),
]

/** Las dos contraseñas que escribe quien elige una nueva deben coincidir. */
export const matches = (other: string): Validator => (value) =>
  value === other ? undefined : 'Las contraseñas no coinciden.'
