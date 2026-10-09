import type { RegistrationCredentials } from '@/features/auth/types/auth.types'
import { NEW_PASSWORD_RULES } from '@/features/auth/utils/credentialRules'
import { EMAIL_RULES, PHONE_RULES } from '@/shared/utils/fieldRules'
import { maxLength, required, validate } from '@/shared/utils/validators'
import type { FieldErrors } from '@/shared/utils/validators'

/** Lo comparte el formulario, para que el campo y su regla no puedan decir cosas distintas. */
export const MAX_NAME_LENGTH = 80

export const validateRegistration = (values: RegistrationCredentials): FieldErrors<RegistrationCredentials> => ({
  firstName: validate(values.firstName, [
    required('Escribe tu nombre.'),
    maxLength(MAX_NAME_LENGTH, `El nombre no puede pasar de ${MAX_NAME_LENGTH} caracteres.`),
  ]),
  lastName: validate(values.lastName, [
    required('Escribe tu apellido.'),
    maxLength(MAX_NAME_LENGTH, `El apellido no puede pasar de ${MAX_NAME_LENGTH} caracteres.`),
  ]),
  email: validate(values.email, EMAIL_RULES),
  phone: validate(values.phone, PHONE_RULES),
  password: validate(values.password, NEW_PASSWORD_RULES),
})
