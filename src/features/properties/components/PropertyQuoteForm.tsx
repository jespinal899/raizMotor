import { useId } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Send } from 'lucide-react'
import CaptchaWidget from '@/components/CaptchaWidget'
import EmailField from '@/components/EmailField'
import PhoneField from '@/components/PhoneField'
import SubmitButton from '@/components/SubmitButton'
import TermsCheckboxField from '@/components/TermsCheckboxField'
import TextField from '@/components/TextField'
import QuoteFormAlert from '@/features/properties/components/QuoteFormAlert'
import { useQuoteForm } from '@/features/properties/hooks/useQuoteForm'
import type { QuoteApplicant } from '@/features/properties/types/quote.types'
import { MAX_FULL_NAME_LENGTH } from '@/features/properties/utils/quoteValidation'

interface PropertyQuoteFormProps {
  /** Se resuelve cuando la solicitud queda entregada. La clave identifica el envío, para no registrarlo dos veces. */
  onSubmit: (applicant: QuoteApplicant, operationKey: string) => Promise<void>
  /** El título y la explicación del formulario: los de un anuncio, salvo que se pida otra cosa. */
  heading?: string
  description?: string
  submitLabel?: string
  /** Campos propios de lo que se cotiza, como el modelo de un proyecto: van antes de aceptar los términos. */
  children?: ReactNode
}

/**
 * Formulario breve de la ficha para que el publicador contacte a quien está interesado: sus datos le llegan
 * por correo, sin que haga falta una cuenta.
 */
const PropertyQuoteForm = ({
  onSubmit,
  heading = 'Contacta al publicador en segundos',
  description = 'Déjale tus datos y te escribirá o llamará directamente.',
  submitLabel = 'Enviar mis datos',
  children,
}: PropertyQuoteFormProps) => {
  const titleId = useId()
  const descriptionId = useId()
  const { values, errors, status, change, submit } = useQuoteForm({ onSubmit })
  const isSending = status === 'sending'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  return (
    <form
      noValidate
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onSubmit={handleSubmit}
      className="grid gap-4"
    >
      <div className="grid gap-1">
        <h2 id={titleId} className="font-heading text-lg font-semibold tracking-tight">
          {heading}
        </h2>
        <p id={descriptionId} className="text-sm text-pretty text-muted-foreground">
          {description}
        </p>
      </div>

      <TextField
        label="Nombre y apellido"
        error={errors.fullName}
        name="name"
        autoComplete="name"
        maxLength={MAX_FULL_NAME_LENGTH}
        value={values.fullName}
        onChange={(value) => change('fullName', value)}
        readOnly={isSending}
      />

      <EmailField
        value={values.email}
        error={errors.email}
        onChange={(value) => change('email', value)}
        readOnly={isSending}
      />

      <PhoneField
        label="Teléfono"
        error={errors.phone}
        name="phone"
        value={values.phone}
        onChange={(value) => change('phone', value)}
        readOnly={isSending}
      />

      {children}

      <TermsCheckboxField
        checked={values.acceptsTerms}
        error={errors.acceptsTerms}
        onChange={(checked) => change('acceptsTerms', checked)}
        readOnly={isSending}
      />

      <CaptchaWidget />

      {/* Ya enviada, repetirla no mandaría nada: el botón vuelve a activarse al cambiar algún dato. */}
      <SubmitButton
        isSubmitting={isSending}
        disabled={status === 'sent'}
        icon={Send}
        submittingLabel="Enviando…"
      >
        {submitLabel}
      </SubmitButton>

      <QuoteFormAlert status={status} />
    </form>
  )
}

export default PropertyQuoteForm
