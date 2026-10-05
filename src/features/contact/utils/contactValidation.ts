import type { ContactFormErrors, ContactFormValues } from '@/features/contact/types/contact.types'
import {
  INVALID_PHONE_MESSAGE,
  email,
  minLength,
  optional,
  phone,
  required,
  validate,
} from '@/shared/utils/validators'

const MIN_NAME_LENGTH = 2
const MIN_DESCRIPTION_LENGTH = 10

export const validateContactForm = (values: ContactFormValues): ContactFormErrors => ({
  name: validate(values.name, [
    required('Escribe tu nombre.'),
    minLength(MIN_NAME_LENGTH, 'El nombre debe tener al menos 2 letras.'),
  ]),
  email: validate(values.email, [
    required('Escribe tu correo para poder responderte.'),
    email('Escribe un correo válido, por ejemplo nombre@gmail.com.'),
  ]),
  phone: validate(values.phone, [optional(phone(INVALID_PHONE_MESSAGE))]),
  description: validate(values.description, [
    required('Describe tu consulta.'),
    minLength(MIN_DESCRIPTION_LENGTH, 'Cuéntanos un poco más: al menos 10 caracteres.'),
  ]),
})
