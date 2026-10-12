import type { FormEvent } from 'react'
import { KeyRound, MailCheck } from 'lucide-react'
import CaptchaWidget from '@/components/CaptchaWidget'
import PasswordField from '@/components/PasswordField'
import StatusAlert from '@/components/StatusAlert'
import SubmitButton from '@/components/SubmitButton'
import { FieldGroup } from '@/components/ui/field'
import CodeField from '@/features/auth/components/CodeField'
import CodeFailureAlert from '@/features/auth/components/CodeFailureAlert'
import ResendCode from '@/features/auth/components/ResendCode'
import { usePasswordCodeForm } from '@/features/auth/hooks/usePasswordCodeForm'
import { MIN_PASSWORD_LENGTH } from '@/features/auth/utils/credentialRules'

interface PasswordCodeFormProps {
  /** El correo al que se envió el código. */
  email: string
  onSubmit: (reset: { code: string; password: string }, operationKey: string) => Promise<void>
  /** Envía otro código al mismo correo. */
  onResend: () => Promise<void>
}

/** Con el código que llegó al correo, elige otra contraseña. */
const PasswordCodeForm = ({ email, onSubmit, onResend }: PasswordCodeFormProps) => {
  const { values, errors, status, change, submit } = usePasswordCodeForm({ onSubmit })
  const isSubmitting = status === 'submitting'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  return (
    <form noValidate aria-label="Formulario para elegir otra contraseña" onSubmit={handleSubmit}>
      <FieldGroup>
        {/* No dice si el correo tiene cuenta: quien pregunta por uno ajeno no debe poder averiguarlo. */}
        <StatusAlert
          role="status"
          icon={MailCheck}
          title="Revisa tu correo"
          description={`Si hay una cuenta con ${email}, te enviamos un código de 6 dígitos. Vence en 15 minutos. Si no lo ves, revisa el correo no deseado.`}
        />

        <CodeField value={values.code} error={errors.code} onChange={(value) => change('code', value)} readOnly={isSubmitting} />

        <PasswordField
          label="Contraseña nueva"
          hint={`mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
          error={errors.password}
          name="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          value={values.password}
          onChange={(value) => change('password', value)}
          readOnly={isSubmitting}
        />

        <PasswordField
          label="Repite la contraseña nueva"
          error={errors.confirmation}
          name="confirmation"
          autoComplete="new-password"
          value={values.confirmation}
          onChange={(value) => change('confirmation', value)}
          readOnly={isSubmitting}
        />

        <SubmitButton isSubmitting={isSubmitting} icon={KeyRound} submittingLabel="Guardando…">
          Guardar contraseña
        </SubmitButton>

        <CodeFailureAlert status={status} />

        {/* Reenviar un código lleva la verificación contra bots, como pedir el primero. */}
        <CaptchaWidget />
        <ResendCode onResend={onResend} />
      </FieldGroup>
    </form>
  )
}

export default PasswordCodeForm
