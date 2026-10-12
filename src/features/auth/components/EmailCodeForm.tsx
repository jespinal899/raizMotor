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

interface EmailCodeFormProps {
  /** El correo al que se envió el código. */
  email: string
  /** Confirma la cuenta con el código; se rechaza si no vale. */
  onSubmit: (code: string) => Promise<void>
  /** Envía otro código al mismo correo. */
  onResend: () => Promise<void>
  /**
   * Si el código acaba de enviarse, al registrarse. Quien llega desde el inicio de sesión recibió el suyo al
   * registrarse, tal vez hace tiempo: puede pedir otro en el acto.
   */
  justSent?: boolean
}

/** Confirma una cuenta recién creada con el código de 6 dígitos que llegó a su correo. */
const EmailCodeForm = ({ email, onSubmit, onResend, justSent = true }: EmailCodeFormProps) => {
  const { values, errors, status, change, submit } = useEmailCodeForm({ onSubmit })
  const isSubmitting = status === 'submitting'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  return (
    <form noValidate aria-label="Formulario para confirmar la cuenta" onSubmit={handleSubmit}>
      <FieldGroup>
        <StatusAlert
          role="status"
          icon={MailCheck}
          title={justSent ? 'Revisa tu correo' : 'Confirma tu correo para entrar'}
          description={
            justSent
              ? `Te enviamos un código de 6 dígitos a ${email}. Escríbelo aquí para activar tu cuenta; vence en 15 minutos. Si no lo ves, revisa el correo no deseado.`
              : `Tu cuenta aún no está activa. Escribe el código de 6 dígitos que te enviamos a ${email} al registrarte o, si ya venció, pide otro.`
          }
        />

        <CodeField value={values.code} error={errors.code} onChange={(value) => change('code', value)} readOnly={isSubmitting} />

        <SubmitButton isSubmitting={isSubmitting} icon={ShieldCheck} submittingLabel="Confirmando…">
          Confirmar mi cuenta
        </SubmitButton>

        <CodeFailureAlert status={status} />

        {/* Reenviar un código lleva la verificación contra bots, como registrarse. */}
        <CaptchaWidget />
        <ResendCode onResend={onResend} justSent={justSent} />
      </FieldGroup>
    </form>
  )
}

export default EmailCodeForm
