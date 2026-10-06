import { ContactUnavailableError } from '@/features/contact/services/contactService'
import type { ContactFormValues } from '@/features/contact/types/contact.types'
import { validateContactForm } from '@/features/contact/utils/contactValidation'
import { useAttemptForm } from '@/hooks/useAttemptForm'

interface ContactFormOptions {
  initialDescription?: string
  /** Se resuelve cuando el mensaje queda entregado. La clave identifica el envío, para no entregarlo dos veces. */
  onSubmit: (values: ContactFormValues, operationKey: string) => Promise<void>
}

const trimValues = (values: ContactFormValues): ContactFormValues => ({
  name: values.name.trim(),
  email: values.email.trim(),
  phone: values.phone.trim(),
  description: values.description.trim(),
})

const toFailureStatus = (reason: unknown) => (reason instanceof ContactUnavailableError ? 'unavailable' : 'failed')

export const useContactForm = ({ initialDescription = '', onSubmit }: ContactFormOptions) => {
  // Con un dato distinto es otro mensaje: el formulario retira el aviso del anterior y se podrá enviar de nuevo.
  const { values, errors, status, change, validateFields, attempt } = useAttemptForm<
    ContactFormValues,
    'sending',
    'unavailable' | 'failed',
    'sent'
  >({
    initialValues: { name: '', email: '', phone: '', description: initialDescription },
    validate: validateContactForm,
    toFailure: toFailureStatus,
    succeeded: 'sent',
  })

  const submit = async () => {
    if (!validateFields()) return

    await attempt('sending', (operationKey) => onSubmit(trimValues(values), operationKey))
  }

  return { values, errors, status, change, submit }
}
