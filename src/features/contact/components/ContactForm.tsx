import type { FormEvent } from 'react'
import { Send } from 'lucide-react'
import FormField from '@/components/FormField'
import SubmitButton from '@/components/SubmitButton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import ContactFormStatus from '@/features/contact/components/ContactFormStatus'
import { useContactForm } from '@/features/contact/hooks/useContactForm'
import type { ContactFormValues } from '@/features/contact/types/contact.types'

interface ContactFormProps {
  initialDescription?: string
  onSubmit: (values: ContactFormValues) => Promise<void>
}

const ContactForm = ({ initialDescription, onSubmit }: ContactFormProps) => {
  const { values, errors, status, change, submit } = useContactForm({ initialDescription, onSubmit })
  const isSending = status === 'sending'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  return (
    <form
      noValidate
      aria-label="Formulario de contacto"
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-2xl border bg-card p-5 sm:p-6"
    >
      <FormField label="Nombre" error={errors.name}>
        {(control) => (
          <Input
            {...control}
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(event) => change('name', event.target.value)}
            className="h-11"
          />
        )}
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Correo" error={errors.email}>
          {(control) => (
            <Input
              {...control}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="nombre@gmail.com"
              value={values.email}
              onChange={(event) => change('email', event.target.value)}
              className="h-11"
            />
          )}
        </FormField>

        <FormField label="Teléfono" hint="opcional" error={errors.phone}>
          {(control) => (
            <Input
              {...control}
              type="tel"
              name="phone"
              autoComplete="tel"
              value={values.phone}
              onChange={(event) => change('phone', event.target.value)}
              className="h-11"
            />
          )}
        </FormField>
      </div>

      <FormField label="Descripción" error={errors.description}>
        {(control) => (
          <Textarea
            {...control}
            name="description"
            rows={5}
            placeholder="Cuéntanos qué necesitas."
            value={values.description}
            onChange={(event) => change('description', event.target.value)}
            className="min-h-32"
          />
        )}
      </FormField>

      <SubmitButton isSubmitting={isSending} icon={Send} submittingLabel="Enviando…" className="justify-self-start px-5">
        Enviar mensaje
      </SubmitButton>

      <ContactFormStatus status={status} />
    </form>
  )
}

export default ContactForm
