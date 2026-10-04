import ChoiceGroup from '@/components/ChoiceGroup'
import type { ChoiceOption } from '@/components/ChoiceGroup'
import TextField from '@/components/TextField'
import { OPERATIONS } from '@/features/properties/data/propertyOptions.data'
import type { PublicationFieldsProps } from '@/features/properties/hooks/usePublicationForm'
import type { PropertyOperation } from '@/features/properties/types/property.types'

const OPERATION_OPTIONS: ChoiceOption<PropertyOperation>[] = (Object.keys(OPERATIONS) as PropertyOperation[]).map(
  (operation) => ({ value: operation, label: OPERATIONS[operation].label }),
)

/** El precio de un alquiler es mensual; el de una venta, el total. */
const PRICE_UNITS: Record<PropertyOperation | '', string> = {
  '': 'USD',
  venta: 'USD',
  alquiler: 'USD al mes',
}

const PublicationPricingFields = ({ values, errors, change }: PublicationFieldsProps) => {
  return (
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
  )
}

export default PublicationPricingFields
