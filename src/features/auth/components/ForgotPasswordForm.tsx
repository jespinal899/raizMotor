import type { FormEvent } from 'react'
import { CircleAlert, MailCheck, Send, ShieldAlert } from 'lucide-react'
import CaptchaWidget from '@/components/CaptchaWidget'
import EmailField from '@/components/EmailField'
import StatusAlert from '@/components/StatusAlert'
import SubmitButton from '@/components/SubmitButton'
import { FieldGroup } from '@/components/ui/field'
import { usePasswordResetRequestForm } from '@/features/auth/hooks/usePasswordResetRequestForm'

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>
}

/** Pide el correo de la cuenta para enviarle el enlace con el que elegir otra contraseña. */
const ForgotPasswordForm = ({ onSubmit }: ForgotPasswordFormProps) => {
  const { values, errors, status, change, submit } = usePasswordResetRequestForm({ onSubmit })
  const isSubmitting = status === 'submitting'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  // No dice si el correo tiene cuenta: quien pregunta por uno ajeno no debe poder averiguarlo.
  if (status === 'sent') {
    return (
      <StatusAlert
        role="status"
        icon={MailCheck}
        title="Revisa tu correo"
        description={`Si hay una cuenta con ${values.email.trim()}, te enviamos un enlace para elegir otra contraseña. Si no lo ves en unos minutos, revisa el correo no deseado.`}
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
          Enviar enlace
        </SubmitButton>

        {status === 'captcha' && (
          <StatusAlert
            icon={ShieldAlert}
            title="No pudimos comprobar que no eres un robot"
            description="Si aparece una casilla encima del botón, márcala. Si no, vuelve a intentarlo en unos segundos."
            variant="destructive"
          />
        )}

        {status === 'failed' && (
          <StatusAlert
            icon={CircleAlert}
            title="Algo salió mal"
            description="No pudimos enviar el enlace. Inténtalo de nuevo en unos minutos."
            variant="destructive"
          />
        )}
      </FieldGroup>
    </form>
  )
}

export default ForgotPasswordForm
