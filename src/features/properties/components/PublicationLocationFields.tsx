import FormSelect from '@/components/FormSelect'
import TextField from '@/components/TextField'
import LocationPicker from '@/features/properties/components/LocationPicker'
import { DEPARTMENT_OPTIONS } from '@/features/properties/data/departments.data'
import type { PublicationFieldsProps } from '@/features/properties/hooks/usePublicationForm'
import { getDepartmentView } from '@/features/properties/utils/departments'

const PublicationLocationFields = ({ values, errors, change }: PublicationFieldsProps) => {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormSelect
          label="Departamento"
          placeholder="Selecciona un departamento"
          options={DEPARTMENT_OPTIONS}
          value={values.department}
          onChange={(department) => change('department', department)}
          error={errors.department}
        />
        <TextField
          label="Ciudad"
          name="city"
          autoComplete="address-level2"
          value={values.city}
          onChange={(city) => change('city', city)}
          error={errors.city}
        />
        <TextField
          label="Colonia o barrio"
          name="neighborhood"
          autoComplete="address-level3"
          value={values.neighborhood}
          onChange={(neighborhood) => change('neighborhood', neighborhood)}
          error={errors.neighborhood}
        />
        <TextField
          label="Dirección"
          name="address"
          autoComplete="street-address"
          placeholder="Calle, bloque o número de casa"
          value={values.address}
          onChange={(address) => change('address', address)}
          error={errors.address}
        />
      </div>

      <LocationPicker
        view={getDepartmentView(values.department)}
        value={values.coordinates}
        onChange={(point) => change('coordinates', point)}
        error={errors.coordinates}
      />
    </>
  )
}

export default PublicationLocationFields
