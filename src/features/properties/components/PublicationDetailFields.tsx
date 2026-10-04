import ChoiceGroup from '@/components/ChoiceGroup'
import type { ChoiceOption } from '@/components/ChoiceGroup'
import TextField from '@/components/TextField'
import { PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import type { PublicationFieldsProps } from '@/features/properties/hooks/usePublicationForm'
import type { PropertyType } from '@/features/properties/types/property.types'
import type { DetailField } from '@/features/properties/types/publication.types'
import { getDetailFields } from '@/features/properties/utils/propertyDetailFields'

const TYPE_OPTIONS: ChoiceOption<PropertyType>[] = (Object.keys(PROPERTY_TYPES) as PropertyType[]).map((type) => ({
  value: type,
  label: PROPERTY_TYPES[type].label,
  icon: PROPERTY_TYPES[type].icon,
}))

interface DetailInput {
  label: string
  /** Unidad de medida. */
  hint?: string
  /** Las superficies admiten decimales; las cantidades, no. */
  step: 'any' | 1
}

const DETAIL_INPUTS: Record<DetailField, DetailInput> = {
  builtArea: { label: 'Superficie construida', hint: 'm²', step: 'any' },
  landArea: { label: 'Superficie del terreno', hint: 'm²', step: 'any' },
  bedrooms: { label: 'Cuartos', step: 1 },
  bathrooms: { label: 'Baños', step: 1 },
}

const PublicationDetailFields = ({ values, errors, change }: PublicationFieldsProps) => {
  const detailFields = getDetailFields(values.type)

  return (
    <>
      <ChoiceGroup
        label="Tipo de propiedad"
        options={TYPE_OPTIONS}
        value={values.type}
        onChange={(type) => change('type', type)}
        error={errors.type}
      />

      {detailFields.length === 0 ? (
        <p className="text-sm text-muted-foreground">Elige el tipo de propiedad para indicar sus medidas.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {detailFields.map((field) => (
            <TextField
              key={field}
              {...DETAIL_INPUTS[field]}
              name={field}
              type="number"
              inputMode={DETAIL_INPUTS[field].step === 1 ? 'numeric' : 'decimal'}
              min={0}
              value={values[field]}
              onChange={(value) => change(field, value)}
              error={errors[field]}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default PublicationDetailFields
