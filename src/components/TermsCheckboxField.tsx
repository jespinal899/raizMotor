import CheckboxField from '@/components/CheckboxField'
import TextLink from '@/components/TextLink'
import { ROUTES } from '@/shared/constants/routes'

interface TermsCheckboxFieldProps {
  checked: boolean
  error?: string
  /** Para bloquearla mientras el envío está en curso. */
  readOnly?: boolean
  /** Recibe si queda marcada, no el evento. */
  onChange: (checked: boolean) => void
}

/** Casilla para aceptar los términos y condiciones, con el enlace para leerlos. */
const TermsCheckboxField = ({ checked, error, readOnly, onChange }: TermsCheckboxFieldProps) => {
  return (
    <CheckboxField
      // Se abren en otra pestaña: salir de la página haría perder lo que ya se escribió en el formulario.
      label={
        <span>
          Acepto los{' '}
          {/* `leading-none`, como la etiqueta: con el interlineado de un botón la casilla crecería. */}
          <TextLink to={ROUTES.terms} target="_blank" rel="noopener noreferrer" className="leading-none font-normal">
            términos y condiciones
          </TextLink>
        </span>
      }
      error={error}
      name="terms"
      checked={checked}
      onChange={onChange}
      readOnly={readOnly}
    />
  )
}

export default TermsCheckboxField
