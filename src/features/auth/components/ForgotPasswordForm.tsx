import { useState } from 'react'
import type { FormEvent } from 'react'
import { CircleAlert, Send, ShieldAlert, ShieldCheck, Timer } from 'lucide-react'
import CaptchaWidget from '@/components/CaptchaWidget'
import EmailField from '@/components/EmailField'
import StatusAlert from '@/components/StatusAlert'
import SubmitButton from '@/components/SubmitButton'
import { FieldGroup } from '@/components/ui/field'
import NewPasswordForm from '@/features/auth/components/NewPasswordForm'
import PasswordCodeForm from '@/features/auth/components/PasswordCodeForm'
import { usePasswordResetRequestForm } from '@/features/auth/hooks/usePasswordResetRequestForm'

interface ForgotPasswordFormProps {
  /** Envía el código al correo; se rechaza si no se pudo. */
  onSubmit: (email: string) => Promise<void>
  /** Comprueba el código que llegó al correo; se rechaza si no vale. */
  onVerify: (email: string, code: string) => Promise<void>
  /** Guarda la contraseña nueva, una vez comprobado el código; se rechaza si no se pudo. */
  onChangePassword: (password: string, operationKey: string) => Promise<void>
}

/**
 * Recuperar la contraseña en tres pasos: primero el correo, al que llega un código de 6 dígitos; después el
 * código, y solo si es correcto, la contraseña nueva.
 */
const ForgotPasswordForm = ({ onSubmit, onVerify, onChangePassword }: ForgotPasswordFormProps) => {
  const { values, errors, status, change, submit } = usePasswordResetRequestForm({ onSubmit })
  const [codeVerified, setCodeVerified] = useState(false)
  const isSubmitting = status === 'submitting'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  if (codeVerified) {
    return (
      <>
        <StatusAlert
          role="status"
          icon={ShieldCheck}
          title="Código verificado"
          description="Ahora elige tu contraseña nueva."
        />
        <NewPasswordForm onSubmit={onChangePassword} />
      </>
    )
  }

  if (status === 'sent') {
    const email = values.email.trim()

    return (
      <PasswordCodeForm
        email={email}
        onSubmit={async (code) => {
          await onVerify(email, code)
          setCodeVerified(true)
        }}
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
