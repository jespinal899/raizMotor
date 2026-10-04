import FormField from '@/components/FormField'
import TextField from '@/components/TextField'
import { Textarea } from '@/components/ui/textarea'
import type { PublicationFieldsProps } from '@/features/properties/hooks/usePublicationForm'
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH } from '@/features/properties/utils/publicationValidation'

const PublicationListingFields = ({ values, errors, change }: PublicationFieldsProps) => {
  return (
    <>
      <TextField
        label="Título de la publicación"
        name="title"
        placeholder="Ej.: Casa de 3 cuartos con patio"
        maxLength={MAX_TITLE_LENGTH}
        value={values.title}
        onChange={(title) => change('title', title)}
        error={errors.title}
      />

      <FormField label="Descripción" error={errors.description}>
        {(control) => (
          <Textarea
            {...control}
            name="description"
            rows={6}
            maxLength={MAX_DESCRIPTION_LENGTH}
            placeholder="Cuenta qué la hace especial: distribución, acabados, servicios y lo que tiene cerca."
            value={values.description}
            onChange={(event) => change('description', event.target.value)}
            className="min-h-36"
          />
        )}
      </FormField>
    </>
  )
}

export default PublicationListingFields
