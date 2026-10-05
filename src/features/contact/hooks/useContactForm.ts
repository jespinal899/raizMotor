import { ContactUnavailableError } from '@/features/contact/services/contactService'
import type { ContactFormValues } from '@/features/contact/types/contact.types'
import { validateContactForm } from '@/features/contact/utils/contactValidation'
import { useAttempt } from '@/hooks/useAttempt'
import { useFormFields } from '@/hooks/useFormFields'

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
  const {
    values,
    errors,
    change: changeField,
    validateFields,
  } = useFormFields<ContactFormValues>({
    initialValues: { name: '', email: '', phone: '', description: initialDescription },
    validate: validateContactForm,
  })
  const { status, attempt, reset } = useAttempt<'sending', 'unavailable' | 'failed', 'sent'>({
    toFailure: toFailureStatus,
    succeeded: 'sent',
  })

  // Con un dato distinto es otro mensaje: se retira el aviso del anterior y se podrá enviar de nuevo.
  const change: typeof changeField = (field, value) => {
    changeField(field, value)
    reset()
  }

  const submit = async () => {
    if (!validateFields()) return

    await attempt('sending', (operationKey) => onSubmit(trimValues(values), operationKey))
  }

  return { values, errors, status, change, submit }
}
