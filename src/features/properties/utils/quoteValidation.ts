import type { QuoteFormErrors, QuoteFormValues } from '@/features/properties/types/quote.types'
import { EMAIL_RULES, PHONE_RULES } from '@/shared/utils/fieldRules'
import { maxLength, required, validate } from '@/shared/utils/validators'
import type { Validator } from '@/shared/utils/validators'

/** Lo comparte el formulario, para que el campo y su regla no puedan decir cosas distintas. */
export const MAX_FULL_NAME_LENGTH = 120

/** Nombre y apellido son, como poco, dos palabras. */
const withSurname: Validator = (value) => (/\S\s+\S/.test(value) ? undefined : 'Escribe también tu apellido.')

export const validateQuote = (values: QuoteFormValues): QuoteFormErrors => ({
  fullName: validate(values.fullName, [
    required('Escribe tu nombre y apellido.'),
    withSurname,
    maxLength(MAX_FULL_NAME_LENGTH, `El nombre no puede pasar de ${MAX_FULL_NAME_LENGTH} caracteres.`),
  ]),
  email: validate(values.email, EMAIL_RULES),
  phone: validate(values.phone, PHONE_RULES),
  acceptsTerms: values.acceptsTerms ? undefined : 'Acepta los términos y condiciones para cotizar.',
})
