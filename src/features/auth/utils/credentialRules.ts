import { email, required } from '@/shared/utils/validators'
import type { Validator } from '@/shared/utils/validators'

/** El correo identifica la cuenta, así que se le exige lo mismo al registrarse que al iniciar sesión. */
export const EMAIL_RULES: Validator[] = [
  required('Escribe tu correo.'),
  email('Revisa el correo: debe tener el formato nombre@dominio.com.'),
]

export const PASSWORD_REQUIRED: Validator = required('Escribe tu contraseña.')
