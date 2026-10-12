import type { FormEvent } from 'react'
import { MailCheck, ShieldCheck } from 'lucide-react'
import CaptchaWidget from '@/components/CaptchaWidget'
import StatusAlert from '@/components/StatusAlert'
import SubmitButton from '@/components/SubmitButton'
import { FieldGroup } from '@/components/ui/field'
import CodeField from '@/features/auth/components/CodeField'
import CodeFailureAlert from '@/features/auth/components/CodeFailureAlert'
import ResendCode from '@/features/auth/components/ResendCode'
import { useEmailCodeForm } from '@/features/auth/hooks/useEmailCodeForm'

interface PasswordCodeFormProps {
  /** El correo al que se envió el código. */
  email: string
  /** Comprueba el código; se rechaza si no vale. */
  onSubmit: (code: string) => Promise<void>
  /** Envía otro código al mismo correo. */
  onResend: () => Promise<void>
}

/** Primero el código que llegó al correo: solo si es correcto se deja elegir otra contraseña. */
const PasswordCodeForm = ({ email, onSubmit, onResend }: PasswordCodeFormProps) => {
  const { values, errors, status, change, submit } = useEmailCodeForm({ onSubmit })
  const isSubmitting = status === 'submitting'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  return (
    <form noValidate aria-label="Formulario para verificar el código" onSubmit={handleSubmit}>
      <FieldGroup>
        {/* No dice si el correo tiene cuenta: quien pregunta por uno ajeno no debe poder averiguarlo. */}
        <StatusAlert
          role="status"
          icon={MailCheck}
          title="Revisa tu correo"
          description={`Si hay una cuenta con ${email}, te enviamos un código de 6 dígitos. Vence en 15 minutos. Si no lo ves, revisa el correo no deseado.`}
        />

        <CodeField value={values.code} error={errors.code} onChange={(value) => change('code', value)} readOnly={isSubmitting} />

        <SubmitButton isSubmitting={isSubmitting} icon={ShieldCheck} submittingLabel="Verificando…">
          Verificar código
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
