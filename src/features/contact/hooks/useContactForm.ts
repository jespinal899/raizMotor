import { useState } from 'react'
import { ContactUnavailableError } from '@/features/contact/services/contactService'
import type { ContactFormStatus, ContactFormValues } from '@/features/contact/types/contact.types'
import { validateContactForm } from '@/features/contact/utils/contactValidation'
import { useFormFields } from '@/hooks/useFormFields'

interface ContactFormOptions {
  initialDescription?: string
  onSubmit: (values: ContactFormValues) => Promise<void>
}

const trimValues = (values: ContactFormValues): ContactFormValues => ({
  name: values.name.trim(),
  email: values.email.trim(),
  phone: values.phone.trim(),
  description: values.description.trim(),
})

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
  const [status, setStatus] = useState<ContactFormStatus>('idle')

  const change: typeof changeField = (field, value) => {
    changeField(field, value)
    setStatus('idle')
  }

  const submit = async () => {
    if (!validateFields()) return

    setStatus('sending')
    try {
      await onSubmit(trimValues(values))
      setStatus('sent')
    } catch (reason) {
      setStatus(reason instanceof ContactUnavailableError ? 'unavailable' : 'failed')
    }
  }

  return { values, errors, status, change, submit }
}
