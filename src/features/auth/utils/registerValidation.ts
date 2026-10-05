import type { RegistrationCredentials } from '@/features/auth/types/auth.types'
import { EMAIL_RULES, PASSWORD_REQUIRED } from '@/features/auth/utils/credentialRules'
import { honduranPhone } from '@/shared/utils/honduranPhone'
import { maxLength, minCharacters, required, validate } from '@/shared/utils/validators'
import type { FieldErrors } from '@/shared/utils/validators'

/** Los comparte el formulario, para que el campo y su regla no puedan decir cosas distintas. */
export const MAX_NAME_LENGTH = 80
export const MIN_PASSWORD_LENGTH = 8

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
  phone: validate(values.phone, [required('Escribe tu teléfono.'), honduranPhone]),
  // La contraseña se envía tal como se escribe, así que su largo se cuenta sin recortar los espacios.
  password: validate(values.password, [
    PASSWORD_REQUIRED,
    minCharacters(MIN_PASSWORD_LENGTH, `Usa al menos ${MIN_PASSWORD_LENGTH} caracteres.`),
  ]),
})
