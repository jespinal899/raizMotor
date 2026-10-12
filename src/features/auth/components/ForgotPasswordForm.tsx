import type { FormEvent } from 'react'
import { CircleAlert, Send, ShieldAlert, Timer } from 'lucide-react'
import CaptchaWidget from '@/components/CaptchaWidget'
import EmailField from '@/components/EmailField'
import StatusAlert from '@/components/StatusAlert'
import SubmitButton from '@/components/SubmitButton'
import { FieldGroup } from '@/components/ui/field'
import PasswordCodeForm from '@/features/auth/components/PasswordCodeForm'
import { usePasswordResetRequestForm } from '@/features/auth/hooks/usePasswordResetRequestForm'

interface ForgotPasswordFormProps {
  /** Envía el código al correo; se rechaza si no se pudo. */
  onSubmit: (email: string) => Promise<void>
  /** Con el código, guarda la contraseña nueva; se rechaza si el código no vale. */
  onReset: (reset: { email: string; code: string; password: string }, operationKey: string) => Promise<void>
}

/**
 * Recuperar la contraseña en dos pasos: primero el correo, al que llega un código de 6 dígitos, y después el
 * código con la contraseña nueva.
 */
const ForgotPasswordForm = ({ onSubmit, onReset }: ForgotPasswordFormProps) => {
  const { values, errors, status, change, submit } = usePasswordResetRequestForm({ onSubmit })
  const isSubmitting = status === 'submitting'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  if (status === 'sent') {
    const email = values.email.trim()

    return (
      <PasswordCodeForm
        email={email}
        onSubmit={(reset, operationKey) => onReset({ email, ...reset }, operationKey)}
        onResend={() => onSubmit(email)}
      />
    )
  }

  return (
    <form noValidate aria-label="Formulario para recuperar la contraseña" onSubmit={handleSubmit}>
      <FieldGroup>
        <EmailField
          value={values.email}
          error={errors.email}
          onChange={(value) => change('email', value)}
          readOnly={isSubmitting}
        />

        <CaptchaWidget />

        <SubmitButton isSubmitting={isSubmitting} icon={Send} submittingLabel="Enviando…">
          Enviar código
        </SubmitButton>

        {status === 'captcha' && (
          <StatusAlert
            icon={ShieldAlert}
            title="No pudimos comprobar que no eres un robot"
            description="Si aparece una casilla encima del botón, márcala. Si no, vuelve a intentarlo en unos segundos."
            variant="destructive"
          />
        )}

        {status === 'tooSoon' && (
          <StatusAlert
            icon={Timer}
            title="Espera un momento"
            description="Acabamos de enviarte un código. Podrás pedir otro en un minuto."
          />
        )}

        {status === 'failed' && (
          <StatusAlert
            icon={CircleAlert}
            title="Algo salió mal"
            description="No pudimos enviar el código. Inténtalo de nuevo en unos minutos."
            variant="destructive"
          />
        )}
      </FieldGroup>
    </form>
  )
}

export default ForgotPasswordForm
