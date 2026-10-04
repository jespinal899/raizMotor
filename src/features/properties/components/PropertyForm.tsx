import type { FormEvent } from 'react'
import { Upload } from 'lucide-react'
import FormSection from '@/components/FormSection'
import SubmitButton from '@/components/SubmitButton'
import ImagePicker from '@/features/properties/components/ImagePicker'
import PublicationAlert from '@/features/properties/components/PublicationAlert'
import PublicationDetailFields from '@/features/properties/components/PublicationDetailFields'
import PublicationListingFields from '@/features/properties/components/PublicationListingFields'
import PublicationLocationFields from '@/features/properties/components/PublicationLocationFields'
import { usePublicationForm } from '@/features/properties/hooks/usePublicationForm'
import type { PropertyPublication } from '@/features/properties/types/publication.types'
import { useInvalidFieldFocus } from '@/hooks/useInvalidFieldFocus'
import { hasErrors } from '@/shared/utils/validators'

interface PropertyFormProps {
  onSubmit: (publication: PropertyPublication) => Promise<void>
}

const PropertyForm = ({ onSubmit }: PropertyFormProps) => {
  const { values, errors, status, change, submit } = usePublicationForm({ onSubmit })
  const { containerRef, focusFirstInvalid } = useInvalidFieldFocus<HTMLFormElement>()
  const fields = { values, errors, change }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await submit()
    // El formulario es largo: sin esto, los errores de arriba quedarían fuera de la vista.
    focusFirstInvalid()
  }

  return (
    <form
      ref={containerRef}
      noValidate
      aria-label="Formulario para publicar una propiedad"
      onSubmit={(event) => void handleSubmit(event)}
      className="grid gap-6"
    >
      <FormSection title="Ubicación" description="Indica dónde está la propiedad y marca el punto exacto en el mapa.">
        <PublicationLocationFields {...fields} />
      </FormSection>

      <FormSection title="Características" description="Los datos que se piden cambian según el tipo de propiedad.">
        <PublicationDetailFields {...fields} />
      </FormSection>

      <FormSection title="Anuncio" description="Lo que verán las personas interesadas.">
        <PublicationListingFields {...fields} />
      </FormSection>

      <FormSection title="Fotos" description="La primera foto será la portada del anuncio.">
        <ImagePicker files={values.images} onChange={(images) => change('images', images)} error={errors.images} />
      </FormSection>

      <div className="grid gap-4">
        {hasErrors(errors) && (
          <p className="text-sm text-destructive">Revisa los campos marcados antes de publicar.</p>
        )}
        <SubmitButton
          isSubmitting={status === 'submitting'}
          icon={Upload}
          submittingLabel="Publicando…"
          className="justify-self-start px-6"
        >
          Publicar propiedad
        </SubmitButton>
        <PublicationAlert status={status} />
      </div>
    </form>
  )
}

export default PropertyForm
