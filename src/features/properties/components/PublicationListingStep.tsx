import FormSection from '@/components/FormSection'
import PublicationListingFields from '@/features/properties/components/PublicationListingFields'
import type { PublicationFieldsProps } from '@/features/properties/hooks/usePublicationForm'

/** Paso 2: cómo se presenta el anuncio. */
const PublicationListingStep = ({ values, errors, change }: PublicationFieldsProps) => {
  return (
    <FormSection
      titleAs="h3"
      title="Título y descripción"
      description="Lo primero que verán las personas interesadas."
    >
      <PublicationListingFields values={values} errors={errors} change={change} />
    </FormSection>
  )
}

export default PublicationListingStep
