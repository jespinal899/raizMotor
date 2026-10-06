import { honduranPhone } from '@/shared/utils/honduranPhone'
import { email, required } from '@/shared/utils/validators'
import type { Validator } from '@/shared/utils/validators'

/**
 * Reglas de los datos con los que se localiza a una persona. Las comparten los formularios que los
 * piden, para que no puedan exigir cosas distintas del mismo dato.
 */
export const EMAIL_RULES: Validator[] = [
  required('Escribe tu correo.'),
  email('Revisa el correo: debe tener el formato nombre@dominio.com.'),
]

export const PHONE_RULES: Validator[] = [required('Escribe tu teléfono.'), honduranPhone]
