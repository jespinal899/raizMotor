import ChoiceGroup from '@/components/ChoiceGroup'
import type { ChoiceOption } from '@/components/ChoiceGroup'
import FormField from '@/components/FormField'
import TextField from '@/components/TextField'
import { Textarea } from '@/components/ui/textarea'
import { OPERATIONS } from '@/features/properties/data/propertyOptions.data'
import type { PublicationFieldsProps } from '@/features/properties/hooks/usePublicationForm'
import type { PropertyOperation } from '@/features/properties/types/property.types'
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH } from '@/features/properties/utils/publicationValidation'

const OPERATION_OPTIONS: ChoiceOption<PropertyOperation>[] = (Object.keys(OPERATIONS) as PropertyOperation[]).map(
  (operation) => ({ value: operation, label: OPERATIONS[operation].label }),
)

/** El precio de un alquiler es mensual; el de una venta, el total. */
const PRICE_UNITS: Record<PropertyOperation | '', string> = {
  '': 'USD',
  venta: 'USD',
  alquiler: 'USD al mes',
}

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
            rows={5}
            maxLength={MAX_DESCRIPTION_LENGTH}
            placeholder="Cuenta qué la hace especial: distribución, acabados, servicios y lo que tiene cerca."
            value={values.description}
            onChange={(event) => change('description', event.target.value)}
            className="min-h-32"
          />
        )}
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <ChoiceGroup
          label="Tipo de operación"
          options={OPERATION_OPTIONS}
          value={values.operation}
          onChange={(operation) => change('operation', operation)}
          error={errors.operation}
        />
        <TextField
          label="Precio"
          hint={PRICE_UNITS[values.operation]}
          name="price"
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={values.price}
          onChange={(price) => change('price', price)}
          error={errors.price}
        />
      </div>
    </>
  )
}

export default PublicationListingFields
