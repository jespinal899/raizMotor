import TextField from '@/components/TextField'

interface EmailFieldProps {
  value: string
  error?: string
  /** Para bloquearlo mientras el acceso está en curso. */
  readOnly?: boolean
  onChange: (value: string) => void
}

/** Correo de la cuenta: el mismo campo al iniciar sesión y al registrarse. */
const EmailField = ({ value, error, readOnly, onChange }: EmailFieldProps) => {
  return (
    <TextField
      label="Correo"
      error={error}
      type="email"
      name="email"
      autoComplete="email"
      placeholder="nombre@gmail.com"
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  )
}

export default EmailField
