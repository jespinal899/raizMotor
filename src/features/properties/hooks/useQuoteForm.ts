import { QuoteUnavailableError } from '@/features/properties/services/quoteService'
import type { QuoteApplicant, QuoteFailure, QuoteFormValues } from '@/features/properties/types/quote.types'
import { validateQuote } from '@/features/properties/utils/quoteValidation'
import { useAttemptForm } from '@/hooks/useAttemptForm'
import { toInternationalPhone } from '@/shared/utils/honduranPhone'

interface QuoteFormOptions {
  /** Se resuelve cuando la solicitud queda entregada. La clave identifica el envío, para no registrarlo dos veces. */
  onSubmit: (applicant: QuoteApplicant, operationKey: string) => Promise<void>
}

const EMPTY_QUOTE: QuoteFormValues = { fullName: '', email: '', phone: '', acceptsTerms: false }

const toFailureStatus = (reason: unknown): QuoteFailure =>
  reason instanceof QuoteUnavailableError ? 'unavailable' : 'failed'

/** Los datos se envían sin espacios sobrantes y el teléfono, completo: en el formulario solo se escribe el número local. */
const toApplicant = (values: QuoteFormValues): QuoteApplicant => ({
  fullName: values.fullName.trim().replace(/\s+/g, ' '),
  email: values.email.trim(),
  phone: toInternationalPhone(values.phone),
})

export const useQuoteForm = ({ onSubmit }: QuoteFormOptions) => {
  const { values, errors, status, change, validateFields, attempt } = useAttemptForm<
    QuoteFormValues,
    'sending',
    QuoteFailure,
    'sent'
  >({
    initialValues: EMPTY_QUOTE,
    validate: validateQuote,
    toFailure: toFailureStatus,
    succeeded: 'sent',
  })

  const submit = async () => {
    if (!validateFields()) return

    await attempt('sending', (operationKey) => onSubmit(toApplicant(values), operationKey))
  }

  return { values, errors, status, change, submit }
}
