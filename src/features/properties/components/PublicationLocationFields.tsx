import type { Ref } from 'react'
import FormSelect from '@/components/FormSelect'
import TextField from '@/components/TextField'
import { DEPARTMENT_OPTIONS } from '@/features/properties/data/departments.data'
import type { PublicationFieldsProps } from '@/features/properties/hooks/usePublicationForm'
import { getCityOptions, isDepartmentId } from '@/features/properties/utils/departments'
import { MAX_ADDRESS_LENGTH, MAX_NEIGHBORHOOD_LENGTH } from '@/features/properties/utils/publicationValidation'

interface PublicationLocationFieldsProps extends PublicationFieldsProps {
  /** Para devolver el foco a estos datos cuando la persona decide editar la ubicación. */
  ref?: Ref<HTMLDivElement>
}

const PublicationLocationFields = ({ values, errors, change, ref }: PublicationLocationFieldsProps) => {
  const hasDepartment = isDepartmentId(values.department)

  return (
    <div ref={ref} className="grid gap-5 sm:grid-cols-2">
      <FormSelect
        label="Departamento"
        placeholder="Selecciona un departamento"
        options={DEPARTMENT_OPTIONS}
        value={values.department}
        onChange={(department) => change('department', department)}
        error={errors.department}
      />
      <FormSelect
        label="Ciudad"
        placeholder={hasDepartment ? 'Selecciona una ciudad' : 'Elige primero el departamento'}
        options={getCityOptions(values.department)}
        value={values.city}
        onChange={(city) => change('city', city)}
        error={errors.city}
        disabled={!hasDepartment}
      />
      <TextField
        label="Colonia, barrio o residencial"
        name="neighborhood"
        autoComplete="address-level3"
        maxLength={MAX_NEIGHBORHOOD_LENGTH}
        value={values.neighborhood}
        onChange={(neighborhood) => change('neighborhood', neighborhood)}
        error={errors.neighborhood}
      />
      <TextField
        label="Dirección"
        name="address"
        autoComplete="street-address"
        placeholder="Calle, bloque o número de casa"
        maxLength={MAX_ADDRESS_LENGTH}
        value={values.address}
        onChange={(address) => change('address', address)}
        error={errors.address}
      />
    </div>
  )
}

export default PublicationLocationFields
