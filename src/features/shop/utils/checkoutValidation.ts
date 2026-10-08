import type { CheckoutFormErrors, CheckoutFormValues } from '@/features/shop/types/checkout.types'
import { EMAIL_RULES } from '@/shared/utils/fieldRules'
import { honduranDocument } from '@/shared/utils/honduranDocument'
import { honduranPhone } from '@/shared/utils/honduranPhone'
import { maxLength, optional, required, validate } from '@/shared/utils/validators'
import type { Validator } from '@/shared/utils/validators'

/** Lo comparten los campos, para que ellos y su regla no puedan decir cosas distintas. */
export const MAX_NAME_LENGTH = 60

const nameRules = (whenEmpty: string): Validator[] => [
  required(whenEmpty),
  maxLength(MAX_NAME_LENGTH, `No puede pasar de ${MAX_NAME_LENGTH} caracteres.`),
]

export const validateCheckout = (values: CheckoutFormValues): CheckoutFormErrors => ({
  firstName: validate(values.firstName, nameRules('Escribe tu nombre.')),
  lastName: validate(values.lastName, nameRules('Escribe tu apellido.')),
  document: validate(values.document, [optional(honduranDocument)]),
  phone: validate(values.phone, [required('Escribe tu celular.'), honduranPhone]),
  email: validate(values.email, EMAIL_RULES),
  paymentMethod: values.paymentMethod ? undefined : 'Elige cómo quieres pagar.',
  acceptsTerms: values.acceptsTerms ? undefined : 'Acepta los términos y condiciones para continuar.',
})
