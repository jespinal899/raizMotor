import type { LoginCredentials } from '@/features/auth/types/auth.types'
import { email, required, validate } from '@/shared/utils/validators'
import type { FieldErrors } from '@/shared/utils/validators'

/** Al entrar solo se comprueba que haya contraseña: sus reglas se exigen al crear la cuenta. */
export const validateLogin = (values: LoginCredentials): FieldErrors<LoginCredentials> => ({
  email: validate(values.email, [
    required('Escribe tu correo.'),
    email('Revisa el correo: debe tener el formato nombre@dominio.com.'),
  ]),
  password: validate(values.password, [required('Escribe tu contraseña.')]),
})
