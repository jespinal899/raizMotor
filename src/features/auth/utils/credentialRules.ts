import { required } from '@/shared/utils/validators'
import type { Validator } from '@/shared/utils/validators'

/** La contraseña se pide igual al registrarse que al iniciar sesión. */
export const PASSWORD_REQUIRED: Validator = required('Escribe tu contraseña.')
