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
