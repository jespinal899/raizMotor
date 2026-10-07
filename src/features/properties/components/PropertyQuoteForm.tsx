import { useId } from 'react'
import type { FormEvent } from 'react'
import { ReceiptText } from 'lucide-react'
import CheckboxField from '@/components/CheckboxField'
import EmailField from '@/components/EmailField'
import PhoneField from '@/components/PhoneField'
import SubmitButton from '@/components/SubmitButton'
import TextField from '@/components/TextField'
import TextLink from '@/components/TextLink'
import QuoteFormAlert from '@/features/properties/components/QuoteFormAlert'
import { useQuoteForm } from '@/features/properties/hooks/useQuoteForm'
import type { QuoteApplicant } from '@/features/properties/types/quote.types'
import { MAX_FULL_NAME_LENGTH } from '@/features/properties/utils/quoteValidation'
import { ROUTES } from '@/shared/constants/routes'

interface PropertyQuoteFormProps {
  /** Se resuelve cuando la solicitud queda entregada. La clave identifica el envío, para no registrarlo dos veces. */
  onSubmit: (applicant: QuoteApplicant, operationKey: string) => Promise<void>
}

/** Formulario breve de la ficha para pedir la cotización de la propiedad. */
const PropertyQuoteForm = ({ onSubmit }: PropertyQuoteFormProps) => {
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
          Cotizar esta propiedad
        </h2>
        <p id={descriptionId} className="text-sm text-pretty text-muted-foreground">
          Recibe en tu correo un valor estimado en segundos.
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

      <CheckboxField
        // Se abren en otra pestaña: salir de la ficha haría perder lo que ya se escribió en el formulario.
        label={
          <span>
            Acepto los{' '}
            {/* `leading-none`, como la etiqueta: con el interlineado de un botón la casilla crecería. */}
            <TextLink to={ROUTES.terms} target="_blank" rel="noopener noreferrer" className="leading-none font-normal">
              términos y condiciones
            </TextLink>
          </span>
        }
        error={errors.acceptsTerms}
        name="terms"
        checked={values.acceptsTerms}
        onChange={(checked) => change('acceptsTerms', checked)}
        readOnly={isSending}
      />

      {/* Ya enviada, repetirla no mandaría nada: el botón vuelve a activarse al cambiar algún dato. */}
      <SubmitButton
        isSubmitting={isSending}
        disabled={status === 'sent'}
        icon={ReceiptText}
        submittingLabel="Enviando…"
      >
        Cotizar
      </SubmitButton>

      <QuoteFormAlert status={status} />
    </form>
  )
}

export default PropertyQuoteForm
