import TextField from '@/components/TextField'
import { CODE_LENGTH, toCode } from '@/features/auth/utils/credentialRules'

interface CodeFieldProps {
  value: string
  error?: string
  readOnly?: boolean
  onChange: (value: string) => void
}

/**
 * El código de 6 dígitos que llegó al correo. Acepta solo números, aunque se pegue con espacios, y el teclado
 * del teléfono ofrece el código si el correo lo trae.
 */
const CodeField = ({ value, error, readOnly, onChange }: CodeFieldProps) => {
  return (
    <TextField
      label="Código de verificación"
      hint={`${CODE_LENGTH} dígitos`}
      error={error}
      name="code"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={CODE_LENGTH}
      className="text-center text-lg tracking-[0.4em]"
      value={value}
      onChange={(next) => onChange(toCode(next))}
      readOnly={readOnly}
    />
  )
}

export default CodeField
