import TextField from '@/components/TextField'
import type { AccountProfile } from '@/features/auth/types/auth.types'
import { MAX_NAME_LENGTH } from '@/features/auth/utils/registerValidation'

type Names = Pick<AccountProfile, 'firstName' | 'lastName'>

interface NameFieldsProps {
  values: Names
  errors: Partial<Names>
  onChange: (field: keyof Names, value: string) => void
  readOnly?: boolean
}

/** Nombre y apellido, lado a lado: los piden igual el registro y la página de la cuenta. */
const NameFields = ({ values, errors, onChange, readOnly }: NameFieldsProps) => {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField
        label="Nombre"
        error={errors.firstName}
        name="firstName"
        autoComplete="given-name"
        maxLength={MAX_NAME_LENGTH}
        value={values.firstName}
        onChange={(value) => onChange('firstName', value)}
        readOnly={readOnly}
      />
      <TextField
        label="Apellido"
        error={errors.lastName}
        name="lastName"
        autoComplete="family-name"
        maxLength={MAX_NAME_LENGTH}
        value={values.lastName}
        onChange={(value) => onChange('lastName', value)}
        readOnly={readOnly}
      />
    </div>
  )
}

export default NameFields
