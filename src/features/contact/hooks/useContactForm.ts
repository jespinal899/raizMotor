import { useState } from 'react'
import { ContactUnavailableError } from '@/features/contact/services/contactService'
import type {
  ContactFormErrors,
  ContactFormStatus,
  ContactFormValues,
} from '@/features/contact/types/contact.types'
import { hasErrors, validateContactForm } from '@/features/contact/utils/contactValidation'

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
  const [values, setValues] = useState<ContactFormValues>({
    name: '',
    email: '',
    phone: '',
    description: initialDescription,
  })
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [status, setStatus] = useState<ContactFormStatus>('idle')

  const change = (field: keyof ContactFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setStatus('idle')
  }

  const submit = async () => {
    const found = validateContactForm(values)
    setErrors(found)
    if (hasErrors(found)) return

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
