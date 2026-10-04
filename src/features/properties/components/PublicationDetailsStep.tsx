import FormSection from '@/components/FormSection'
import ImagePicker from '@/features/properties/components/ImagePicker'
import PublicationPricingFields from '@/features/properties/components/PublicationPricingFields'
import type { PublicationFieldsProps } from '@/features/properties/hooks/usePublicationForm'

/** Paso 3: lo que falta para publicar. */
const PublicationDetailsStep = ({ values, errors, change }: PublicationFieldsProps) => {
  return (
    <>
      <FormSection titleAs="h3" title="Operación y precio">
        <PublicationPricingFields values={values} errors={errors} change={change} />
      </FormSection>

      <FormSection titleAs="h3" title="Fotos" description="La primera foto será la portada del anuncio.">
        <ImagePicker files={values.images} onChange={(images) => change('images', images)} error={errors.images} />
      </FormSection>
    </>
  )
}

export default PublicationDetailsStep
