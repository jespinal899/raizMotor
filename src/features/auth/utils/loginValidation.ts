import type { LoginCredentials } from '@/features/auth/types/auth.types'
import { PASSWORD_REQUIRED } from '@/features/auth/utils/credentialRules'
import { EMAIL_RULES } from '@/shared/utils/fieldRules'
import { validate } from '@/shared/utils/validators'
import type { FieldErrors } from '@/shared/utils/validators'

/** Al entrar solo se comprueba que haya contraseña: sus reglas se exigen al crear la cuenta. */
export const validateLogin = (values: LoginCredentials): FieldErrors<LoginCredentials> => ({
  email: validate(values.email, EMAIL_RULES),
  password: validate(values.password, [PASSWORD_REQUIRED]),
})
